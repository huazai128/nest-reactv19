import { SsrMetaPanel } from '@src/components/SsrMetaPanel';
import { SsrMetaToolbar } from '@src/components/SsrMetaToolbar';

/**
 * SPA 首页：子组件按 slice 订阅 store，避免整页重渲染。
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
