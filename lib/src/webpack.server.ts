import { Configuration, ContextReplacementPlugin, NoEmitOnErrorsPlugin } from 'webpack';
import * as ngTools from '@ngtools/webpack';
import * as cleanWebpackPlugin from 'clean-webpack-plugin';
import * as nodeExternals from 'webpack-node-externals';

export interface IWebpackServerConfigOpts {
  entry: Array<string>;
  publicPath: string;
  entryModule: string;
  tsConfigPath: string;
  rootDirectory: string;
  sourceDirectory: string;
  serverBuildDirectory: string;
  clientBuildDirectory: string;
  sassIncludePaths: Array<string>;
}

export type WebpackServerConfigFunc = (opts: IWebpackServerConfigOpts) => Configuration;

export const webpackServerConfig: WebpackServerConfigFunc =
  (opts: IWebpackServerConfigOpts): {} => {
    return {
      target: 'node',
      entry: {
        server: opts.entry
      },

      node: {
        __dirname: false,
        __filename: false
      },

      output: {
        path: opts.serverBuildDirectory,
        filename: '[name].js',
        publicPath: opts.publicPath
      },
      resolve: {
        mainFields: ['module', 'main'],
        extensions: ['.ts', '.js', '.json']
      },
      externals: [nodeExternals()],
      module: {
        rules: [
          {
            test: /\.html$/,
            use: 'html-loader'
          },
          {
            test: /\.scss$/,
            use: ['raw-loader', {
              loader: 'sass-loader',
              options: {
                includePaths: opts.sassIncludePaths
              }
            }]
          },
          {
            test: /\.ts$/,
            use: [
              '@ngtools/webpack'
            ]
          },
          {
            test: /\.(gif|png|jpe?g|svg|ico)$/i,
            loaders: [
              {
                loader: 'file-loader',
                query: {
                  name: 'images/[name].[hash].[ext]',
                  hash: 'sha512',
                  digest: 'hex'
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
          }
        ]
      },
      plugins: [
        new ContextReplacementPlugin(
          /angular(\\|\/)core(\\|\/)@angular/,
          opts.sourceDirectory, {}
        ),
        new NoEmitOnErrorsPlugin(),
        new ngTools.AotPlugin({
          skipCodeGeneration: true,
          replaceExport: false,
          entryModule: opts.entryModule,
          tsConfigPath: opts.tsConfigPath
        }),
        new cleanWebpackPlugin([opts.serverBuildDirectory], {
          root: opts.rootDirectory,
          exclude: opts.clientBuildDirectory
        })
      ]
    };
  };
