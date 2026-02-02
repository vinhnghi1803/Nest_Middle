import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthDirectusService } from './auth.directus.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private authDirectusService: AuthDirectusService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('login/v2')
  loginV2(@Body() dto: LoginDto) {
    return this.authDirectusService.login(dto);
  }
}
