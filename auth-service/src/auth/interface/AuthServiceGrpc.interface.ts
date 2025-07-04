import { Observable } from 'rxjs';

export interface AuthServiceGrpc {
  validateToken(data: { token: string }): Observable<{
    valid: boolean;
    id: string;
    email: string;
    username: string;
    role: string;
  }>;
}
