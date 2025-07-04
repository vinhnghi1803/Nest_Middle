import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';

interface AuthServiceGrpc {
  validateToken(data: { token: string }): Observable<{
    valid: boolean;
    id: string;
    email: string;
    username: string;
    role: string;
  }>;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private authClient: AuthServiceGrpc;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException();

    const res = await firstValueFrom(this.authClient.validateToken({ token }));

    if (!res.valid) throw new UnauthorizedException();

    req.user = res;
    return true;
  }
}
