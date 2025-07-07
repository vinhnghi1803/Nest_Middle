import { Controller, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { GrpcMethod } from '@nestjs/microservices';
import { sendEmailDto } from './dto/sendEmail.dto';

@Controller()
export class NotificationGrpcController {
  constructor(private readonly notiService: NotificationService) {}

  @GrpcMethod('NotificationService', 'sendEmail')
  sendEmail(data: { orderId: string; username: string; email: string }) {
    const userEmail: sendEmailDto = {
      to: data.email,
      subject: `Hello ${data.username}, Your order  are in the way!!!`,
      text: `Hello ${data.username}, Your order  are in the way!!!`,
    };

    const adminEmail: sendEmailDto = {
      to: process.env.EMAIL_ADMIN!,
      subject: `User ${data.username} has create an order with orderId ${data.orderId}`,
      text: `User ${data.username} has create an order with orderId ${data.orderId}`,
    };

    this.notiService.sendEmail(userEmail);
    this.notiService.sendEmail(adminEmail);
    return { success: true };
  }
}
