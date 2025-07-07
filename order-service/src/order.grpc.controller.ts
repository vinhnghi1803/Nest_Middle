import { Body, Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderRequest } from '@shared/interface/OrderServiceClient.interface';

@Controller()
export class OrderGrpcController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod('OrderService', 'createOrder')
  async createOrder(@Body() data: CreateOrderRequest) {
    return this.orderService.createOrderGRPC(
      data.id,
      data.user,
      data.orderItems,
    );
  }

  @GrpcMethod('OrderService', 'cancelOrder')
  async cancelOrder(@Body() dto: UpdateOrderDto) {
    return this.orderService.cancelOrderGRPC(dto);
  }
}
