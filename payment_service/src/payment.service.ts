import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async recordPayment(
    orderId: string,
    sessionId: string,
    amount: Decimal,
    method: string,
  ): Promise<{ message: string }> {
    try {
      await this.prisma.payment.create({
        data: {
          orderId: BigInt(orderId),
          sessionId,
          amount,
          method,
        },
      });
      return { message: 'Pending Payment' };
    } catch (error) {
      throw new RpcException({
        code: 10, // ABORTED
        message: error.message,
      });
    }
  }

  async updatePayment(status: string, orderId: string) {
    try {
      await this.prisma.payment.update({
        where: {
          orderId: BigInt(orderId),
        },
        data: {
          status,
        },
      });
      return { message: `Payment status updated to ${status}` };
    } catch (error) {
      throw new Error(`Failed to update payment status: ${error.message}`);
    }
  }
}
