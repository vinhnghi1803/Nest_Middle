import { Module } from '@nestjs/common';
import { PaymentGRPCController } from './payment.grpc.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from '@nestjs/microservices';
import { AUTH_SERVICE_CLIENT } from '@shared/grpc-clients/auth-client.options';
import { PaymentController } from './payment.controller';
import { temporalClient } from './temporal.client';
import { ConfigModule } from '@nestjs/config';
import { MetricsController } from './metrics/metrics.controller';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        ...AUTH_SERVICE_CLIENT,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [PaymentGRPCController, PaymentController, MetricsController],
  providers: [PaymentService, temporalClient],
})
export class AppModule {}
