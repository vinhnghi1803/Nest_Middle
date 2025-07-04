import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { register } from './metrics';

@Controller()
export class MetricsController {
  @Get('/metrics')
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}
