/**
 * @module ssr/assets/asset.service
 * @layer ssr-assets
 * @responsibility 按 Rspack entry 名（main/landing）解析客户端 script/link 标签 HTML
 * @inputs clientEntry 字符串，与 PAGE_ROUTES.clientEntry 一致
 * @outputs 可插入文档底部的 scriptTags 字符串
 * @deps CLIENT_DEV_ORIGIN（dev）、apps/client/dist/client/manifest.json（prod）
 * @troubleshoot 生产脚本 404 → manifest 是否生成、entry 名是否与 rspack.entry 一致；dev 脚本失败 → :3100 是否启动
 */
import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

@Injectable()
export class AssetService {
  private readonly isDev = process.env.NODE_ENV !== 'production';
  private readonly clientDevOrigin =
    process.env.CLIENT_DEV_ORIGIN ?? 'http://localhost:3100';

  async getClientScripts(clientEntry: string): Promise<string> {
    if (this.isDev) {
      return `<script type="module" src="${this.clientDevOrigin}/${clientEntry}.js" defer></script>`;
    }

    const clientDir = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../../../client/dist/client',
    );
    try {
      const manifestPath = path.join(clientDir, 'manifest.json');
      const raw = await readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(raw) as Record<
        string,
        { file: string; css?: string[] }
      >;
      const entryKey = `${clientEntry}.js`;
      const entry =
        manifest[entryKey] ??
        Object.values(manifest).find((v) =>
          v.file?.startsWith(`${clientEntry}.`),
        );
      if (!entry?.file) {
        return this.fallbackProdScripts(clientEntry);
      }
      const css =
        entry.css
          ?.map((href) => `<link rel="stylesheet" href="/static/${href}">`)
          .join('') ?? '';
      return `${css}<script type="module" src="/static/${entry.file}" defer></script>`;
    } catch {
      return this.fallbackProdScripts(clientEntry);
    }
  }

  private fallbackProdScripts(clientEntry: string): string {
    return `<script type="module" src="/static/${clientEntry}.js" defer></script>`;
  }
}
