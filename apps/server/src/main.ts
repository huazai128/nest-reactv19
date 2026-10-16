/**
 * @module main
 * @layer ssr-http
 * @responsibility Nest 应用启动：生产静态资源 / 开发 Rspack 代理
 * @troubleshoot 端口占用 → PORT；静态 404 → 先 pnpm build:client
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module.js';
import { mountDevProxy } from '@src/middlewares/dev-proxy/dev-proxy.middleware.js';
import { mountProdStatic } from '@src/middlewares/static/static.middleware.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    mountDevProxy(expressApp);
  } else {
    mountProdStatic(app);
  }
  const port = Number(process.env.PORT) || 3008;
  await app.listen(port);
  console.log(`[server] http://localhost:${port}`);
}

bootstrap();
