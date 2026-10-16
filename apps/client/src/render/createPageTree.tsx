/**
 * @module client/render/createPageTree
 * @layer client-ssr
 * @responsibility 按 matchPage 结果组装 SSR React 树（SPA / MPA）
 * @troubleshoot MPA 走了 SPA 壳 → 查 shared PAGE_ROUTES 顺序
 */
import { StaticRouter } from 'react-router';
import type { PageRouteDefinition } from '@app/shared';
import { LandingPage } from '@src/pages/landing/LandingPage';
import { SpaRoot } from '@src/routes/SpaRoot';

export function createPageTree(url: string, page: PageRouteDefinition) {
  const pathname = url.split('?')[0] ?? '/';

  if (page.mode === 'mpa' && page.id === 'landing') {
    return <LandingPage />;
  }

  return (
    <StaticRouter location={pathname}>
      <SpaRoot />
    </StaticRouter>
  );
}
