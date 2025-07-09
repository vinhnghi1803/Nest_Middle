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

// Activity: Create Payment Checkout Session with Stripe
export async function createCheckoutSession(
  orderId: string,
  amount: Decimal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    paymentClient.CreateCheckoutSession(
      {
        orderId,
        amount,
        successUrl: `http://localhost:65535/success/${orderId}`,
        cancelUrl: `http://localhost:65535/cancel/${orderId}`,
      },
      (err: Error, response: { url: string }) => {
        if (err) return reject(err);
        resolve(response.url);
      },
    );
  });
}

export async function refundPayment(paymentIntentId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    paymentClient.RefundPayment(
      { paymentIntentId },
      (err: Error, response: any) => {
        if (err) return reject(err);
        resolve(response);
      },
    );
  });
}
