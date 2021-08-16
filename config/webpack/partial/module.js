const paths = require('../../paths');
const fields = require('../../fields');
const memoize = require('../../../lib/memoize');

const babelLoader = require('../loaders/swc/loader');
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
  const isEnvProduction = mode === 'production';

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
        type: 'asset',
        mimetype: 'image/avif',
        parser: {
          dataUrlCondition: {
            maxSize: 0
          }
        }
      }, {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 0
          }
        }
      }, {
        test: /\.svg$/,
        use: [{
          loader: '@svgr/webpack',
          options: {
            prettier: false,
            svgo: isEnvProduction,
            svgoConfig: {
              plugins: [{
                removeViewBox: false
              }]
            },
            ref: true,
            memo: true
          }
        }, {
          loader: 'file-loader',
          options: {
            name: 'static/media/[name].[hash].[ext]'
          }
        }],
        issuer: {
          and: [/\.(ts|tsx|js|jsx|md|mdx)$/]
        },
        type: 'javascript/auto'
      },  {
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
        exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
        type: 'asset/resource'
      }]
    }]
  };
};
