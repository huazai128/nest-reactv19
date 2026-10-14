/**
 * @module middleware/mf-preload/mf-preload.middleware
 * @layer middleware
 * @responsibility GET 页面请求前填充 Locals.mfPreloadTags
 * @troubleshoot 无 x-mf-preload-ready 头 → 非 GET 或路径为 api/static
 */
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { Headers, Locals } from '@src/middleware/middleware.constants.js';
import { MfPreloadService } from '@src/middleware/mf-preload/mf-preload.service.js';

@Injectable()
export class MfPreloadMiddleware implements NestMiddleware {
  constructor(
    @Inject(MfPreloadService) private readonly mfPreload: MfPreloadService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/static')
    ) {
      const tags = await this.mfPreload.getPreloadLinkTags();
      res.locals[Locals.mfPreloadTags] = tags;
      res.setHeader(Headers.mfPreloadReady, '1');
    } else {
      this.mfPreload.warmCache();
    }
    next();
  }
}
