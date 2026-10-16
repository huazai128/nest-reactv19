/**
 * @module modules/health/health.controller
 * @layer ssr-http
 * @responsibility GET /api/health 存活探针
 */
import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class HealthController {
  @Get('health')
  health() {
    return { ok: true, layer: 'node' };
  }
}
