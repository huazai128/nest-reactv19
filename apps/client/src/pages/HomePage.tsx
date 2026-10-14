import { SsrMetaPanel } from '@src/components/SsrMetaPanel';
import { SsrMetaToolbar } from '@src/components/SsrMetaToolbar';

/**
 * 首页不直接 useStore，避免任意全局状态变化导致整页重渲染。
 * SSR / UI 状态由子组件按 slice 订阅。
 */
export function HomePage() {
  return (
    <section>
      <h1>首页</h1>
      <p>React 19 + Rspack 2 + 流式 SSR + Zustand（颗粒化订阅）</p>
      <SsrMetaToolbar />
      <SsrMetaPanel />
    </section>
  );
}
