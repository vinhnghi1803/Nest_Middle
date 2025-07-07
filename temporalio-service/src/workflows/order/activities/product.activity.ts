import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

// Load .proto
const protoPath = join(__dirname, '../../../../../shared/proto/product.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const client = new proto.product.ProductService(
  `localhost:${process.env.PRODUCT_GRPC_PORT || 50053}`,
  grpc.credentials.createInsecure(),
);

// Activity: Reserve Stock Request
export async function ReserveStock(productData: {
  orderId: string;
  items: { productId: number; quantity: number }[];
}): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    client.reserveStock(productData, (err: Error, response: any) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

// Activity: Rollback Stock
export async function RollbackStock(productData: {
  orderId: string;
  items: { productId: number; quantity: number }[];
}): Promise<void> {
  return new Promise((resolve, reject) => {
    client.rollbackStock(productData, (err: Error) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
