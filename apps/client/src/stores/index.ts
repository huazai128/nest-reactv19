/**
 * @module client/stores/index
 * @layer client-ssr
 * @responsibility 状态层导出入口：SSR 快照（服务端注入）与 UI（客户端独占）分 store
 */
export {
  hydrateSsrFromWindow,
  useSsrPageId,
  useSsrPageMode,
  useSsrServerContext,
  useSsrPageJson,
  useSsrHydrated,
  ssrStore,
} from '@src/stores/ssr-store.js';

export {
  useUiStore,
  useSsrMetaExpanded,
  useToggleSsrMetaExpanded,
} from '@src/stores/ui-store.js';
