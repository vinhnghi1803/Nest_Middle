// libs/grpc-clients/payment.client.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import Decimal from 'decimal.js';
import { join } from 'path';

const protoPath = join(__dirname, '../../../../../shared/proto/payment.proto');

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const paymentProto = grpc.loadPackageDefinition(packageDefinition) as any;

const paymentClient = new paymentProto.payment.PaymentService(
  `localhost:${process.env.PAYMENT_GRPC_PORT || 50055}`,
  grpc.credentials.createInsecure(),
);

export async function processPaymentActivity(
  orderId: string,
  amount: Decimal,
  method: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    paymentClient.recordPayment(
      { orderId, amount, method },
      (err: Error, response: any) => {
        if (err) return reject(err);
        resolve(response);
      },
    );
  });
}
