import * as htmlWebpackPlugin from 'html-webpack-plugin';
import * as ngTools from '@ngtools/webpack';
import { Configuration, NoEmitOnErrorsPlugin } from 'webpack';
import * as webpackMerge from 'webpack-merge';
import * as uglifyJSPlugin from 'uglifyjs-webpack-plugin';
import { resolve } from 'path';

import { webpackCommonConfig, IWebpackCommonConfigOpts } from './webpack.common';

export interface IWebpackAotConfigOpts extends IWebpackCommonConfigOpts {
  tsConfigPath: string;
}

export type WebpackAotConfigFunc = (opts: IWebpackAotConfigOpts) => Configuration;

export const webpackAotConfig: WebpackAotConfigFunc =
  (opts: IWebpackAotConfigOpts): Configuration => {

    const paths: { [key: string]: Array<string> } = {};
    Object.keys(opts.alias).forEach((key: string) => paths[key] = [opts.alias[key]]);

    return webpackMerge(
      webpackCommonConfig({
        entry: {
          vendor: resolve(__dirname, '..', '..', 'bundles', 'vendor.jit.ts'),
          ...opts.entry
        },
        sassIncludePaths: opts.sassIncludePaths,
        indexHtmlPath: opts.indexHtmlPath,
        rootDirectory: opts.rootDirectory,
        buildDirectory: opts.buildDirectory,
        sourceDirectory: opts.sourceDirectory,
        alias: opts.alias,
        appDirectory: opts.appDirectory
      }),
      <{}>{
        module: {
          rules: [{
            test: /\.ts$/,
            use: [
              'ng-router-loader',
              '@ngtools/webpack'
            ]
          }]
        },

        plugins: [
          new htmlWebpackPlugin({
            template: opts.indexHtmlPath,
            inject: false,
            minify: {
              caseSensitive: true,
              collapseInlineTagWhitespace: true,
              collapseWhitespace: true,
              conservativeCollapse: true,
              keepClosingSlash: true,
              removeComments: true,
              minifyCSS: true,
              minifyJS: true
            }
          }),
          new NoEmitOnErrorsPlugin(),
          new uglifyJSPlugin({
            uglifyOptions: {
              output: {
                comments: false,
              },
              warnings: false,
              mangle: true
            },
            parallel: true
          }),
          new ngTools.AotPlugin({
            skipCodeGeneration: true,
            replaceExport: false,
            mainPath: opts.entry.main,
            tsConfigPath: opts.tsConfigPath,
            compilerOptions: { paths }
          })
        ]
      });
  };
