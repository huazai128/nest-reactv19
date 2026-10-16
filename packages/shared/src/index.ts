/**
 * @module shared/index
 * @layer shared-contract
 * @responsibility 对外统一导出（路由 + SSR 状态）
 */
export type {
  PageRouteDefinition,
  PageRenderMode,
  SpaRenderMode,
  MpaRenderMode,
} from './routing.js';
export { PAGE_ROUTES, matchPage } from './routing.js';

export {
  SSR_STATE_KEY,
  createInitialState,
  type SsrPageState,
  type SsrServerContext,
} from './ssr-state.js';
