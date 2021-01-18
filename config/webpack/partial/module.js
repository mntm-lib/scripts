const path = require('path');
const paths = require('../../paths');
const fs = require('fs');

const linariaCache = path.resolve(paths.appNodeModules, '.cache/linaria-loader');

const babelLoader = require('../loaders/babel/loader');
const styleLoader = require('../loaders/style/loader');

const babelExclude = fs.existsSync(paths.appExclude) ? require(paths.appExclude) : [];

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';

  const babel = babelLoader(mode, isLegacy);

  return {
    strictExportPresence: true,
    rules: [{
      parser: {
        requireEnsure: false
      }
    }, {
      oneOf: [{
        test: [/\.avif$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 0,
          mimetype: 'image/avif',
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }, {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 0,
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }, {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: isEnvProduction ? [
          /runtime/,
          ...babelExclude
        ] : [
          /node_modules/,
          /runtime/,
          ...babelExclude
        ],
        use: [babel, {
          loader: '@linaria/webpack-loader',
          options: {
            displayName: !isEnvProduction,
            cacheDirectory: linariaCache,
            babelOptions: {
              compact: babel.options.compact,
              babelrc: babel.options.babelrc,
              configFile: babel.options.configFile,
              plugins: babel.options.plugins,
              presets: babel.options.presets
            }
          }
        }]
      }, {
        test: /\.css$/,
        use: styleLoader(mode, {
          importLoaders: 1,
          sourceMap: !isEnvProduction
        }),
        sideEffects: true
      }, {
        loader: require.resolve('file-loader'),
        exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
        options: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }]
    }]
  };
};
