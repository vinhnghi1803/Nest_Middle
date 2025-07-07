import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

// Load .proto
const protoPath = join(
  __dirname,
  '../../../../../shared/proto/notification.proto',
);
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const client = new proto.notification.NotificationService(
  `localhost:${process.env.NOTIFICATION_GRPC_PORT || 50056}`,
  grpc.credentials.createInsecure(),
);

// Activity: Send Email
export async function sendEmail(
  orderId: string,
  username: string,
  email: string,
): Promise<any> {
  return new Promise((resolve, reject) => {
    client.sendEmail(
      { orderId, username, email },
      (err: Error, response: any) => {
        if (err) return reject(err);
        resolve(response);
      },
    );
  });
}
