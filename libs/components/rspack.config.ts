import path from 'node:path';
import { rspack } from '@rspack/core';
import type { Configuration } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';

/**
 * REMOTE — libs/components, порт 5003
 *
 * Использует @demo/ui и @demo/common из shared scope хоста.
 * import: false — не бандлить эти модули в чанки components,
 *                 брать готовый экземпляр из shared scope.
 *                 Это гарантирует единственный ThemeContext и единственный $counter.
 *
 * Правила eager в Remote:
 *   НЕ использовать eager: true — модули придут из shared scope хоста,
 *   который уже инициализирован к моменту загрузки Remote.
 */
export default (_env: unknown, argv: Record<string, string> = {}): Configuration => {
  const mode = (argv.mode ?? 'development') as 'development' | 'production';
  const isProduction = mode === 'production';
  const isRsdoctorEnabled = process.env.RSDOCTOR === 'true';
  const devPort = Number(process.env.COMPONENTS_PORT ?? 5003);

  return {
    mode,
    entry: './src/index.ts',
    devtool: 'source-map',
    experiments: { css: false },
    output: {
      path: path.resolve(import.meta.dirname, 'dist'),
      publicPath: `http://localhost:${devPort}/`,
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      uniqueName: 'demo_components',
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
        name: 'demo_components',
        filename: 'remoteEntry.js',
        remotes: {
          '@demo/common': 'demo_common@http://localhost:5002/mf-manifest.json',
        },
        exposes: {
          './ThemedCounter': './src/ThemedCounter',
          '.': './src/index',
        },
        shared: {
          // В Remote НЕ нужен eager: true — react придёт из shared scope хоста
          react: { singleton: true, requiredVersion: '^18.2.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
          effector: { singleton: true, requiredVersion: '^22.4.0' },
          'effector-react': { singleton: true, requiredVersion: '^22.3.0' },

          // import: false — не включать @demo/ui в бандл components.
          // MF возьмёт экземпляр из shared scope хоста.
          // Именно это гарантирует единственный ThemeContext ✅
          '@demo/ui': { singleton: true, import: false },
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
