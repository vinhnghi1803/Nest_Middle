import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from '@nestjs/microservices';
import { AUTH_SERVICE_CLIENT } from '@shared/grpc-clients/auth-client.options';
import { ConfigModule } from '@nestjs/config';
import { PRODUCT_SERVICE_CLIENT } from '@shared/grpc-clients/product-client.options';
import { OrderGrpcController } from './order.grpc.controller';
import { temporalClient } from './temporal.client';
import { MetricsController } from './metrics/metrics.controller';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        ...AUTH_SERVICE_CLIENT,
      },
      {
        name: 'PRODUCT_SERVICE',
        ...PRODUCT_SERVICE_CLIENT,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [OrderController, OrderGrpcController, MetricsController],
  providers: [OrderService, temporalClient],
})
export class AppModule {}
