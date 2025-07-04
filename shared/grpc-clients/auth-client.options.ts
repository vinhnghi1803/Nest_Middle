// shared/grpc-clients/auth-client.options.ts
import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const AUTH_SERVICE_CLIENT: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'localhost:50052',
    package: 'auth',
    protoPath: join(__dirname, '../../shared/proto/auth.proto'),
  },
};
