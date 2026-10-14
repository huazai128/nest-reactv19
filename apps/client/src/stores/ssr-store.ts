/**
 * @module client/stores/ssr-store
 * @layer client-ssr
 * @responsibility 承接 Node 注入的 __SSR_STATE__，水合后只读；与 UI store 分离避免联动渲染
 * @inputs hydrateSsrFromWindow() 读取 window[SSR_STATE_KEY]
 * @troubleshoot 页面无 server 字段 → ServerStateEnricher；hydrated 始终 false → 入口未调 hydrate
 */
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { SsrPageState, SsrServerContext } from '@app/shared';
import { SSR_STATE_KEY } from '@app/shared';

export interface SsrStoreState {
  hydrated: boolean;
  page: SsrPageState | null;
}

export const ssrStore = createStore<SsrStoreState>(() => ({
  hydrated: false,
  page: null,
}));

/** 入口脚本在水合 React 之前调用一次 */
export function hydrateSsrFromWindow(): void {
  if (typeof window === 'undefined') return;
  const raw = window[SSR_STATE_KEY];
  if (!raw) return;
  ssrStore.setState({ hydrated: true, page: raw });
  delete window[SSR_STATE_KEY];
}

declare global {
  interface Window {
    [SSR_STATE_KEY]?: SsrPageState;
  }
}

/** 仅订阅 pageId，其它 slice 变更不触发重渲染 */
export function useSsrPageId(): string | null {
  return useStore(ssrStore, (s) => s.page?.pageId ?? null);
}

export function useSsrPageMode(): SsrPageState['mode'] | null {
  return useStore(ssrStore, (s) => s.page?.mode ?? null);
}

export function useSsrServerContext(): SsrServerContext | null {
  return useStore(ssrStore, (s) => s.page?.server ?? null);
}

/** 展示用 JSON：仅在 page 引用变化时更新 */
export function useSsrPageJson(): string | null {
  return useStore(ssrStore, (s) =>
    s.page ? JSON.stringify(s.page, null, 2) : null,
  );
}

export function useSsrHydrated(): boolean {
  return useStore(ssrStore, (s) => s.hydrated);
}
