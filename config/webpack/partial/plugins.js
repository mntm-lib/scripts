const webpack = require('webpack');

const paths = require('../../paths');
const env = require('../../env');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const FaviconHtmlWebpackPlugin = require('../plugins/html-favicon-webpack-plugin');
const CrossHtmlWebpackPlugin = require('../plugins/html-cross-webpack-plugin');
const HtmlModuleWebpackPlugin = require('../plugins/html-module-webpack-plugin');

const TypescriptCheckerPlugin = require('../plugins/typescript-checker-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PreactRefreshWebpackPlugin = require('@prefresh/webpack');

module.exports = (mode = 'development') => {
  const isEnvProduction = mode === 'production';

  const plugins = [];

  if (isEnvProduction) {
    plugins.push(
      new FaviconHtmlWebpackPlugin(),
      new CrossHtmlWebpackPlugin()
    );
  } else {
    plugins.push(
      new HtmlModuleWebpackPlugin()
    );
  }

  plugins.push(
    new HtmlWebpackPlugin({
      inject: 'body',
      scriptLoading: 'blocking',
      chunksSortMode: 'none',
      template: paths.appTemplate,
      minify: isEnvProduction
    })
  );

  plugins.push(
    new webpack.DefinePlugin(env.stringified)
  );

  if (isEnvProduction) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: 'style/[name].[contenthash:8].css',
        chunkFilename: 'style/[name].[chunkhash:8].chunk.css',
        experimentalUseImportModule: true
      })
    );
  } else {
    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new PreactRefreshWebpackPlugin(),
      new TypescriptCheckerPlugin()
    );
  }

  return plugins;
};
