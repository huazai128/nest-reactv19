/**
 * @module modules/ssr/render/page-render.service
 * @layer ssr-render
 * @responsibility 编排 Guard → Enricher → Strategy，输出单次 HTML 文档（流式）
 * @inputs Express Request/Response
 * @outputs chunked HTML；Guard 拒绝时返回 4xx 静态页
 * @deps RENDER_GUARDS, RENDER_ENRICHERS, StreamDocumentStrategy
 * @troubleshoot 503 → RendererLoader 未加载 ssr.mjs（pnpm dev:client）；403 → 查 guards 与 Locals.renderAuth
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { matchPage } from '@app/shared';
import type { RenderGuard } from '@src/modules/ssr/render/guards/render-guard.interface.js';
import type { RenderEnricher } from '@src/modules/ssr/render/enrichers/render-enricher.interface.js';
import { RENDER_ENRICHERS, RENDER_GUARDS } from '@src/modules/ssr/render/render.tokens.js';
import {
  createRenderContext,
  type RenderContext,
} from '@src/modules/ssr/render/types/render-context.js';
import type { RenderGuardResult } from '@src/modules/ssr/render/types/render-guard-result.js';
import { StreamDocumentStrategy } from '@src/modules/ssr/render/strategies/stream-document.strategy.js';

/**
 * 通用页面渲染编排：Guard → Enricher → Strategy。
 * 业务扩展：新增 Guard / Enricher / Strategy 并注册到 SsrModule。
 */
@Injectable()
export class PageRenderService {
  private readonly logger = new Logger(PageRenderService.name);

  constructor(
    @Inject(RENDER_GUARDS) private readonly guards: RenderGuard[],
    @Inject(RENDER_ENRICHERS) private readonly enrichers: RenderEnricher[],
    @Inject(StreamDocumentStrategy)
    private readonly streamStrategy: StreamDocumentStrategy,
  ) {}

  async renderDocument(request: Request, response: Response): Promise<void> {
    const pathname = request.url.split('?')[0] ?? '/';
    const page = matchPage(pathname);
    const ctx = createRenderContext(request, response, page);

    for (const guard of this.guards) {
      const result = await guard.canActivate(ctx);
      if (!result.allow) {
        this.sendGuardDeny(response, result);
        return;
      }
    }

    for (const enricher of this.enrichers) {
      await enricher.enrich(ctx);
    }

    try {
      await this.streamStrategy.execute(ctx);
    } catch (err) {
      this.logger.error(err);
      if (!response.headersSent) {
        response.status(503).type('html').send(this.rendererNotReadyHtml(err));
      }
    }
  }

  private sendGuardDeny(
    response: Response,
    result: Extract<RenderGuardResult, { allow: false }>,
  ) {
    response
      .status(result.status)
      .type(result.contentType ?? 'text/html')
      .send(result.body);
  }

  private rendererNotReadyHtml(err: unknown): string {
    return `<!DOCTYPE html><html><body>
      <h1>SSR 未就绪</h1>
      <p>请先启动客户端构建：<code>pnpm dev:client</code></p>
      <pre>${String(err)}</pre>
    </body></html>`;
  }
}
