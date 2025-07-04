import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { ReserveStockRequest } from '@shared/interface/ProductServiceClient.interface';

@Controller()
export class ProductGrpcController {
  constructor(private readonly productService: ProductService) {}

  @GrpcMethod('ProductService', 'findOne')
  async findOne(data: { id: number }) {
    return this.productService.findOneGrpc(data.id);
  }

  @GrpcMethod('ProductService', 'findMany')
  async findMany(data: { ids: number[]; quantities?: number[] }) {
    return this.productService.findManyGrpc(data);
  }

  @GrpcMethod('ProductService', 'reserveStock')
  async reserveStock(data: ReserveStockRequest) {
    return this.productService.ReserveStock(data);
  }

  @GrpcMethod('ProductService', 'rollbackStock')
  async rollbackStock(data: ReserveStockRequest) {
    console.log('Rolling back stock for order:', data);
    return this.productService.RollbackStock(data);
  }
}
