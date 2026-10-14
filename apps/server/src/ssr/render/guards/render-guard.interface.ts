import type { RenderContext } from '@src/ssr/render/types/render-context.js';
import type { RenderGuardResult } from '@src/ssr/render/types/render-guard-result.js';

/** 访问控制 / 业务准入（权限、租户、AB 等） */
export interface RenderGuard {
  canActivate(ctx: RenderContext): Promise<RenderGuardResult>;
}
