const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const safePostCssParser = require('postcss-safe-parser');

const targets = require('../../../targets');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development') => {
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
      sourceMap: !isEnvProduction
    }
  }, {
    loader: require.resolve('postcss-loader'),
    options: {
      implementation: require.resolve('postcss'),
      sourceMap: !isEnvProduction,
      postcssOptions: {
        config: false,
        parser: safePostCssParser,
        plugins: [
          require('postcss-nested'),
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            browsers: targets[mode].postcss
          })
        ]
      }
    }
  }];
};
