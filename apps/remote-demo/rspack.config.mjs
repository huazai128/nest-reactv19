import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rspack from '@rspack/core';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('@rspack/core').Configuration} */
export default {
  context: __dirname,
  mode: isDev ? 'development' : 'production',
  entry: { main: './src/bootstrap.tsx' },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: 'http://localhost:3101/',
    module: false,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
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
            },
          },
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'demo_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.1.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.1.0' },
      },
      dts: false,
    }),
    isDev && new ReactRefreshRspackPlugin(),
    new rspack.HtmlRspackPlugin({ template: './src/index.html' }),
  ].filter(Boolean),
  devServer: {
    port: 3101,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
