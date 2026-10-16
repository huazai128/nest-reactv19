/**
 * @module client/rspack.shared
 * @layer client-bundle
 * @responsibility MF v2、SWC/React Compiler、Lightning CSS 规则（createCssRule）
 * @troubleshoot MF 共享版本冲突 → shared.requiredVersion；样式 → scripts/compile-styles.mjs 生成 bundle.css
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import {
  createStageTimingPlugin,
  isStageTimingEnabled,
} from './rspack.stage-timing.plugin.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production';

export const rootDir = __dirname;
export const srcDir = path.join(rootDir, 'src');
export const distDir = path.join(rootDir, 'dist');

/** apps/client 内源码引用统一 @src/…（与 tsconfig paths、Skill §导入 一致） */
const srcDirResolved = path.resolve(srcDir);

export const srcPathAlias = {
  '@src': srcDirResolved,
  '@src/': `${srcDirResolved}/`,
};

const resolveExtensions = ['.tsx', '.ts', '.jsx', '.js', '.json', '.scss', '.css'];

const resolveExtensionAlias = {
  '.js': ['.ts', '.tsx', '.js'],
};

/**
 * Rspack resolve：alias + tsconfig paths（避免 serve/watch 下 @src 未命中）
 * @param {Record<string, string>} [extraAlias]
 */
/** 默认开启；设 RSPACK_STAGE_TIMING=0 关闭各阶段耗时日志 */
export function createStageTimingPlugins() {
  return isStageTimingEnabled() ? [createStageTimingPlugin()] : [];
}

export function createResolve(extraAlias = {}) {
  return {
    extensions: resolveExtensions,
    extensionAlias: resolveExtensionAlias,
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(rootDir, 'tsconfig.json'),
        extensions: resolveExtensions,
      }),
    ],
    alias: {
      ...srcPathAlias,
      ...extraAlias,
    },
  };
}

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
