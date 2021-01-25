const fs = require('fs');

const paths = require('../../paths');
const fields = require('../../fields');

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
        exclude: /node_modules/,
        use: babel
      }, {
        test: /\.(js|mjs)$/,
        include(file) {
          const matchPackage = file.match(/^.*[/\\]node_modules[/\\](@.*?[/\\])?.*?[/\\]/);
          if (!matchPackage) {
            return false;
          }
          const matchPackageDir = matchPackage[0];
          const matchPackageName = matchPackageDir.slice(0, -1);
          if (babelExclude.includes(matchPackageName)) {
            return false;
          }
          try {
            const pkg = require(matchPackageDir + 'package.json');
            return fields.esm.some((field) => field in pkg);
          } catch (e) {
            return false;
          }
        },
        use: babel
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
