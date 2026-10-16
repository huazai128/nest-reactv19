/**
 * @module shared/ssr-state
 * @layer shared-contract
 * @responsibility SSR 注入 key、页面状态形状、createInitialState
 * @troubleshoot 与 entries/main.server / stores 字段不一致 → 须同步三处
 */
import type { PageRenderMode } from './routing.js';
import { matchPage } from './routing.js';

/** SSR 注入到页面的初始状态 key，前后端约定一致 */
export const SSR_STATE_KEY = '__SSR_STATE__';

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
