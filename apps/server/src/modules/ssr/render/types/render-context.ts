/**
 * @module modules/ssr/render/types/render-context
 * @layer ssr-render
 * @responsibility RenderContext 结构与 createRenderContext 工厂
 */
import type { PageRouteDefinition, SsrPageState } from '@app/shared';
import type { Request, Response } from 'express';
import { Locals } from '@src/middlewares/middleware.constants.js';
import {
  createAnonymousAuth,
  type RenderAuthLocals,
} from '@src/middlewares/types/render-auth.js';

/** 单次页面渲染的不可变输入 + 可变流水线上下文 */
export interface RenderContext {
  request: Request;
  response: Response;
  url: string;
  pathname: string;
  page: PageRouteDefinition;
  auth: RenderAuthLocals;
  headFragments: string[];
  scriptTags: string;
  statePatch: Partial<SsrPageState>;
}

export function createRenderContext(
  request: Request,
  response: Response,
  page: PageRouteDefinition,
): RenderContext {
  const url = request.url;
  const pathname = url.split('?')[0] ?? '/';

  return {
    request,
    response,
    url,
    pathname,
    page,
    auth:
      (response.locals[Locals.renderAuth] as RenderAuthLocals | undefined) ??
      createAnonymousAuth(),
    headFragments: [],
    scriptTags: '',
    statePatch: {},
  };
}

export function getHeadHtml(ctx: RenderContext): string {
  return ctx.headFragments.filter(Boolean).join('\n');
}
