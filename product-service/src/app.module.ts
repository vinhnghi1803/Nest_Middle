import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from '@nestjs/microservices';
import { AUTH_SERVICE_CLIENT } from '@shared/grpc-clients/auth-client.options';
import { ConfigModule } from '@nestjs/config';
import { ProductGrpcController } from './product.grpc.controller';
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
  controllers: [ProductController, ProductGrpcController, MetricsController],
  providers: [ProductService],
})
export class AppModule {}
