// src/auth/auth.grpc.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthDirectusService } from './auth.directus.service';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthDirectusService) {}

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: { token: string }) {
    return this.authService.validateTokenV2({ token: data.token });
  }
}
