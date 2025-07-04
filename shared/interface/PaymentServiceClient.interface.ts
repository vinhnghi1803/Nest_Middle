import { Observable } from 'rxjs';

export interface CreatePaymentRequest {
  id: number;
}

export interface CreatePayment {
  createOrderRequest(data: CreatePaymentRequest): Observable<string>;
}
