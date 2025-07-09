import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { GrpcMethod } from '@nestjs/microservices';
import { Decimal } from '@prisma/client/runtime/library';
import Stripe from 'stripe';
import { CreateCheckoutSessionDto } from '@shared/interface/PaymentServiceClient.interface';

@Controller()
export class PaymentGRPCController {
  constructor(private readonly paymentService: PaymentService) {}
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  @GrpcMethod('PaymentService', 'recordPayment')
  recordPayment(data: {
    orderId: string;
    sessionId: string;
    amount: Decimal;
    method: string;
  }) {
    return this.paymentService.recordPayment(
      data.orderId,
      data.sessionId,
      data.amount,
      data.method,
    );
  }

  @GrpcMethod('PaymentService', 'CreateCheckoutSession')
  async createCheckoutSession(
    data: CreateCheckoutSessionDto,
  ): Promise<{ url: string }> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(Number(data.amount) * 100),
            product_data: {
              name: `Order ID: ${data.orderId}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,

      // 🔐 Attach your orderId here
      metadata: {
        orderId: data.orderId,
      },
    });

    console.log('Stripe Checkout Session Created:', session.url);

    return { url: session.url ?? '' };
  }

  @GrpcMethod('PaymentService', 'RefundPayment')
  async refundPayment(data: { paymentIntentId: string }): Promise<void> {
    try {
      console.log(
        '🔄 Initiating refund for Payment Intent:',
        data.paymentIntentId,
      );
      await this.stripe.refunds.create({
        payment_intent: data.paymentIntentId,
      });
      console.log('✅ Refund successful');
    } catch (err) {
      console.error('❌ Refund failed:', err.message);
      throw err;
    }
  }
}
