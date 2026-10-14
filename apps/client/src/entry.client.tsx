/**
 * @module client/entry.client
 * @layer client-ssr
 * @responsibility SPA 入口水合（main.js）；BrowserRouter + SpaRoot
 * @troubleshoot 路由不匹配 → server StaticRouter 与 client 路由表须一致
 */
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { hydrateSsrFromWindow } from '@src/stores/index.js';
import { SpaRoot } from '@src/routing/SpaRoot';
import '@src/styles/global.css';

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
