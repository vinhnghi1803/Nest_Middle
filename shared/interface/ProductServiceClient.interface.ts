import { Observable } from 'rxjs';

export interface FindManyProductRequest {
  ids: number[];
  quantities?: number[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  holding: number;
}

export interface ProductListResponse {
  products: Product[];
}

export interface ReserveStockRequest {
  orderId: string;
  items: { productId: number; quantity: number }[];
}

export interface ProductServiceClient {
  findOne(data: { id: number }): Observable<Product>;
  findMany(data: FindManyProductRequest): Observable<ProductListResponse>;
  reserveStock(data: ReserveStockRequest): Observable<{ message: string }>;
  rollbackStock(data: ReserveStockRequest): Observable<void>;
}
