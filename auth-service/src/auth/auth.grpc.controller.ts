// src/auth/auth.grpc.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: { token: string }) {
    return this.authService.validateToken({ token: data.token });
  }
}
