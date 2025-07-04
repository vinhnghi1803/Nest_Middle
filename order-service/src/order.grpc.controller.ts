import { Body, Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller()
export class OrderGrpcController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod('OrderService', 'createOrder')
  async createOrder(
    @Body() data: { id: string; userId: number; orderItems: OrderItemDto[] },
  ) {
    return this.orderService.createOrderGRPC(
      data.id,
      data.userId,
      data.orderItems,
    );
  }

  @GrpcMethod('OrderService', 'cancelOrder')
  async cancelOrder(@Body() dto: UpdateOrderDto) {
    return this.orderService.cancelOrderGRPC(dto);
  }
}
