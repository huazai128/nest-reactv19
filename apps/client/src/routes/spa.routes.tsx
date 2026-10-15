/**
 * @module client/routes/spa.routes
 * @layer client-bundle
 * @responsibility SPA 导航与 Route 配置（对齐参考项目 src/routes 集中声明）
 * @troubleshoot 404 → 同步改此处与 packages/shared PAGE_ROUTES（SPA 回落）
 */
import type { RouteObject } from 'react-router';
import { HomePage } from '@src/pages/HomePage';
import { AboutPage } from '@src/pages/AboutPage';

/** 顶栏导航：SPA 用 Link，MPA 用整页 href */
export const spaNavItems = [
  { kind: 'spa' as const, to: '/', label: '首页' },
  { kind: 'spa' as const, to: '/about', label: '关于' },
  { kind: 'mpa' as const, href: '/landing', label: 'MPA Landing' },
];

/** react-router 子路由表 */
export const spaRouteObjects: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/about', element: <AboutPage /> },
];
