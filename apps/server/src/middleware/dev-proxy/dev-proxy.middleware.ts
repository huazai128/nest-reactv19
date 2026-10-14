/**
 * @module middleware/dev-proxy/dev-proxy.middleware
 * @layer middleware
 * @responsibility 开发态 /static → Rspack devServer（ws HMR）
 */
import type { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 开发态：/static 代理到 Rspack devServer（HMR） */
export function mountDevProxy(app: Express) {
  const clientOrigin = process.env.CLIENT_DEV_ORIGIN ?? 'http://localhost:3100';

  app.use(
    '/static',
    createProxyMiddleware({
      target: clientOrigin,
      changeOrigin: true,
      pathRewrite: { '^/static': '' },
      ws: true,
    }),
  );

  const clientDist = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../../client/dist/client',
  );
  app.use('/static', express.static(clientDist));
}
