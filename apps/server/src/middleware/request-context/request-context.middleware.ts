/**
 * @module middleware/request-context/request-context.middleware
 * @layer middleware
 * @responsibility 演示鉴权：x-demo-role → Locals.renderAuth（生产替换为 JWT/Session）
 * @troubleshoot 权限始终 guest → 未传 Headers.demoRole
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { Headers, Locals } from '@src/middleware/middleware.constants.js';
import {
  createAnonymousAuth,
  type RenderAuthLocals,
} from '@src/middleware/types/render-auth.js';

/**
 * 解析请求身份（示例：Header 演示）。
 * 生产环境可替换为 JWT / Session / SSO 解析。
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const role = req.header(Headers.demoRole) ?? 'guest';
    const auth: RenderAuthLocals = mapRoleToAuth(role);
    res.locals[Locals.renderAuth] = auth;
    next();
  }
}

function mapRoleToAuth(role: string): RenderAuthLocals {
  if (role === 'admin') {
    return {
      userId: 'demo-admin',
      roles: ['admin'],
      permissions: ['admin', 'about:read'],
    };
  }
  if (role === 'user') {
    return {
      userId: 'demo-user',
      roles: ['user'],
      permissions: ['about:read'],
    };
  }
  return createAnonymousAuth();
}
