/**
 * @module client/stores/ui-store
 * @layer client-ssr
 * @responsibility 纯浏览器 UI 状态（与 SSR 快照无关），按字段订阅减少重渲染
 * @troubleshoot 改 UI 导致 SSR 区块闪烁 → 勿在父组件 useUiStore 全量订阅，用子组件 + 细 selector
 */
import { create } from 'zustand';

interface UiState {
  ssrMetaExpanded: boolean;
  setSsrMetaExpanded: (expanded: boolean) => void;
  toggleSsrMetaExpanded: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  ssrMetaExpanded: false,
  setSsrMetaExpanded: (expanded) => set({ ssrMetaExpanded: expanded }),
  toggleSsrMetaExpanded: () =>
    set((s) => ({ ssrMetaExpanded: !s.ssrMetaExpanded })),
}));

/** 仅订阅展开态 */
export function useSsrMetaExpanded(): boolean {
  return useUiStore((s) => s.ssrMetaExpanded);
}

/** 仅订阅 toggle，不订阅 expanded → 点击按钮的组件不因展开态重渲染 */
export function useToggleSsrMetaExpanded(): () => void {
  return useUiStore((s) => s.toggleSsrMetaExpanded);
}
