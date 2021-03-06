import { Configuration } from 'webpack';
import * as webpackMerge from 'webpack-merge';
import * as htmlWebpackPlugin from 'html-webpack-plugin';

import { IWebpackCommonConfigOpts, webpackCommonConfig } from './webpack.common.js';

export interface IWebpackConfigOpts extends IWebpackCommonConfigOpts {
  tsConfigPath: string;
}

export type WebpackConfigFunc = (opts: IWebpackConfigOpts) => Configuration;

export const webpackConfig: WebpackConfigFunc =
  (opts: IWebpackConfigOpts): Configuration =>
    webpackMerge(
      webpackCommonConfig({
        entry: {
          ...opts.entry
        },
        sassIncludePaths: opts.sassIncludePaths,
        indexHtmlPath: opts.indexHtmlPath,
        rootDirectory: opts.rootDirectory,
        buildDirectory: opts.buildDirectory,
        sourceDirectory: opts.sourceDirectory,
        alias: opts.alias,
        appDirectory: opts.appDirectory,
        faviconPath: opts.faviconPath,
      }),
      <{}>{
        module: {
          rules: [
            {
              test: /\.html$/,
              use: 'html-loader'
            },
            {
              test: /\.ts$/,
              enforce: 'pre',
              loader: 'tslint-loader',
              include: opts.sourceDirectory,
              options: {
                emitErrors: true,
                typeCheck: true
              }
            },
            {
              test: /\.ts$/,
              use: [
                'ng-router-loader',
                {
                  loader: 'ts-loader',
                  options: {
                    configFile: opts.tsConfigPath
                  }
                },
                'angular2-template-loader'
              ]
            }
          ]
        },
        plugins: [
          new htmlWebpackPlugin({
            template: opts.indexHtmlPath,
            favicon: opts.faviconPath,
          }),
        ]
      });
