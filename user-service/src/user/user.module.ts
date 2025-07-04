import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserGRPCController } from './user.grpc.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientsModule } from '@nestjs/microservices';
import { UserController } from './user.rest.controller';
import { AUTH_SERVICE_CLIENT } from '@shared/grpc-clients/auth-client.options';
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
  ],
  controllers: [UserGRPCController, UserController, MetricsController],
  providers: [UserService],
})
export class UserModule {}
