import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { OrderItemDto } from './dto/create-order.dto';
// import { UpdateOrderDto } from './dto/update-order.dto';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
// import { NotificationService } from '../notification/notification.service';
import { PrismaService } from './prisma/prisma.service';
import Decimal from 'decimal.js';
import { ClientGrpc } from '@nestjs/microservices';
import { ProductServiceClient } from '@shared/interface/ProductServiceClient.interface';
import { firstValueFrom } from 'rxjs';
import { OrderResponse } from '@shared/interface/OrderServiceClient.interface';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService implements OnModuleInit {
  private productService: ProductServiceClient;
  constructor(
    // private readonly notificationService: NotificationService,

    private prisma: PrismaService,
    @Inject('PRODUCT_SERVICE') private client: ClientGrpc,
  ) {}
  onModuleInit() {
    this.productService =
      this.client.getService<ProductServiceClient>('ProductService');
  }

  findAll() {
    return this.prisma.order.findMany();
  }

  findOne(id: number) {
    const order = this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async createOrderGRPC(
    id: string,
    user: any,
    orderItems: OrderItemDto[],
  ): Promise<OrderResponse> {
    const preparedOrderItems: {
      productId: number;
      quantity: number;
      total: Decimal;
    }[] = [];
    let orderTotal = new Decimal(0);

    for (const item of orderItems) {
      // Fetch product details
      const product = await firstValueFrom(
        this.productService.findOne({ id: item.productId }),
      );

      const total = new Decimal(product.price).mul(item.quantity);
      orderTotal = orderTotal.add(total);

      preparedOrderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        total,
      });
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            id: BigInt(id),
            userId: user.id,
            total: orderTotal,
          },
        });

        await tx.orderItem.createMany({
          data: preparedOrderItems.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            total: item.total,
          })),
        });

        console.log('Order created successfully:', {
          id: BigInt(order.id).toString(),
          status: 'PENDING',
          total: orderTotal,
          orderItems: preparedOrderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        } as OrderResponse);

        // Construct and return a valid OrderResponse object
        return {
          id: BigInt(order.id).toString(),
          status: 'PENDING',
          total: orderTotal,
          orderItems: preparedOrderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        } as OrderResponse;
      });
    } catch (e) {
      console.error('❌ Order creation failed:', e);
      throw e;
    }
  }

  async cancelOrderGRPC(dto: UpdateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: BigInt(dto.orderId) },
        data: { status: dto.status },
      });

      console.log('Order canceled successfully:', updatedOrder);
      return updatedOrder;
    });
  }
}
