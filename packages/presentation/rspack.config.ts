import path from 'node:path';
import { rspack } from '@rspack/core';
import type { Configuration } from '@rspack/core';
import { HtmlRspackPlugin } from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';

export default (_env: unknown, argv: Record<string, string> = {}): Configuration => {
  const mode = (argv.mode ?? 'development') as 'development' | 'production';
  const isProduction = mode === 'production';
  const devPort = Number(process.env.PRESENTATION_PORT ?? 5004);

  return {
    mode,
    entry: './src/index.tsx',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    experiments: { css: false },
    output: {
      path: path.resolve(import.meta.dirname, 'dist'),
      publicPath: isProduction ? '/' : `http://localhost:${devPort}/`,
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      assetModuleFilename: 'assets/[name].[contenthash][ext]',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
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
        {
          test: /\.css$/i,
          type: 'asset/source',
        },
        {
          test: /\.txt$/i,
          type: 'asset/source',
        },
        {
          test: /\.html$/i,
          exclude: /public\/index\.html$/,
          type: 'asset/resource',
        },
        {
          test: /\.(png|jpe?g|gif|webp)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      ...(!isProduction ? [new ReactRefreshPlugin()] : []),
      new HtmlRspackPlugin({ template: './public/index.html' }),
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
      ignored: ['**/node_modules/**'],
    },
    devServer: {
      port: devPort,
      hot: true,
      historyApiFallback: true,
      open: false,
      client: { overlay: false, progress: false },
      allowedHosts: 'all',
    },
  };
};
