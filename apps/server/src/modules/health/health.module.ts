/**
 * @module modules/health/health.module
 * @layer ssr-http
 * @responsibility 健康检查 API（/api/health）
 */
import { Module } from '@nestjs/common';
import { HealthController } from '@src/modules/health/health.controller.js';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
