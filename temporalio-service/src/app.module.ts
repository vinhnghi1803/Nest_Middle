// src/app.module.ts
import { Module } from '@nestjs/common';
import { temporalClient } from './temporal.client';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [temporalClient],
  exports: ['TEMPORAL_CLIENT'],
})
export class AppModule {}
