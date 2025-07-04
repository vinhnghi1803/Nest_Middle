import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
