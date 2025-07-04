import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GrpcMethod } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already exists');

    const password = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.create({
      data: { username: dto.username, email: dto.email, password: password },
    });
    return { message: 'User registered' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);
    return { access_token: token };
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken({ token }: { token: string }) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return {
        valid: true,
        id: payload.id,
        email: payload.email,
        username: payload.username,
        role: payload.role,
      };
    } catch {
      return { valid: false };
    }
  }
}
