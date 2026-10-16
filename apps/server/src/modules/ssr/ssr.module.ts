/**
 * @module modules/ssr/ssr.module
 * @layer ssr-http
 * @responsibility 组装 SSR 控制器、资产、渲染管道 DI（Guards / Enrichers / Strategy）
 */
import { Module } from '@nestjs/common';
import { MiddlewareModule } from '@src/middlewares/middleware.module.js';
import { SsrController } from '@src/modules/ssr/ssr.controller.js';
import { AssetService } from '@src/modules/ssr/assets/asset.service.js';
import { RendererLoader } from '@src/modules/ssr/render/renderer/renderer.loader.js';
import { PageRenderService } from '@src/modules/ssr/render/page-render.service.js';
import { StreamDocumentStrategy } from '@src/modules/ssr/render/strategies/stream-document.strategy.js';
import { PageAccessGuard } from '@src/modules/ssr/render/guards/page-access.guard.js';
import { SpaPathGuard } from '@src/modules/ssr/render/guards/spa-path.guard.js';
import { MfPreloadEnricher } from '@src/modules/ssr/render/enrichers/mf-preload.enricher.js';
import { AssetScriptEnricher } from '@src/modules/ssr/render/enrichers/asset-script.enricher.js';
import { ServerStateEnricher } from '@src/modules/ssr/render/enrichers/server-state.enricher.js';
import { RENDER_ENRICHERS, RENDER_GUARDS } from '@src/modules/ssr/render/render.tokens.js';

@Module({
  imports: [MiddlewareModule],
  controllers: [SsrController],
  providers: [
    AssetService,
    RendererLoader,
    PageRenderService,
    StreamDocumentStrategy,
    PageAccessGuard,
    SpaPathGuard,
    MfPreloadEnricher,
    AssetScriptEnricher,
    ServerStateEnricher,
    {
      provide: RENDER_GUARDS,
      useFactory: (spa: SpaPathGuard, access: PageAccessGuard) => [spa, access],
      inject: [SpaPathGuard, PageAccessGuard],
    },
    {
      provide: RENDER_ENRICHERS,
      useFactory: (
        mf: MfPreloadEnricher,
        asset: AssetScriptEnricher,
        state: ServerStateEnricher,
      ) => [mf, asset, state],
      inject: [MfPreloadEnricher, AssetScriptEnricher, ServerStateEnricher],
    },
  ],
})
export class SsrModule {}
