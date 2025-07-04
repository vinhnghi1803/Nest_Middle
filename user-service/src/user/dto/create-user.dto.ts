import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '@shared/enum/role.enum';

export class CreateUserDto {
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
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(Role), {
    message: 'Role must be either "user" or "admin"',
  })
  role: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty()
  password: string;
}
