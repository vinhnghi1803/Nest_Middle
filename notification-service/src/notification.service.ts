import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { sendEmailDto } from './dto/sendEmail.dto';

@Injectable()
export class NotificationService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  async onModuleInit() {
    // Email (Ethereal or real SMTP)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail({ to, subject, text }: sendEmailDto) {
    const info = await this.transporter.sendMail({
      from: '"App" <app@example.com>',
      to,
      subject,
      text,
    });

    return info;
  }
}
