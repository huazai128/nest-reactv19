/**
 * @module client/entries/main.client
 * @layer client-ssr
 * @responsibility SPA 入口水合（Rspack entry: main）
 * @troubleshoot 路由不匹配 → server StaticRouter 与 routes/spa.routes 须一致
 */
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { hydrateSsrFromWindow } from '@src/stores/index.js';
import { SpaRoot } from '@src/routes/SpaRoot';
import '@src/styles/bundle.css';

hydrateSsrFromWindow();

const container = document.getElementById('root');
if (!container) {
  throw new Error('#root not found');
}

hydrateRoot(
  container,
  <BrowserRouter>
    <SpaRoot />
  </BrowserRouter>,
);
