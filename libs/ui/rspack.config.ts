import path from 'node:path';
import { rspack } from '@rspack/core';
import type { Configuration } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';

/**
 * libs/ui — Remote, порт 5001
 *
 * Этот сервер используется для STANDALONE разработки UI-компонентов.
 * В основном приложении (packages/app) @demo/ui подключён как SHARED БИБЛИОТЕКА,
 * а не как Remote. Это намеренное архитектурное решение:
 *
 *   Почему не Remote в host?
 *   @demo/ui содержит React Context (ThemeContext).
 *   Если @demo/ui — Remote, то при загрузке другого Remote (@demo/components),
 *   который тоже импортирует @demo/ui, возникает второй экземпляр Context.
 *   Provider и Consumer начинают смотреть на разные объекты → Context не работает.
 *
 *   Решение: @demo/ui бандлится в host как библиотека (один раз),
 *   регистрируется в shared scope, все Remotes берут оттуда же.
 *
 * Этот конфиг можно использовать для:
 *   - Разработки компонентов в изоляции
 *   - Экспериментов с "ui как Remote" (раскомментируй в packages/app/rspack.config.ts)
 *   - Просмотра структуры бандла через RSDOCTOR=true npm run build -w @demo/ui
 */
export default (_env: unknown, argv: Record<string, string> = {}): Configuration => {
  const mode = (argv.mode ?? 'development') as 'development' | 'production';
  const isProduction = mode === 'production';
  const isRsdoctorEnabled = process.env.RSDOCTOR === 'true';
  const devPort = Number(process.env.UI_PORT ?? 5001);

  return {
    mode,
    entry: './src/index.ts',
    devtool: 'source-map',
    experiments: { css: false },
    output: {
      path: path.resolve(import.meta.dirname, 'dist'),
      publicPath: `http://localhost:${devPort}/`,
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      uniqueName: 'demo_ui',
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
        name: 'demo_ui',
        filename: 'remoteEntry.js',
        exposes: {
          './ThemeContext': './src/ThemeContext',
          './Button': './src/Button',
          '.': './src/index',
        },
        shared: {
          // В Remote НЕ нужен eager: true
          // React придёт из shared scope consumer'а (host)
          react: { singleton: true, requiredVersion: '^18.2.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
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
