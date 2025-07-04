import Decimal from 'decimal.js';
import { Observable } from 'rxjs';

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface OrderResponse {
  id: string;
  status: string;
  total: Decimal;
  orderItems: OrderItem[];
}

export interface CreateOrderRequest {
  id: string;
  userId: number;
  orderItems: OrderItem[];
}

export interface CancelOrderRequest {
  orderId: string;
  status: string;
}

export interface OrderServiceClient {
  createOrderRequest(data: CreateOrderRequest): Observable<OrderResponse>;
  cancelOrder(data: CancelOrderRequest): Observable<void>;
}
