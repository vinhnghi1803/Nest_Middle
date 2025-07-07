import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import {
  CreateOrderRequest,
  OrderResponse,
} from '@shared/interface/OrderServiceClient.interface';

// Load .proto
const protoPath = join(__dirname, '../../../../../shared/proto/order.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const client = new proto.order.OrderService(
  `localhost:${process.env.ORDER_GRPC_PORT || 50054}`,
  grpc.credentials.createInsecure(),
);

// Activity: Create Order
export async function createOrder(
  orderData: CreateOrderRequest,
): Promise<OrderResponse> {
  return new Promise((resolve, reject) => {
    client.createOrder(orderData, (err: Error, response: any) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

// Activity: Cancel Order
export async function cancelOrder(
  orderId: string,
  status: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    client.cancelOrder({ orderId, status }, (err: Error) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
