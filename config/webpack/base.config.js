const paths = require('../paths');

const getOutput = require('./partial/output');
const getOptimization = require('./partial/optimization');
const getResolve = require('./partial/resolve');
const getModule = require('./partial/module');
const getPlugins = require('./partial/plugins');
const getCache = require('./partial/cache');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';

  return {
    mode,
    bail: isEnvProduction,
    entry: paths.appIndexJs,
    context: paths.appSrc,
    performance: false,
    infrastructureLogging: {
      level: 'none'
    },
    devtool: isEnvProduction ? false : 'eval-cheap-module-source-map',
    output: getOutput(mode, isLegacy),
    optimization: getOptimization(mode, isLegacy),
    resolve: getResolve(),
    module: getModule(mode, isLegacy),
    plugins: getPlugins(mode),
    cache: getCache(mode, isLegacy),
    target: isLegacy ? ['web', 'es5'] : ['web', 'es2020'],
    experiments: {
      // Not ready yet
      css: false,

      backCompat: false,
      cacheUnaffected: true,
      futureDefaults: true
    },

    // Due to futureDefaults node polyfills are not provided by default
    node: {
      global: true,
      __filename: true,
      __dirname: true
    }
  };
};
