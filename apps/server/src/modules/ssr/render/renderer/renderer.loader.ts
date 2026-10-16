/**
 * @module modules/ssr/render/renderer/renderer.loader
 * @layer ssr-render
 * @responsibility 动态 import 客户端 ssr.mjs；dev 下 watch 热替换
 * @outputs ServerRenderer（pipeDocument）
 * @deps apps/client/dist/server/ssr.mjs
 * @troubleshoot bundle 路径错误 → 相对本文件 7 级到 apps/client；加载失败 → 先 pnpm dev:client
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import path from 'node:path';
import type { Writable } from 'node:stream';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync, watch } from 'node:fs';
import type { SsrPageState } from '@app/shared';

export interface PipeDocumentMeta {
  headExtra: string;
  scriptTags: string;
  statePatch?: Partial<SsrPageState>;
}

export interface ServerRenderer {
  pipeDocument: (
    url: string,
    writable: Writable,
    meta: PipeDocumentMeta,
  ) => Promise<SsrPageState>;
  serializeState: (state: SsrPageState) => string;
}

@Injectable()
export class RendererLoader implements OnModuleInit {
  private readonly logger = new Logger(RendererLoader.name);
  private renderer: ServerRenderer | null = null;
  private readonly isDev = process.env.NODE_ENV !== 'production';
  private readonly bundlePath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../../../../client/dist/server/ssr.mjs',
  );

  async onModuleInit() {
    await this.load();
    if (this.isDev) {
      const dir = path.dirname(this.bundlePath);
      if (existsSync(dir)) {
        watch(dir, { recursive: false }, () => {
          this.logger.log('SSR bundle changed, reloading…');
          void this.load();
        });
      }
    }
  }

  getRenderer(): ServerRenderer {
    if (!this.renderer) {
      throw new Error('SSR renderer not loaded. Run pnpm dev:client first.');
    }
    return this.renderer;
  }

  private async load() {
    try {
      const url = `${pathToFileURL(this.bundlePath).href}?t=${Date.now()}`;
      const mod = await import(url);
      this.renderer = mod as ServerRenderer;
      this.logger.log('SSR renderer ready (streaming)');
    } catch (err) {
      this.logger.warn(
        `SSR bundle not found at ${this.bundlePath}. Waiting for client build…`,
      );
      this.logger.debug(err);
    }
  }
}
