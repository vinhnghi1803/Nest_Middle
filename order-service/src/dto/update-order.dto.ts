import { IsEnum } from 'class-validator';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderDto {
  orderId: string;

  @IsEnum(OrderStatus, { message: 'Invalid status value' })
  status: OrderStatus;
}
