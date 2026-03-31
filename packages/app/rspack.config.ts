import path from 'node:path';
import { rspack } from '@rspack/core';
import type { Configuration } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { HtmlRspackPlugin } from '@rspack/core';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';

/**
 * HOST — packages/app, порт 5000
 *
 * Архитектура:
 *   @demo/ui        — shared БИБЛИОТЕКА (НЕ Remote)
 *                     Бандлится из node_modules в бандл host.
 *                     Регистрируется в shared scope один раз.
 *                     Все Remotes берут из shared scope → Context работает ✅
 *
 *   @demo/common    — Remote (порт 5002) + shared
 *                     Загружается с порта 5002, регистрируется в shared scope.
 *                     Remotes берут Effector-сторы из shared scope → singleton ✅
 *
 *   @demo/components — Remote (порт 5003)
 *                     Использует @demo/ui и @demo/common из shared scope.
 *
 * Правила eager:
 *   eager: true  — только react/react-dom в HOST (критичный путь, нужен до любого рендера)
 *   eager: false — всё остальное (async bootstrap позволяет MF инициализироваться до старта)
 */
export default (_env: unknown, argv: Record<string, string> = {}): Configuration => {
  const mode = (argv.mode ?? 'development') as 'development' | 'production';
  const isProduction = mode === 'production';
  const isRsdoctorEnabled = process.env.RSDOCTOR === 'true';
  const devPort = Number(process.env.APP_PORT ?? 5000);

  return {
    mode,
    entry: './src/index.ts',
    lazyCompilation: false,
    devtool: 'source-map',
    experiments: { css: false },
    output: {
      path: path.resolve(import.meta.dirname, 'dist'),
      publicPath: isProduction ? '/' : `http://localhost:${devPort}/`,
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      uniqueName: 'demo_app',
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
      new HtmlRspackPlugin({ template: './public/index.html' }),
      ...(isRsdoctorEnabled
        ? [new RsdoctorRspackPlugin({ supports: { generateTileGraph: true } })]
        : []),
      new ModuleFederationPlugin({
        name: 'demo_app',
        // @demo/ui НЕ в remotes — бандлится как библиотека из node_modules
        remotes: {
          '@demo/common': 'demo_common@http://localhost:5002/mf-manifest.json',
          '@demo/components': 'demo_components@http://localhost:5003/mf-manifest.json',
        },
        shared: {
          // eager: true только для React — нужен синхронно до любого рендера
          react: { singleton: true, eager: true, requiredVersion: '^18.2.0' },
          'react-dom': { singleton: true, eager: true, requiredVersion: '^18.2.0' },

          // @demo/ui — host предоставляет в shared scope как библиотека
          // Remotes возьмут этот экземпляр → один ThemeContext для всех ✅
          '@demo/ui': { singleton: true },

          // Effector без eager — MF инициализирует его до bootstrap благодаря async entry
          effector: { singleton: true, requiredVersion: '^22.4.0' },
          'effector-react': { singleton: true, requiredVersion: '^22.3.0' },
        },
        dts: !isProduction ? { consumeTypes: true } : false,
        dev: !isProduction ? { disableHotTypesReload: false } : undefined,
      }),
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [new rspack.SwcJsMinimizerRspackPlugin({ extractComments: { banner: true } })],
      moduleIds: isProduction ? 'deterministic' : 'named',
      chunkIds: isProduction ? 'deterministic' : 'named',
      concatenateModules: true,
      usedExports: true,
    },
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    },
    devServer: {
      port: devPort,
      hot: true,
      historyApiFallback: true,
      open: false,
      setupMiddlewares: (middlewares) => {
        process.on('SIGINT', () => process.exit(0));
        return middlewares;
      },
      client: { overlay: false, progress: false },
      allowedHosts: 'all',
      static: { publicPath: '/', watch: true },
    },
  };
};
