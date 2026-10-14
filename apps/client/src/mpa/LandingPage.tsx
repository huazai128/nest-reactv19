import { SsrMetaPanel } from '@src/components/SsrMetaPanel';

/** MPA 独立页：无 SPA 路由壳，整页刷新导航 */
export function LandingPage() {
  return (
    <article className="mpa-landing">
      <h1>MPA Landing</h1>
      <p>
        独立入口 <code>landing.js</code>，适合营销页 / 弱交互多页站点。
      </p>
      <p>
        <a href="/">返回 SPA 首页</a>
      </p>
      <SsrMetaPanel />
    </article>
  );
}
