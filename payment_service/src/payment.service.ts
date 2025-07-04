import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async recordPayment(
    orderId: string,
    amount: Decimal,
    method: string,
  ): Promise<{ message: string }> {
    try {
      console.log('Logging payment details - SERVICE:', {
        orderId: BigInt(orderId),
        amount,
        method,
      });
      await this.prisma.payment.create({
        data: {
          orderId: BigInt(orderId),
          amount,
          status: 'PAID',
          method,
        },
      });
      return { message: 'success' };
    } catch (error) {
      throw new RpcException({
        code: 10, // ABORTED
        message: error.message,
      });
    }
  }
}
