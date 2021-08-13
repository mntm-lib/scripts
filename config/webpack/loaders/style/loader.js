const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const targets = require('../../../targets');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development') => {
  const isEnvProduction = mode === 'production';

  const emit = isEnvProduction ? {
    loader: MiniCssExtractPlugin.loader,
    options: {
      publicPath: '../'
    }
  } : require.resolve('style-loader');

  const loaders = [emit, {
    loader: require.resolve('css-loader'),
    options: {
      importLoaders: 1,
      sourceMap: !isEnvProduction
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

  return loaders;
};
