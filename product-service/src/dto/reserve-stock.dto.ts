import { IsInt, IsPositive } from 'class-validator';

export class ItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}
