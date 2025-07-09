import { Controller, Post, Req, Res, Headers, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { WorkflowClient } from '@temporalio/client/lib/workflow-client';
import { PaymentService } from './payment.service';
import { Decimal } from '@prisma/client/runtime/library';
import { WorkflowNotFoundError } from '@temporalio/client';

@Controller('webhook')
export class StripeWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  constructor(
    private paymentService: PaymentService,
    @Inject('TEMPORAL_CLIENT') private readonly temporalClient: WorkflowClient,
  ) {}

  @Post()
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        (req as any).body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error('❌ Invalid Stripe signature:', err.message);
      return res.status(400).send('Invalid signature');
    }

    let orderId: string | undefined;
    let paymentIntentId: string | undefined;
    let status = 'PENDING';
    let signal: string | undefined;

    // Only handle events you expect
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('✅ Stripe event received:', event.type, session.id);

      orderId = session.metadata?.orderId;
      paymentIntentId = session.payment_intent as string;

      if (!orderId) {
        console.error('⚠️ Missing orderId in metadata');
        return res.sendStatus(400);
      }

      const amount = new Decimal((session.amount_total ?? 0) / 100);
      const method = session.payment_method_types?.[0] ?? 'unknown';

      await this.paymentService.recordPayment(
        orderId,
        session.id,
        amount,
        method,
      );

      if (event.type === 'checkout.session.completed') {
        status = 'PAID';
        signal = 'paymentSuccess';
      } else {
        status = 'FAILED';
        signal = 'paymentFailed';
      }

      await this.paymentService.updatePayment(status, orderId);

      const handle = this.temporalClient.getHandle(`order-${orderId}`);
      try {
        console.log('🔔 paymentIntentId:', paymentIntentId);
        await handle.signal('setPaymentIntent', paymentIntentId);
        await handle.signal(signal);
      } catch (err) {
        if (err instanceof WorkflowNotFoundError) {
          console.error('⚠️ Workflow not found:', err.message);
          // Optional: schedule refund fallback here
        } else {
          throw err;
        }
      }
    }

    return res.sendStatus(200);
  }
}
