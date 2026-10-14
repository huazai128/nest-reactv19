/**
 * @module client/rspack.server.config
 * @layer client-bundle
 * @responsibility Node SSR bundle → dist/server/ssr.mjs（ESM）
 */
import path from 'node:path';
import rspack from '@rspack/core';
import {
  createCssRule,
  distDir,
  rootDir,
  srcDir,
  srcPathAlias,
} from './rspack.shared.mjs';

const isDev = process.env.NODE_ENV !== 'production';

const reactCompiler =
  process.env.REACT_COMPILER !== '0'
    ? { compilationMode: 'infer' }
    : undefined;

const serverSwcLoader = {
  loader: 'builtin:swc-loader',
  options: {
    jsc: {
      parser: { syntax: 'typescript', tsx: true },
      transform: {
        react: {
          runtime: 'automatic',
          development: isDev,
          refresh: false,
        },
        reactCompiler,
      },
    },
  },
};

/** @type {import('@rspack/core').Configuration} */
export default {
  name: 'server',
  context: rootDir,
  mode: isDev ? 'development' : 'production',
  target: 'node',
  entry: {
    ssr: path.join(srcDir, 'entry.server.tsx'),
  },
  output: {
    path: path.join(distDir, 'server'),
    filename: 'ssr.mjs',
    publicPath: '/',
    chunkFormat: 'module',
    library: { type: 'module' },
    clean: true,
    module: true,
    environment: { module: true },
  },
  devtool: isDev ? 'cheap-module-source-map' : 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js'],
    },
    alias: {
      ...srcPathAlias,
      'demo_remote/Button': path.join(srcDir, 'stubs/remote-button.stub.tsx'),
      'react-router-dom': 'react-router',
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: serverSwcLoader,
      },
      // SSR bundle target=node，须显式 targets（见 rspack.shared browserTargets）
      createCssRule({ minify: false }),
    ],
  },
  plugins: [
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        isDev ? 'development' : 'production',
      ),
      __SERVER__: JSON.stringify(true),
    }),
  ],
  optimization: {
    minimize: false,
  },
  experiments: {
    css: true,
  },
};
