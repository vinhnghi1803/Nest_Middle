import { Module } from '@nestjs/common';
import { NotificationGrpcController } from './notification.grpc.controller';
import { NotificationService } from './notification.service';
import { ClientsModule } from '@nestjs/microservices';
import { AUTH_SERVICE_CLIENT } from '@shared/grpc-clients/auth-client.options';
import { ConfigModule } from '@nestjs/config';
import { MetricsController } from './metrics/metrics.controller';

@Module({
  imports: [
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
  controllers: [NotificationGrpcController, MetricsController],
  providers: [NotificationService],
})
export class AppModule {}
