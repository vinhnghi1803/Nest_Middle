import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { GrpcMethod } from '@nestjs/microservices';
import { Decimal } from '@prisma/client/runtime/library';

@Controller()
export class PaymentGRPCController {
  constructor(private readonly paymentService: PaymentService) {}

  @GrpcMethod('PaymentService', 'recordPayment')
  recordPayment(data: { orderId: string; amount: Decimal; method: string }) {
    return this.paymentService.recordPayment(
      data.orderId,
      data.amount,
      data.method,
    );
  }
}
