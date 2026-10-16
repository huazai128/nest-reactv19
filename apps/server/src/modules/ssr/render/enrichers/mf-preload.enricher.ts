/**
 * @module modules/ssr/render/enrichers/mf-preload.enricher
 * @layer ssr-render
 * @responsibility 将 MfPreloadMiddleware 写入的 locals 并入 headFragments
 * @deps Locals.mfPreloadTags（见 middleware.constants）
 */
import { Injectable } from '@nestjs/common';
import { Locals } from '@src/middlewares/middleware.constants.js';
import type { RenderEnricher } from '@src/modules/ssr/render/enrichers/render-enricher.interface.js';
import type { RenderContext } from '@src/modules/ssr/render/types/render-context.js';

@Injectable()
export class MfPreloadEnricher implements RenderEnricher {
  async enrich(ctx: RenderContext): Promise<void> {
    const tags = ctx.response.locals[Locals.mfPreloadTags];
    if (typeof tags === 'string' && tags.length > 0) {
      ctx.headFragments.push(tags);
    }
  }
}
