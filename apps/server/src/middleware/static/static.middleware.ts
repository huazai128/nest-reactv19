/**
 * @module middleware/static/static.middleware
 * @layer middleware
 * @responsibility 生产态托管 apps/client/dist/client
 */
import type { INestApplication } from '@nestjs/common';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function mountProdStatic(app: INestApplication) {
  const clientDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../../client/dist/client',
  );
  app.use(
    '/static',
    express.static(clientDir, { maxAge: '1y', immutable: true }),
  );
}
