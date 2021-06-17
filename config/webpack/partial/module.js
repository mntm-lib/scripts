const paths = require('../../paths');
const fields = require('../../fields');
const memoize = require('../../../lib/memoize');

const babelLoader = require('../loaders/babel/loader');
const styleLoader = require('../loaders/style/loader');

const babelModules = Object.assign({
  include: [],
  exclude: []
}, require(paths.appBabelModules));

const wellKnownBabelExclude = [
  '@babel/runtime',
  'regenerator-runtime',
  'core-js'
];

const matchAny = (arr, value) => arr.some((item) => value.endsWith(item));

const babelInclude = memoize((file) => {
  if (process.env.BABEL_ENV !== 'production') {
    // prevent transpile runtime in dev mode
    return false;
  }

  const matchPackage = file.match(/^.*[/\\]node_modules[/\\](@.*?[/\\])?.*?[/\\]/);
  if (!matchPackage) {
    return false;
  }

  const matchPackageDir = matchPackage[0];
  const matchPackageName = matchPackageDir.slice(0, -1);

  if (matchAny(wellKnownBabelExclude, matchPackageName)) {
    return false;
  }

  if (matchAny(babelModules.exclude, matchPackageName)) {
    return false;
  }

  if (matchAny(babelModules.include, matchPackageName)) {
    return true;
  }

  try {
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
});

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const babel = babelLoader(mode, isLegacy);

  return {
    strictExportPresence: true,
    rules: [{
      parser: {
        requireEnsure: false
      }
    }, {
      test: /\.(c|m)?js/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
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
        include: babelInclude,
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
