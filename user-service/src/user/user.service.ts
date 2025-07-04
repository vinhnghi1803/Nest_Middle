import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/response-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already exists');

    const password = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.create({ data: { ...dto, password } });
    return { message: 'User registered' };
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return plainToInstance(UserResponseDto, users);
  }

  async findOne(id: number) {
    //ID not found
    const exists = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException('ID is not exists');

    const users = await this.prisma.user.findFirstOrThrow({
      where: { id },
    });
    return plainToInstance(UserResponseDto, users);
  }

  async update(id: number, dto: UpdateUserDto) {
    //ID not found
    const exists = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException('ID is not exists');

    // Email exist
    if (dto.email) {
      const existsEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existsEmail) throw new ConflictException('Email already exists');
    }
    let updateData: Partial<UpdateUserDto & { password?: string }> = { ...dto };

    // Password change
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return { message: `User #${id} updated` };
  }

  async remove(id: number) {
    //ID not found
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });
    if (!user) throw new NotFoundException('ID is not exists');

    await this.prisma.user.delete({ where: { id } });

    return `User ${user.email} has been deleted`;
  }
}
