import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UserGRPCController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'Create')
  async create(data: { user: any; dto: CreateUserDto }) {
    this.assertAdmin(data.user);
    return this.userService.create(data.dto);
  }

  @GrpcMethod('UserService', 'FindAll')
  async findAll(data: { user: any }) {
    this.assertAdmin(data.user);
    return this.userService.findAll();
  }

  @GrpcMethod('UserService', 'FindOne')
  async findOne(data: { user: any; id: number }) {
    this.assertAdmin(data.user);
    return this.userService.findOne(data.id);
  }

  @GrpcMethod('UserService', 'Update')
  async update(data: { user: any; id: number; dto: UpdateUserDto }) {
    this.assertAdmin(data.user);
    return this.userService.update(data.id, data.dto);
  }

  @GrpcMethod('UserService', 'Remove')
  async remove(data: { user: any; id: number }) {
    this.assertAdmin(data.user);
    return this.userService.remove(data.id);
  }

  private assertAdmin(user: any) {
    if (!user || user.role !== 'ADMIN') {
      throw new RpcException('Forbidden');
    }
  }
}
