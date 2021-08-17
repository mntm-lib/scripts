const paths = require('../../paths');
const fields = require('../../fields');
const memoize = require('../../../lib/memoize');

const babelLoader = require('../loaders/babel/loader');
const styleLoader = require('../loaders/style/loader');

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;

const ujsRegex = /\.(js|mjs|jsx|ts|tsx)$/;
const mjsRegex = /\.(js|mjs)$/;

const typeAuto = 'javascript/auto';

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

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';

  const babel = babelLoader(mode, isLegacy);

  return {
    strictExportPresence: true,
    rules: [{
      oneOf: [{
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.avif$/, /\.webp$/],
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 0
          }
        }
      }, {
        test: /\.svg$/,
        type: typeAuto,
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
            name: 'static/media/[name].[hash:8].[ext]'
          }
        }],
        issuer: {
          and: ujsRegex
        }
      }, {
        test: ujsRegex,
        type: typeAuto,
        exclude: /node_modules/,
        use: babel,
        resolve: {
          fullySpecified: false
        }
      }, {
        test: mjsRegex,
        type: typeAuto,
        include: babelInclude,
        use: babel,
        resolve: {
          fullySpecified: false
        }
      }, {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: styleLoader(mode, 'icss'),
        sideEffects: true
      }, {
        test: cssModuleRegex,
        use: styleLoader(mode, 'local')
      }, {
        exclude: [/^$/, ujsRegex, /\.html$/, /\.json$/],
        type: 'asset/resource'
      }]
    }]
  };
};
