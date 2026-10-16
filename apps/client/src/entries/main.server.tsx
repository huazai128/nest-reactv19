/**
 * @module client/entries/main.server
 * @layer client-ssr
 * @responsibility 流式 pipeDocument（Rspack server bundle 导出 pipeDocument）
 * @troubleshoot Suspense 边界 → 远程组件仅客户端挂载；state 缺 server → ServerStateEnricher
 */
import { PassThrough } from 'node:stream';
import type { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import {
  createInitialState,
  matchPage,
  SSR_STATE_KEY,
  type SsrPageState,
} from '@app/shared';
import { createPageTree } from '@src/render/createPageTree';

export interface PipeDocumentMeta {
  headExtra: string;
  scriptTags: string;
  statePatch?: Partial<import('@app/shared').SsrPageState>;
}

export function serializeState(state: SsrPageState): string {
  const json = JSON.stringify(state).replace(/</g, '\\u003c');
  return `<script>window.${SSR_STATE_KEY}=${json}</script>`;
}

function buildShellPrefix(state: SsrPageState, headExtra: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${state.title}</title>
  ${headExtra}
</head>
<body>
  <div id="root">`;
}

function buildShellSuffix(state: SsrPageState, scriptTags: string): string {
  return `</div>
  ${serializeState(state)}
  ${scriptTags}
</body>
</html>`;
}

/** 流式 SSR：shell 就绪后 pipe React 流，再写入 state 与脚本 */
export function pipeDocument(
  url: string,
  writable: Writable,
  meta: PipeDocumentMeta,
): Promise<SsrPageState> {
  const pathname = url.split('?')[0] ?? '/';
  const page = matchPage(pathname);
  const state = { ...createInitialState(url), ...meta.statePatch };
  const tree = createPageTree(url, page);
  const prefix = buildShellPrefix(state, meta.headExtra);
  const suffix = buildShellSuffix(state, meta.scriptTags);

  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(tree, {
      onShellReady() {
        writable.write(prefix);
        const reactOut = new PassThrough();
        pipe(reactOut);
        reactOut.on('data', (chunk: Buffer) => {
          writable.write(chunk);
        });
        reactOut.on('end', () => {
          writable.write(suffix);
          writable.end();
          resolve(state);
        });
        reactOut.on('error', (err: Error) => {
          abort();
          reject(err);
        });
      },
      onShellError(error) {
        reject(error);
      },
      onError(error) {
        console.error('[SSR stream]', error);
      },
    });
  });
}
