import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@shared/guard/auth.guard';
import { PaymentService } from './payment.service';
import { WorkflowClient } from '@temporalio/client';

@Controller('payment')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(
    @Inject('TEMPORAL_CLIENT') private readonly temporalClient: WorkflowClient,
    private readonly paymentService: PaymentService,
  ) {}
  @Post()
  async mockPaymentWebhook(@Body() body: { orderId: string; message: string }) {
    const handle = this.temporalClient.getHandle(`order-${body.orderId}`);
    await handle.signal(body.message);
    return { message: `${body.message} signal sent` };
  }
}
