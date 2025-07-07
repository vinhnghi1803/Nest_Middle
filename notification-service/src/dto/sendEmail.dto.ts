import { IsEmail, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class sendEmailDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsEmail({}, { message: 'Invalid email format' })
  to: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  subject: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  text: string;
}
