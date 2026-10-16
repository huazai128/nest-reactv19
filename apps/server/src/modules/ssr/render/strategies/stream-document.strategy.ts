/**
 * @module modules/ssr/render/strategies/stream-document.strategy
 * @layer ssr-render
 * @responsibility 默认渲染策略：组装 PipeDocumentMeta 并调用 pipeDocument 流式写 Response
 * @inputs 已 enrich 的 RenderContext
 * @troubleshoot headersSent 重复 → Guard 拒绝后勿再 execute；chunked 无 body → renderer 异常
 */
import { Inject, Injectable } from '@nestjs/common';
import type { RenderContext } from '@src/modules/ssr/render/types/render-context.js';
import { getHeadHtml } from '@src/modules/ssr/render/types/render-context.js';
import {
  RendererLoader,
  type PipeDocumentMeta,
} from '@src/modules/ssr/render/renderer/renderer.loader.js';

/** 默认策略：React 流式 SSR bundle */
@Injectable()
export class StreamDocumentStrategy {
  constructor(@Inject(RendererLoader) private readonly loader: RendererLoader) {}

  async execute(ctx: RenderContext): Promise<void> {
    const renderer = this.loader.getRenderer();
    const meta: PipeDocumentMeta = {
      headExtra: getHeadHtml(ctx),
      scriptTags: ctx.scriptTags,
      statePatch: ctx.statePatch,
    };

    const res = ctx.response;
    res.status(200);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    await renderer.pipeDocument(ctx.url, res, meta);
  }
}
