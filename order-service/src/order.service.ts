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
import { status } from '@grpc/grpc-js';
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

  // async create(userId: number, orderItems: OrderItemDto[]) {
  //   // Fetch all products in one go
  //   const productIds = orderItems.map((item) => item.productId);

  //   const { products } = await firstValueFrom(
  //     this.productService.findMany({ ids: productIds }),
  //   );

  //   const preparedOrderItems: {
  //     productId: number;
  //     quantity: number;
  //     total: Decimal;
  //   }[] = [];
  //   let orderTotal = new Decimal(0);

  //   for (const item of orderItems) {
  //     const product = await firstValueFrom(
  //       this.productService.findOne(item.productId),
  //     );

  //     const total = new Decimal(product.price).mul(item.quantity);
  //     orderTotal = orderTotal.add(total);

  //     preparedOrderItems.push({
  //       productId: product.id,
  //       quantity: item.quantity,
  //       total,
  //     });
  //   }

  //   const runTransaction = async () => {
  //     return this.prisma.$transaction(async (tx) => {
  //       // Lock product rows
  //       const sortedIds = productIds.sort((a, b) => a - b);
  //       await tx.$executeRawUnsafe(`
  //         SELECT * FROM "Product"
  //         WHERE id IN (${sortedIds.join(',')})
  //         FOR UPDATE
  //       `);

  //       // SIMULATE DEADLOCK -------------------------------------------------

  //       //   for (const id of productIds) {
  //       //     await tx.$executeRawUnsafe(`
  //       //   SELECT * FROM "Product"
  //       //   WHERE id = ${id}
  //       //   FOR UPDATE
  //       // `);

  //       //     // Simulate delay after the first lock
  //       //     if (id === productIds[0]) {
  //       //       await new Promise((resolve) => setTimeout(resolve, 3000)); // 3s delay
  //       //     }
  //       //   }
  //       // END ------------------------------------------------------------------

  //       // Create order
  //       const order = await tx.order.create({
  //         data: {
  //           userId,
  //           total: orderTotal,
  //         },
  //       });

  //       // Create order items
  //       await Promise.all(
  //         preparedOrderItems.map((item) =>
  //           tx.orderItem.create({
  //             data: {
  //               orderId: order.id,
  //               productId: item.productId,
  //               quantity: item.quantity,
  //               total: item.total,
  //             },
  //           }),
  //         ),
  //       );

  //       // Reserve stock by increasing "holding" instead of decreasing "stock"
  //       await Promise.all(
  //         preparedOrderItems.map((item) =>
  //           tx.product.update({
  //             where: { id: item.productId },
  //             data: {
  //               holding: {
  //                 increment: item.quantity,
  //               },
  //             },
  //           }),
  //         ),
  //       );

  //       // const to = 'vinhnghii55@gmail.com';
  //       // const subject = `New Order from  user ${user.username} - ${user.email}`;
  //       // const text = `A new order has been created.\n\nOrder ID: ${order.id}\nTime: ${order.createdAt}`;

  //       // // Notify via email and SMS
  //       // await this.notificationService.notify('email', { to, subject, text });

  //       return {
  //         message: 'Order created',
  //         orderId: order.id,
  //         total: orderTotal.toFixed(2),
  //       };
  //     });
  //   };

  //   let retries = 3;
  //   while (retries > 0) {
  //     try {
  //       const result = await runTransaction(); // only return if success
  //       console.log('✅ Transaction succeeded');
  //       return result;
  //     } catch (e: any) {
  //       console.error('🔥 Caught error in transaction:', e);

  //       const isDeadlock =
  //         e.code === 'P2034' ||
  //         (e.code === 'P2010' && e.meta?.code === '40P01') ||
  //         e.message?.toLowerCase().includes('deadlock');

  //       if (isDeadlock) {
  //         retries--;
  //         console.warn(
  //           `🔁 Retrying transaction due to deadlock. Attempts left: ${retries}`,
  //         );
  //         if (retries === 0) throw e;
  //         await delay(100);
  //       } else {
  //         throw e;
  //       }
  //     }
  //   }
  //   // Use transaction to ensure consistency
  // }

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
    userId: number,
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
            userId,
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
