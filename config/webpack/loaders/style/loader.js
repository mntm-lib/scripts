const path = require('path');
const crypto = require('crypto');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const safePostCssParser = require('postcss-safe-parser');

const targets = require('../../../targets');

const MODULE_EXT = '.module.css';

const isModule = (name) => name.endsWith(MODULE_EXT);
const isModuleIndex = (name) => name.endsWith('index.module.css');

const contentfulName = (context, _, localName) => {
  if (isModuleIndex(context.resourcePath)) {
    return `${path.basename(context.context)}__${localName}`;
  }

  if (isModule(context.resourcePath)) {
    return `${path.basename(context.resourcePath, MODULE_EXT)}__${localName}`;
  }

  return localName;
};

const minimalName = (context, _, localName) => {
  if (isModule(context.resourcePath)) {
    const name = path.relative(context.rootContext, context.resourcePath) + localName;
    const hash = crypto.createHash('md4').update(name, 'utf8').digest('hex').slice(0, 7);

    return `m${hash}`;
  }

  return localName;
};

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
      sourceMap: !isEnvProduction,
      modules: {
        auto: isModule,
        exportLocalsConvention: 'asIs',
        getLocalIdent: isEnvProduction ? minimalName : contentfulName
      }
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
