/**
 * @module middlewares/middleware.module
 * @layer middleware
 * @responsibility 注册 RequestContext、MF preload 等全局中间件
 */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MfPreloadMiddleware } from '@src/middlewares/mf-preload/mf-preload.middleware.js';
import { MfPreloadService } from '@src/middlewares/mf-preload/mf-preload.service.js';
import { RequestContextMiddleware } from '@src/middlewares/request-context/request-context.middleware.js';

@Module({
  providers: [MfPreloadService],
})
export class MiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, MfPreloadMiddleware)
      .forRoutes('*');
  }
}
