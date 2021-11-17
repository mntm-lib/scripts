const path = require('path');
const createHash = require('webpack/lib/util/createHash');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const safePostCssParser = require('postcss-safe-parser');

const targets = require('../../../targets');

const MODULE_EXT = '.module.css';
const MODULE_SHORT_EXT = '.m.css';

const isModule = (name) => name.endsWith(MODULE_EXT) || name.endsWith(MODULE_SHORT_EXT);
const isModuleIndex = (name) => name.includes('index.') && isModule(name);

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
    const hash = createHash('xxhash64').update(name).digest('hex').slice(0, 7);

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
          require('postcss-color-hex-alpha'),
          require('postcss-color-functional-notation'),
          require('postcss-overflow-shorthand'),
          require('postcss-replace-overflow-wrap'),
          require('postcss-image-set-function'),
          [require('autoprefixer'), {
            flexbox: 'no-2009',
            remove: false,
            overrideBrowserslist: targets[mode].postcss
          }],
          require('postcss-flexbugs-fixes'),
          require('../../plugins/postcss-warnings-plugin')
        ]
      }
    }
  }];
};
