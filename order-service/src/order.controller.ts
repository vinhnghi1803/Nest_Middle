import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
// import { CreateOrderDto } from './dto/create-order.dto';
// import { UpdateOrderDto } from './dto/update-order.dto';
// import { LogExecution } from '../../common/decorator/log-execution.decorator';
import { AuthGuard } from '@shared/guard/auth.guard';
import { RolesGuard } from '@shared/guard/roles.guard'; // Assuming you have a
import { CreateOrderRequest } from '@shared/interface/OrderServiceClient.interface';
import { WorkflowClient } from '@temporalio/client';

@Controller('order')
@UseGuards(AuthGuard, RolesGuard) // Assuming you have an AuthGuard to protect the routes
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @Inject('TEMPORAL_CLIENT') private readonly temporalClient: WorkflowClient,
  ) {}

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Post('create')
  async startOrderSaga(@Req() req, @Body() dto: CreateOrderRequest) {
    const orderId = BigInt(Date.now()).toString(); // Generate a unique order ID based on timestamp
    const body = {
      ...dto,
      id: orderId,
      user: req.user,
    };
    const workflowId = `order-${orderId}`;
    await this.temporalClient.start('OrderSagaWorkflow', {
      taskQueue: 'order-saga',
      workflowId,
      args: [body],
      retry: {
        maximumAttempts: 3,
        initialInterval: '2s',
        backoffCoefficient: 2,
      },
    });

    // return {
    //   message: '✅ Order workflow started',
    //   workflowId,
    // };
  }
}
