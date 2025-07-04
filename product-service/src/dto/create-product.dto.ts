import { IsString, IsNotEmpty, IsInt, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsInt()
  stock: number;
}
