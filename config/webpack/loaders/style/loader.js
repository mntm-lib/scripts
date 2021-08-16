const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const targets = require('../../../targets');
const scope = require('../../../../lib/scope');

/**
 * @param {'production'|'development'} mode
 * @param {'icss'|'local'} type
 */
module.exports = (mode = 'development', type = 'icss') => {
  const isEnvProduction = mode === 'production';

  const emit = isEnvProduction ?
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: '../'
      }
    } :
    require.resolve('style-loader');

  return [emit, {
    loader: require.resolve('css-loader'),
    options: {
      importLoaders: 1,
      sourceMap: !isEnvProduction,
      modules: {
        mode: type,
        getLocalIdent: scope
      }
    }
  }, {
    loader: require.resolve('postcss-loader'),
    options: {
      implementation: require.resolve('postcss'),
      sourceMap: !isEnvProduction,
      postcssOptions: {
        config: false,
        ident: 'postcss',
        plugins: [
          'postcss-nested',
          'postcss-easy-import',
          'postcss-flexbugs-fixes',
          ['postcss-preset-env', {
            browsers: targets[mode].postcss
          }]
        ]
      }
    }
  }];
};
