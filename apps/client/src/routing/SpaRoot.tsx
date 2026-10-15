/**
 * @module client/routing/SpaRoot
 * @layer client-bundle
 * @responsibility SPA 布局壳：顶栏导航 + 子路由出口 + MF 演示区
 * @troubleshoot 路由不匹配 → 查 routes/spa.routes 与 shared PAGE_ROUTES
 */
import { Link, Route, Routes } from 'react-router';
import { RemoteWidget } from '@src/components/RemoteWidget';
import { spaNavItems, spaRouteObjects } from '@src/routes/spa.routes';

/**
 * SPA 壳：导航 + 子路由（路由表见 routes/spa.routes.tsx）
 */
export function SpaRoot() {
  return (
    <div className="app">
      <header className="app-header">
        <nav>
          {spaNavItems.map((item) =>
            item.kind === 'spa' ? (
              <Link key={item.to} to={item.to}>{item.label}</Link>
            ) : (
              <a key={item.href} href={item.href}>{item.label}</a>
            ),
          )}
        </nav>
      </header>
      <main>
        <Routes>
          {spaRouteObjects.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
        <RemoteWidget />
      </main>
    </div>
  );
}
