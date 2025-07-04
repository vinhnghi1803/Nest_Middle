import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ValidateMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { product, quantity, totalPrice } = req.body;

    if (typeof product !== 'string' || !product.trim()) {
      throw new BadRequestException(
        'Product name is required and must be a string',
      );
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive number');
    }

    if (typeof totalPrice !== 'number' || totalPrice < 0) {
      throw new BadRequestException(
        'Total price must be a non-negative number',
      );
    }

    next();
  }
}
