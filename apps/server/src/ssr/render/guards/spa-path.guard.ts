/**
 * @module ssr/render/guards/spa-path.guard
 * @layer ssr-render
 * @troubleshoot /about 403 → 请求头 x-demo-role: user|admin；guest 无 about:read
 */
import { Injectable } from '@nestjs/common';
import type { RenderGuard } from '@src/ssr/render/guards/render-guard.interface.js';
import type { RenderContext } from '@src/ssr/render/types/render-context.js';
import type { RenderGuardResult } from '@src/ssr/render/types/render-guard-result.js';

/** SPA 子路由级权限示例：`/about` 需要 about:read */
@Injectable()
export class SpaPathGuard implements RenderGuard {
  async canActivate(ctx: RenderContext): Promise<RenderGuardResult> {
    if (ctx.page.mode !== 'spa') {
      return { allow: true };
    }

    if (ctx.pathname === '/about') {
      const ok = ctx.auth.permissions.includes('about:read');
      if (!ok) {
        return {
          allow: false,
          status: 403,
          contentType: 'text/html; charset=utf-8',
          body: `<!DOCTYPE html><html><body>
            <h1>403</h1>
            <p>访问「关于」需要 <code>about:read</code> 权限</p>
            <p>演示：请求头 <code>x-demo-role: user</code> 或 <code>admin</code></p>
          </body></html>`,
        };
      }
    }

    return { allow: true };
  }
}
