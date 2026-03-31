import path from 'node:path';
import { rspack } from '@rspack/core';
import type { Configuration } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';

/**
 * REMOTE — libs/common, порт 5002
 *
 * Предоставляет Effector-сторы и бизнес-логику.
 * Нет React Context → проблема с дублированием экземпляров не критична,
 * но всё равно важно чтобы Effector-сторы были синглтонами.
 *
 * Host загружает common как Remote, регистрирует в shared scope.
 * @demo/components берёт тот же экземпляр из shared scope (import: false).
 */
export default (_env: unknown, argv: Record<string, string> = {}): Configuration => {
  const mode = (argv.mode ?? 'development') as 'development' | 'production';
  const isProduction = mode === 'production';
  const isRsdoctorEnabled = process.env.RSDOCTOR === 'true';
  const devPort = Number(process.env.COMMON_PORT ?? 5002);

  return {
    mode,
    entry: './src/index.ts',
    devtool: 'source-map',
    experiments: { css: false },
    output: {
      path: path.resolve(import.meta.dirname, 'dist'),
      publicPath: `http://localhost:${devPort}/`,
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      uniqueName: 'demo_common',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      tsConfig: path.resolve(import.meta.dirname, 'tsconfig.json'),
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: { syntax: 'typescript', tsx: true },
                transform: { react: { runtime: 'automatic' } },
                target: 'es2020',
              },
            },
          },
        },
      ],
    },
    plugins: [
      ...(!isProduction ? [new ReactRefreshPlugin()] : []),
      ...(isRsdoctorEnabled
        ? [new RsdoctorRspackPlugin({ supports: { generateTileGraph: true } })]
        : []),
      new ModuleFederationPlugin({
        name: 'demo_common',
        filename: 'remoteEntry.js',
        exposes: {
          './counter': './src/counter',
          '.': './src/index',
        },
        shared: {
          // В Remote НЕ нужен eager: true
          react: { singleton: true, requiredVersion: '^18.2.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
          effector: { singleton: true, requiredVersion: '^22.4.0' },
          'effector-react': { singleton: true, requiredVersion: '^22.3.0' },
        },
        dts: { generateTypes: true },
      }),
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [new rspack.SwcJsMinimizerRspackPlugin({ extractComments: { banner: true } })],
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
      concatenateModules: true,
      usedExports: true,
    },
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    },
    devServer: {
      port: devPort,
      hot: true,
      liveReload: false,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
    },
  };
};
