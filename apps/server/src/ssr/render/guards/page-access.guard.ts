/**
 * @module ssr/render/guards/page-access.guard
 * @layer ssr-render
 * @troubleshoot 403 且提示缺少 permissions → 查 PAGE_ROUTES.access 与 renderAuth.permissions
 */
import { Injectable } from '@nestjs/common';
import type { RenderGuard } from '@src/ssr/render/guards/render-guard.interface.js';
import type { RenderContext } from '@src/ssr/render/types/render-context.js';
import type { RenderGuardResult } from '@src/ssr/render/types/render-guard-result.js';

/**
 * 根据 `PageRouteDefinition.access` 校验权限。
 * SPA 子路径可在 Guard 内根据 `ctx.pathname` 扩展规则。
 */
@Injectable()
export class PageAccessGuard implements RenderGuard {
  async canActivate(ctx: RenderContext): Promise<RenderGuardResult> {
    const required = ctx.page.access?.permissions ?? [];
    if (required.length === 0) {
      return { allow: true };
    }

    const granted = new Set(ctx.auth.permissions);
    const ok = required.some((p) => granted.has(p));
    if (ok) return { allow: true };

    return {
      allow: false,
      status: 403,
      contentType: 'text/html; charset=utf-8',
      body: `<!DOCTYPE html><html><body>
        <h1>403</h1>
        <p>缺少页面所需权限：${required.join(', ')}</p>
      </body></html>`,
    };
  }
}
