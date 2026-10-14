import { Module } from '@nestjs/common';
import { SsrModule } from '@src/ssr/ssr.module.js';
import { HealthController } from '@src/health.controller.js';

@Module({
  imports: [SsrModule],
  controllers: [HealthController],
})
export class AppModule {}
