import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const PRODUCT_SERVICE_CLIENT: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'localhost:50053',
    package: 'product',
    protoPath: join(__dirname, '../../shared/proto/product.proto'),
  },
};
