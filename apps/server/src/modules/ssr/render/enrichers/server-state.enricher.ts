/**
 * @module modules/ssr/render/enrichers/server-state.enricher
 * @layer ssr-render
 * @responsibility 写入 statePatch.server → 浏览器 __SSR_STATE__.server
 * @troubleshoot 前端读不到 server → 查 entries/main.server statePatch 合并与 useSsrState
 */
import { Injectable } from '@nestjs/common';
import type { RenderEnricher } from '@src/modules/ssr/render/enrichers/render-enricher.interface.js';
import type { RenderContext } from '@src/modules/ssr/render/types/render-context.js';

/** 将鉴权等信息写入 `__SSR_STATE__.server`，供前端只读消费 */
@Injectable()
export class ServerStateEnricher implements RenderEnricher {
  async enrich(ctx: RenderContext): Promise<void> {
    ctx.statePatch.server = {
      userId: ctx.auth.userId,
      permissions: ctx.auth.permissions,
      roles: ctx.auth.roles,
    };
  }
}
