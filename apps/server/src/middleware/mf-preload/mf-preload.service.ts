/**
 * @module middleware/mf-preload/mf-preload.service
 * @layer middleware
 * @responsibility 拉取宿主/远程 mf-manifest，生成 modulepreload/preload link HTML
 * @outputs getPreloadLinkTags() 字符串（带 30s 缓存）
 * @troubleshoot 空 tags → dev 时 :3100 未起；prod 查 client/dist/client/mf-manifest.json
 */
import { Injectable, Logger } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REMOTE_MANIFESTS = ['http://localhost:3101/mf-manifest.json'];

interface MfManifestMeta {
  publicPath?: string;
  remoteEntry?: { name?: string; path?: string };
}

@Injectable()
export class MfPreloadService {
  private readonly logger = new Logger(MfPreloadService.name);
  private readonly isDev = process.env.NODE_ENV !== 'production';
  private readonly clientDevOrigin =
    process.env.CLIENT_DEV_ORIGIN ?? 'http://localhost:3100';
  private cache: { html: string; expires: number } | null = null;
  private readonly ttlMs = 30_000;

  async getPreloadLinkTags(): Promise<string> {
    if (this.cache && this.cache.expires > Date.now()) {
      return this.cache.html;
    }
    const tags = await this.buildTags();
    this.cache = { html: tags, expires: Date.now() + this.ttlMs };
    return tags;
  }

  warmCache(): void {
    void this.getPreloadLinkTags().catch((err) => {
      this.logger.debug(`MF preload warm failed: ${String(err)}`);
    });
  }

  private async buildTags(): Promise<string> {
    const links: string[] = [];
    const hostManifest = await this.readHostManifest();

    if (hostManifest?.metaData?.publicPath) {
      const base = hostManifest.metaData.publicPath;
      const entry =
        hostManifest.metaData.remoteEntry?.path ?? 'remoteEntry.js';
      links.push(
        `<link rel="modulepreload" href="${base}${entry}" crossorigin>`,
      );
      links.push(
        `<link rel="preload" href="${base}mf-manifest.json" as="fetch" crossorigin>`,
      );
    }

    for (const remoteUrl of REMOTE_MANIFESTS) {
      links.push(
        `<link rel="preload" href="${remoteUrl}" as="fetch" crossorigin>`,
      );
      if (this.isDev) {
        try {
          const res = await fetch(remoteUrl);
          if (res.ok) {
            const remote = (await res.json()) as { metaData?: MfManifestMeta };
            const base = remote.metaData?.publicPath;
            const entry =
              remote.metaData?.remoteEntry?.path ?? 'remoteEntry.js';
            if (base) {
              links.push(
                `<link rel="modulepreload" href="${base}${entry}" crossorigin>`,
              );
            }
          }
        } catch {
          /* remote optional */
        }
      }
    }

    return links.join('\n');
  }

  private async readHostManifest(): Promise<{ metaData?: MfManifestMeta } | null> {
    if (this.isDev) {
      try {
        const res = await fetch(`${this.clientDevOrigin}/mf-manifest.json`);
        if (res.ok) return (await res.json()) as { metaData?: MfManifestMeta };
      } catch {
        return null;
      }
    }

    const manifestPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../../../client/dist/client/mf-manifest.json',
    );
    try {
      const raw = await readFile(manifestPath, 'utf-8');
      return JSON.parse(raw) as { metaData?: MfManifestMeta };
    } catch {
      return null;
    }
  }
}
