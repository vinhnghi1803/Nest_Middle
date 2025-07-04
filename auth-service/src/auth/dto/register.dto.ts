import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { Match } from '@shared/decorator/match.decorator';

export class RegisterDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  username: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty()
  password: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
