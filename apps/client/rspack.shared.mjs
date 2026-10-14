/**
 * @module client/rspack.shared
 * @layer client-bundle
 * @responsibility MF v2、SWC/React Compiler、Lightning CSS 规则（createCssRule）
 * @troubleshoot MF 共享版本冲突 → shared.requiredVersion；Compiler 报错 → REACT_COMPILER=0
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production';

export const rootDir = __dirname;
export const srcDir = path.join(rootDir, 'src');
export const distDir = path.join(rootDir, 'dist');

/** apps/client 内源码引用统一 @src/…（与 tsconfig paths、Skill §导入 一致） */
export const srcPathAlias = {
  '@src': srcDir,
};

/** Module Federation v2：宿主应用 */
export const mfOptions = {
  name: 'ssr_host',
  filename: 'remoteEntry.js',
  remotes: {
    demo_remote: 'demo_remote@http://localhost:3101/mf-manifest.json',
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^19.2.7',
      eager: false,
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^19.2.7',
      eager: false,
    },
    'react-router': {
      singleton: true,
      requiredVersion: '^8.0.0',
      eager: false,
    },
  },
  dts: false,
};

const reactCompiler =
  process.env.REACT_COMPILER !== '0'
    ? { compilationMode: 'infer' }
    : undefined;

/** 与 Lightning CSS targets 一致；根目录可扩展 browserslist */
export const browserTargets =
  'last 2 Chrome versions, last 2 Firefox versions, last 2 Safari versions';

/**
 * 样式走 builtin:lightningcss-loader（解析、嵌套、降级、压缩）
 * @param {{ minify?: boolean }} opts
 */
export function createCssRule({ minify = false } = {}) {
  return {
    test: /\.css$/,
    type: 'css/auto',
    use: [
      {
        loader: 'builtin:lightningcss-loader',
        options: {
          targets: browserTargets,
          minify,
          errorRecovery: true,
        },
      },
    ],
  };
}

export const swcLoader = {
  loader: 'builtin:swc-loader',
  options: {
    jsc: {
      parser: { syntax: 'typescript', tsx: true },
      transform: {
        react: {
          runtime: 'automatic',
          development: isDev,
          refresh: isDev,
        },
        reactCompiler,
      },
    },
  },
};
