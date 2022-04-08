const path = require('path');

const createHash = require('webpack/lib/util/createHash');

const paths = require('../../paths');
const env = require('../../env');

const pkg = require('../../../package.json');

const createEnvironmentHash = (from) => {
  const hash = createHash('xxhash64');

  hash.update(JSON.stringify(from));

  return hash.digest('hex');
};

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const type = isLegacy ? 'legacy' : 'modern';

  const hashVersion = pkg.version;
  const hashENV = createEnvironmentHash(env.raw);

  return {
    type: 'filesystem',
    version: hashVersion + hashENV,
    cacheDirectory: path.resolve(paths.appWebpackCache, mode, type),
    store: 'pack',
    buildDependencies: {
      defaultWebpack: ['webpack/lib/'],
      config: [paths.appBaseConfig],
      tsconfig: [paths.appTsConfig]
    }
  };
};
