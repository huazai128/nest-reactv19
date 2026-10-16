/**
 * @module modules/ssr/ssr.controller
 * @layer ssr-http
 * @responsibility HTML 路由入口；排除 /api、/static 后委托 PageRenderService
 * @inputs Request.url, res.locals（由 middleware 注入）
 * @outputs HTML 流或 404
 * @deps PageRenderService
 * @troubleshoot 非 HTML 响应 → 是否误匹配 api/static；渲染异常在 PageRenderService 日志
 */
import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PageRenderService } from '@src/modules/ssr/render/page-render.service.js';

/** 仅负责 HTTP 入口，渲染逻辑委托 PageRenderService */
@Controller()
export class SsrController {
  constructor(
    @Inject(PageRenderService) private readonly pageRender: PageRenderService,
  ) {}

  @All('*')
  async page(@Req() req: Request, @Res() res: Response) {
    if (req.path.startsWith('/api') || req.path.startsWith('/static')) {
      res.status(404).end();
      return;
    }

    await this.pageRender.renderDocument(req, res);
  }
}
