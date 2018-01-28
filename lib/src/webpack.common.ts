import * as htmlWebpackPlugin from 'html-webpack-plugin';
import * as extractTextPlugin from 'extract-text-webpack-plugin';
import * as cleanWebpackPlugin from 'clean-webpack-plugin';
import * as optimizeCssAssetsWebpackPlugin from 'optimize-css-assets-webpack-plugin';

import { Configuration, ContextReplacementPlugin, DefinePlugin, optimize } from 'webpack';

import * as envConfig from './env';

interface ISassLoader {
  loader: string;
  options: {
    includePaths?: Array<string> | undefined;
    outputStyle: string;
  };
}

export interface IEntry {
  main: string;
}

const sassLoader: ISassLoader = {
  loader: 'sass-loader',
  options: {
    outputStyle: 'expanded'
  }
};

export interface IWebpackCommonConfigOpts {
  entry: IEntry;
  sassIncludePaths?: Array<string>;
  indexHtmlPath: string;
  rootDirectory: string;
  buildDirectory: string;
  sourceDirectory: string;
  appDirectory: string;
  alias: { [key: string]: string };
}

export type WebpackCommonConfigFunc = (opts: IWebpackCommonConfigOpts) => Configuration;

export const webpackCommonConfig: WebpackCommonConfigFunc =
  (opts: IWebpackCommonConfigOpts): {} => {

    sassLoader.options.includePaths = opts.sassIncludePaths;

    return {
      entry: {
        ...opts.entry
      },

      output: {
        path: opts.buildDirectory,
        filename: 'js/[name].[hash].js',
        chunkFilename: 'js/[id].[hash].chunk.js'
      },

      devServer: {
        contentBase: opts.buildDirectory,
        inline: true,
        historyApiFallback: true,
        overlay: {
          warnings: true,
          errors: true
        }
      },

      resolve: {
        mainFields: ['module', 'browser', 'main'],
        extensions: ['.ts', '.js'],
        alias: opts.alias
      },

      module: {
        rules: [
          {
            test: /\.html$/,
            use: 'html-loader'
          },
          {
            test: /\.(gif|png|jpe?g|svg|ico)$/i,
            loaders: [
              {
                loader: 'file-loader',
                query: {
                  name: 'images/[name].[hash].[ext]'
                }
              }
            ]
          },
          {
            test: /\.(woff|woff2|ttf|eot)$/,
            use: [{
              loader: 'file-loader',
              query: {
                name: 'fonts/[name].[hash].[ext]'
              }
            }]
          },
          {
            test: /\.scss$/,
            include: opts.appDirectory,
            use: ['css-to-string-loader', 'css-loader', 'resolve-url-loader', 'postcss-loader', sassLoader]
          },
          {
            test: /\.scss$/,
            exclude: opts.appDirectory,
            use: extractTextPlugin.extract({
              fallback: 'style-loader',
              use: ['css-loader', 'postcss-loader', sassLoader]
            })
          }]
      },

      plugins: [
        new ContextReplacementPlugin(
          /angular(\\|\/)core(\\|\/)@angular/,
          opts.sourceDirectory, {}
        ),
        new extractTextPlugin('css/[name].[hash].css'),
        new optimizeCssAssetsWebpackPlugin(),
        new htmlWebpackPlugin({
          template: opts.indexHtmlPath,
        }),
        new DefinePlugin({
          ENV: JSON.stringify(envConfig.env),
          IS_PRODUCTION: JSON.stringify(envConfig.isProduction)
        }),
        new cleanWebpackPlugin([opts.buildDirectory], {
          root: opts.rootDirectory
        }),
        new optimize.CommonsChunkPlugin({
          name: 'manifest',
          minChunks: Infinity
        })
      ]
    };
  };
