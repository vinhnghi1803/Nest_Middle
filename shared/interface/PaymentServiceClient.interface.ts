import Decimal from 'decimal.js';
import { Observable } from 'rxjs';

export interface CreatePaymentRequest {
  id: number;
}

export interface CreateCheckoutSessionDto {
  orderId: string;
  amount: Decimal;
  successUrl: string;
  cancelUrl: string;
}
export interface CreatePayment {
  createOrderRequest(data: CreatePaymentRequest): Observable<string>;
  createCheckoutSession(
    data: CreateCheckoutSessionDto,
  ): Observable<{ url: string }>;
}
