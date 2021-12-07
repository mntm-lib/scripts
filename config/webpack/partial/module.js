const path = require('path');

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
    // Prevent transpile runtime in dev mode
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
    const pkg = require(`${matchPackageDir}package.json`);

    return pkg.type === 'module' || fields.esm.some((field) => {
      if (!pkg[field]) {
        return false;
      }

      return paths.moduleFileExtensions.some((ext) => {
        return pkg[field].endsWith(ext);
      });
    });
  } catch {
    return false;
  }
});

const svgMemoPrefix = memoize((file) => {
  return `s${path.basename(file, '.svg')}`;
});

const svgoPrefix = (_, info) => {
  return info.path ? svgMemoPrefix(info.path) : 'is';
};

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const babel = babelLoader(mode, isLegacy);

  return {
    strictExportPresence: true,
    rules: [{
      test: /\.(c|m)?js/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
      }
    }, {
      test: /\.css$/,
      use: styleLoader(mode),
      sideEffects: true
    }, {
      test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.avif$/, /\.webp$/],
      type: 'asset/resource',
      generator: {
        filename: 'static/[name].[hash:8][ext]'
      }
    }, {
      test: /\.svg$/,
      oneOf: [{
        // Exclude new URL calls
        dependency: {
          not: ['url']
        },
        use: [babel, {
          loader: require.resolve('@svgr/webpack'),
          options: {
            babel: false,
            prettier: false,
            runtimeConfig: false,
            svgo: true,
            svgoConfig: {
              plugins: [{
                removeViewBox: false,
                multipass: true,
                prefixIds: {
                  prefix: svgoPrefix,
                  delim: ''
                },
                cleanupNumericValues: {
                  floatPrecision: 2
                }
              }]
            },
            titleProp: false,
            ref: true,
            memo: true
          }
        }, {
          loader: require.resolve('new-url-loader')
        }]
      }, {
        // Export a data URI or emit a separate file
        type: 'asset',
        parser: {
          // Disable inline
          dataUrlCondition: {
            maxSize: 0
          }
        },
        generator: {
          filename: 'static/[name].[hash:8][ext]'
        }
      }]
    }, {
      oneOf: [{
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: babel
      }, {
        test: /\.(js|mjs)$/,
        include: babelInclude,
        use: babel
      }]
    }]
  };
};
