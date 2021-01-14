const paths = require('../paths');

const getOutput = require('./partial/output');
const getOptimization = require('./partial/optimization');
const getResolve = require('./partial/resolve');
const getModule = require('./partial/module');
const getPlugins = require('./partial/plugins');

module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';

  return {
    mode,
    bail: isEnvProduction,
    entry: paths.appIndexJs,
    performance: false,
    infrastructureLogging: {
      level: 'info',
      debug: (name) => {
        return name !== 'webpack-dev-middleware';
      }
    },
    devtool: isEnvProduction ? false : 'eval-cheap-module-source-map',
    output: getOutput(mode, isLegacy),
    optimization: getOptimization(mode),
    resolve: getResolve(),
    module: getModule(mode, isLegacy),
    plugins: getPlugins(mode, isLegacy)
  };
};
