const paths = require('../../paths');
const fields = require('../../fields');

const babelLoader = require('../loaders/babel/loader');
const styleLoader = require('../loaders/style/loader');

const babelModules = Object.assign({
  include: [],
  exclude: []
}, require(paths.appBabelModules));

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
          if (!isEnvProduction) {
            // prevent transpile runtime in dev mode
            return;
          }
          const matchPackage = file.match(/^.*[/\\]node_modules[/\\](@.*?[/\\])?.*?[/\\]/);
          if (!matchPackage) {
            return false;
          }
          const matchPackageDir = matchPackage[0];
          const matchPackageName = matchPackageDir.slice(0, -1);
          try {
            if (babelModules.exclude.includes(matchPackageName)) {
              return false;
            }
            if (babelModules.include.includes(matchPackageName)) {
              return true;
            }
            const pkg = require(matchPackageDir + 'package.json');
            return pkg.type === 'module' || fields.esm.some((field) => {
              if (!pkg[field]) {
                return false;
              }

              return paths.moduleFileExtensions.some((ext) => {
                return pkg[field].endsWith(ext);
              });
            });
          } catch (e) {
            return false;
          }
        },
        use: babel
      }, {
        test: /\.css$/,
        use: styleLoader(mode),
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
