import type { RenderContext } from '@src/modules/ssr/render/types/render-context.js';

/** 向渲染上下文注入 head、state、脚本等 */
export interface RenderEnricher {
  enrich(ctx: RenderContext): Promise<void>;
}
