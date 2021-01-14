const webpack = require('webpack');
const resolve = require('resolve');
const paths = require('../../paths');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconHtmlWebpackPlugin = require('../plugins/html-favicon-webpack-plugin');
const CrossHtmlWebpackPlugin = require('../plugins/html-cross-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const PreactRefreshWebpackPlugin = require('@prefresh/webpack');

module.exports = (mode = 'development') => {
  const isEnvProduction = mode === 'production';

  const plugins = [];

  if (isEnvProduction) {
    plugins.push(
      new FaviconHtmlWebpackPlugin(),
      new CrossHtmlWebpackPlugin()
    );
  }

  plugins.push(
    new HtmlWebpackPlugin({
      inject: 'body',
      scriptLoading: 'defer',
      chunksSortMode: 'none',
      template: paths.template
    })
  );

  if (isEnvProduction) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: 'style/[id].[fullhash:4].css',
        chunkFilename: 'style/[id].[fullhash:4].chunk.css'
      })
    );
  } else {
    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new PreactRefreshWebpackPlugin(),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          enabled: true,
          build: false,
          mode: 'write-references',
          configFile: paths.appTsConfig,
          typescriptPath: resolve.sync('typescript', {
            basedir: paths.appNodeModules
          })
        },
        async: true,
        formatter: 'basic'
      })
    );
  }

  return plugins;
};
