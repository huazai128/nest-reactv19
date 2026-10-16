/**
 * @module client/routes/spa.routes
 * @layer client-bundle
 * @responsibility SPA 导航与 Route 配置
 * @troubleshoot 404 → 同步改此处与 packages/shared PAGE_ROUTES
 */
import type { RouteObject } from 'react-router';
import { AboutPage } from '@src/pages/about/AboutPage';
import { HomePage } from '@src/pages/home/HomePage';

export const spaNavItems = [
  { kind: 'spa' as const, to: '/', label: '首页' },
  { kind: 'spa' as const, to: '/about', label: '关于' },
  { kind: 'mpa' as const, href: '/landing', label: 'MPA Landing' },
];

export const spaRouteObjects: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/about', element: <AboutPage /> },
];
