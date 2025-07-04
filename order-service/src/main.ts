import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // 1. Create the main HTTP app
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('PORT') || 3004;
  const grpcPort = config.get<string>('GRPC_PORT') || '50054';

  // 2. Connect the gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'order',
      protoPath: join(__dirname, '../../shared/proto/order.proto'),
      url: `localhost:${grpcPort}`,
    },
  });

  // 3. Start both HTTP and gRPC
  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`OrderService running: gRPC on ${grpcPort}, HTTP on ${port}`);
}
bootstrap();
