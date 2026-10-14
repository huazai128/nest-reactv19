/**
 * @module shared/routing
 * @layer shared-contract
 * @responsibility 页面路由表与 matchPage（server/client 必须共用，避免 entry 不一致）
 * @troubleshoot 错误 entry 脚本 → 检查 MPA 是否先精确匹配；SPA 子路径权限在 server SpaPathGuard
 */
/** 单页应用：客户端路由 + 同一入口水合 */
export type SpaRenderMode = 'spa';
/** 多页应用：独立入口，整页导航 */
export type MpaRenderMode = 'mpa';

export type PageRenderMode = SpaRenderMode | MpaRenderMode;

export interface PageAccessRule {
  /** 满足任一权限即可访问；为空表示不校验 */
  permissions?: string[];
}

export interface PageRouteDefinition {
  id: string;
  /** 路由匹配（SPA 支持前缀 *，MPA 为精确 path） */
  path: string;
  mode: PageRenderMode;
  /** 对应 Rspack entry 名称 */
  clientEntry: string;
  title: string;
  /** Node 层访问控制元数据（由 RenderGuard 消费） */
  access?: PageAccessRule;
}

/**
 * 页面清单：先匹配 MPA 精确路径，其余回落到 SPA。
 * SPA 内路由由 react-router 声明式 Routes 管理（多页面路由）。
 */
export const PAGE_ROUTES: PageRouteDefinition[] = [
  {
    id: 'landing',
    path: '/landing',
    mode: 'mpa',
    clientEntry: 'landing',
    title: 'Landing — MPA',
  },
  {
    id: 'spa',
    path: '/*',
    mode: 'spa',
    clientEntry: 'main',
    title: 'SSR Host',
    access: {
      permissions: [],
    },
  },
];

export function matchPage(pathname: string): PageRouteDefinition {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  const mpa = PAGE_ROUTES.find(
    (p) => p.mode === 'mpa' && p.path === normalized,
  );
  if (mpa) return mpa;

  const spa = PAGE_ROUTES.find((p) => p.mode === 'spa');
  if (spa) return spa;

  return PAGE_ROUTES[PAGE_ROUTES.length - 1];
}
