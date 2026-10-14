/**
 * @module shared/index
 * @layer shared-contract
 * @responsibility SSR_STATE_KEY、SsrPageState、createInitialState（与 client entry.server 对齐）
 * @troubleshoot 字段不一致 → 须同时改本文件、entry.server、ServerStateEnricher
 */
/** SSR 注入到页面的初始状态 key，前后端约定一致 */
export const SSR_STATE_KEY = '__SSR_STATE__';

export type {
  PageRouteDefinition,
  PageRenderMode,
  SpaRenderMode,
  MpaRenderMode,
} from './routing.js';
export { PAGE_ROUTES, matchPage } from './routing.js';

import type { PageRenderMode } from './routing.js';
import { matchPage } from './routing.js';

/** 由 Node 注入、浏览器只读的业务上下文（权限、租户等） */
export interface SsrServerContext {
  permissions?: string[];
  userId?: string | null;
  [key: string]: unknown;
}

export interface SsrPageState {
  url: string;
  renderedAt: string;
  mode: PageRenderMode;
  pageId: string;
  title: string;
  /** Node 层 enricher / guard 写入，供前端水合后读取 */
  server?: SsrServerContext;
}

export function createInitialState(url: string): SsrPageState {
  const pathname = url.split('?')[0] ?? url;
  const page = matchPage(pathname);

  return {
    url,
    renderedAt: new Date().toISOString(),
    mode: page.mode,
    pageId: page.id,
    title: page.title,
  };
}
