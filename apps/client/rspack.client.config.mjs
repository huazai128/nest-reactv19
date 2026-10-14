/**
 * @module client/rspack.client.config
 * @layer client-bundle
 * @responsibility 浏览器 + MF 宿主构建（main/landing entries）
 */
import path from 'node:path';
import rspack from '@rspack/core';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import {
  browserTargets,
  createCssRule,
  distDir,
  mfOptions,
  rootDir,
  srcDir,
  srcPathAlias,
  swcLoader,
} from './rspack.shared.mjs';

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('@rspack/core').Configuration} */
export default {
  name: 'client',
  context: rootDir,
  mode: isDev ? 'development' : 'production',
  entry: {
    main: path.join(srcDir, 'entry.client.tsx'),
    landing: path.join(srcDir, 'mpa/landing.client.tsx'),
  },
  output: {
    path: path.join(distDir, 'client'),
    filename: isDev ? '[name].js' : '[name].[contenthash:8].js',
    chunkFilename: isDev ? '[name].js' : '[name].[contenthash:8].js',
    publicPath: isDev ? 'http://localhost:3100/' : '/static/',
    clean: true,
    module: false,
  },
  devtool: isDev ? 'cheap-module-source-map' : 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js'],
    },
    alias: {
      ...srcPathAlias,
      'react-router-dom': 'react-router',
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: swcLoader,
      },
      createCssRule({ minify: !isDev }),
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      ...mfOptions,
      shared: {
        ...mfOptions.shared,
        react: { ...mfOptions.shared.react, treeShaking: true },
        'react-dom': { ...mfOptions.shared['react-dom'], treeShaking: true },
      },
    }),
    isDev && new ReactRefreshRspackPlugin(),
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        isDev ? 'development' : 'production',
      ),
      __SERVER__: JSON.stringify(false),
    }),
    new rspack.HtmlRspackPlugin({
      template: path.join(srcDir, 'index.html'),
      inject: 'body',
      scriptLoading: 'defer',
      chunks: ['main'],
    }),
    // Rspack 2 无 ManifestPlugin；生产脚本路径由 AssetService 按 entry 前缀解析
  ].filter(Boolean),
  devServer: {
    port: 3100,
    hot: true,
    liveReload: false,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    allowedHosts: 'all',
  },
  optimization: {
    minimize: !isDev,
    minimizer: !isDev
      ? [
          new rspack.SwcJsMinimizerRspackPlugin(),
          new rspack.LightningCssMinimizerRspackPlugin({
            minimizerOptions: { targets: browserTargets },
          }),
        ]
      : undefined,
  },
  experiments: {
    css: true,
  },
};
