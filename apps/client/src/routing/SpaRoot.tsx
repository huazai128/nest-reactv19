import { Link, Route, Routes } from 'react-router';
import { HomePage } from '@src/pages/HomePage';
import { AboutPage } from '@src/pages/AboutPage';
import { RemoteWidget } from '@src/components/RemoteWidget';

/** SPA：react-router v8 声明式多路由 */
export function SpaRoot() {
  return (
    <div className="app">
      <header className="app-header">
        <nav>
          <Link to="/">首页</Link>
          <Link to="/about">关于</Link>
          <a href="/landing">MPA Landing</a>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <RemoteWidget />
      </main>
    </div>
  );
}
