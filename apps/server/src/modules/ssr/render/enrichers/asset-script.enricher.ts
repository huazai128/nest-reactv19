/**
 * @module modules/ssr/render/enrichers/asset-script.enricher
 * @layer ssr-render
 * @responsibility 填充 ctx.scriptTags（须在 StreamDocumentStrategy 之前执行）
 * @deps AssetService
 */
import { Inject, Injectable } from '@nestjs/common';
import { AssetService } from '@src/modules/ssr/assets/asset.service.js';
import type { RenderEnricher } from '@src/modules/ssr/render/enrichers/render-enricher.interface.js';
import type { RenderContext } from '@src/modules/ssr/render/types/render-context.js';

@Injectable()
export class AssetScriptEnricher implements RenderEnricher {
  constructor(@Inject(AssetService) private readonly assets: AssetService) {}

  async enrich(ctx: RenderContext): Promise<void> {
    ctx.scriptTags = await this.assets.getClientScripts(ctx.page.clientEntry);
  }
}
