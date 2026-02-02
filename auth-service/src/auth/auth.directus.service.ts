import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import {
  createDirectus,
  authentication,
  readRolesMe,
  rest,
} from '@directus/sdk';

@Injectable()
export class AuthDirectusService {
  private readonly directus = createDirectus(
    process.env.DIRECTUS_URL || 'http://localhost:8055',
  )
    .with(authentication('json'))
    .with(rest());
  constructor(private jwtService: JwtService) {}

  async login(dto: LoginDto) {
    try {
      const user = await this.directus.login(dto);

      return { access_token: user.access_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials: ', error.message);
    }
  }

  // async register(dto: RegisterDto) {
  //   const exists = await this.prisma.user.findUnique({
  //     where: { email: dto.email },
  //   });
  //   if (exists) throw new ConflictException('Email already exists');

  //   const password = await bcrypt.hash(dto.password, 10);
  //   await this.prisma.user.create({
  //     data: { username: dto.username, email: dto.email, password: password },
  //   });
  //   return { message: 'User registered' };
  // }

  async validateTokenV2({ token }: { token: string; jwtSecret?: string }) {
    try {
      await this.directus.setToken(token);

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const role = await this.directus.request(readRolesMe(payload.id));
      return {
        id: payload.id,
        role: role,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
