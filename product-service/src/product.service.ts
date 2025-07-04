import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RpcException } from '@nestjs/microservices';
import { ReserveStockRequest } from '@shared/interface/ProductServiceClient.interface';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    // const result = await this.prisma.$queryRawUnsafe(`
    //   EXPLAIN ANALYZE
    //   SELECT * FROM "Product" WHERE price > 50.00 ORDER BY "createdAt" DESC LIMIT 10
    // `);
    // console.log(result);

    // const result1 = await this.prisma.$queryRawUnsafe(`
    //   EXPLAIN ANALYZE
    //   SELECT * FROM "Product" WHERE price > 50.00 ORDER BY "createdAt" DESC LIMIT 20
    // `);
    // console.log(result1);

    // const result2 = await this.prisma.$queryRawUnsafe(`
    //   EXPLAIN ANALYZE
    //   SELECT * FROM "Product" WHERE price > 50.00 ORDER BY "createdAt" DESC LIMIT 30
    // `);
    // console.log(result2);

    // const result3 = await this.prisma.$queryRawUnsafe(`
    //   EXPLAIN ANALYZE
    //   SELECT * FROM "Product" WHERE price > 50.00 ORDER BY "createdAt" DESC LIMIT 40
    // `);
    // console.log(result3);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return await this.prisma.product.findFirst({ where: { id } });
  }

  async create(dto: CreateProductDto) {
    const exists = await this.prisma.product.findUnique({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('Product name already exists');

    await this.prisma.product.create({ data: { ...dto } });

    return { message: 'Product created' };
  }

  async update(id: number, dto: UpdateProductDto) {
    const exists = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException('ID is not exists');

    if (dto.name) {
      const existName = await this.prisma.product.findUnique({
        where: { name: dto.name },
      });
      if (existName) throw new ConflictException('Product name already exists');
    }

    await this.prisma.product.update({
      where: { id },
      data: dto,
    });

    return { message: `Product #${id} updated` };
  }

  async delete(id: number) {
    const exists = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException('ID is not exists');

    await this.prisma.product.delete({ where: { id } });

    return `Product with id ${id} has been deleted.`;
  }

  async findManyGrpc(data: { ids: number[]; quantities?: number[] }) {
    const { ids, quantities } = data;

    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
    });
    if (products.length !== ids.length) {
      throw new RpcException('Some products not found');
    }

    // If quantities are provided, validate stock
    if (quantities && quantities.length) {
      for (let i = 0; i < products.length; i++) {
        const available = products[i].stock - products[i].holding;
        if (available < quantities[i]) {
          throw new RpcException(
            `Not enough stock for product ${products[i].name}`,
          );
        }
      }
    }

    return { products };
  }

  async findOneGrpc(id: number) {
    try {
      return await this.prisma.product.findFirstOrThrow({ where: { id } });
    } catch (error) {
      throw new RpcException(`Product with id ${id} not found`);
    }
  }

  async ReserveStock(data: ReserveStockRequest) {
    console.log('ReserveStock called with data:', {
      ...data,
      orderId: BigInt(data.orderId).toString(),
    });
    const { orderId, items } = data;
    const productMap = new Map<number, number>();
    const idsList = items
      .sort((a, b) => a.productId - b.productId)
      .map((i) => {
        productMap.set(i.productId, i.quantity);
        return i.productId;
      })
      .join(',');
    try {
      await this.prisma.$transaction(async (tx) => {
        // Lock the product rows
        const products = await tx.$queryRawUnsafe<any[]>(`
          SELECT * FROM "Product"
          WHERE id IN (${idsList})
          FOR UPDATE
        `);
        // Check stock availability
        for (const product of products) {
          const requiredQty = productMap.get(product.id)!;

          if (product.stock < requiredQty) {
            throw new RpcException({
              code: 10, // NOT_FOUND
              message: `Insufficient stock for product ${product.id}`,
            });
          }

          // Reserve stock by decrement stock
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: { decrement: requiredQty },
            },
          });
        }
      });
      return { success: true };
    } catch (error) {
      throw new RpcException({
        code: 10, // ABORTED
        message: error.message,
      });
    }
  }

  async RollbackStock(data: ReserveStockRequest) {
    console.log('Rollback Stock called with data:', data);
    const { orderId, items } = data;
    const productMap = new Map<number, number>();
    const idsList = items
      .sort((a, b) => a.productId - b.productId)
      .map((i) => {
        productMap.set(i.productId, i.quantity);
        return i.productId;
      })
      .join(',');
    try {
      await this.prisma.$transaction(async (tx) => {
        // Lock the product rows
        const products = await tx.$queryRawUnsafe<any[]>(`
          SELECT * FROM "Product"
          WHERE id IN (${idsList})
          FOR UPDATE
        `);
        // Check stock availability
        for (const product of products) {
          const requiredQty = productMap.get(product.id)!;
          // Rollback stock by increasing stock
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: { increment: requiredQty },
            },
          });
        }
      });
      return { success: true };
    } catch (error) {
      throw new RpcException({
        code: 10, // ABORTED
        message: error.message,
      });
    }
  }
}
