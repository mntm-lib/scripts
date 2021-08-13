const crypto = require('crypto');
const path = require('path');

const paths = require('../../paths');
const env = require('../../env');

const createEnvironmentHash = (env) => {
  const hash = crypto.createHash('md5');
  hash.update(JSON.stringify(env));
  return hash.digest('hex');
};

module.exports = (_, isLegacy = false) => {
  const type = isLegacy ? 'legacy' : 'modern';

  return {
    type: 'filesystem',
    version: createEnvironmentHash(env.raw),
    cacheDirectory: path.resolve(paths.appWebpackCache, type),
    store: 'pack',
    buildDependencies: {
      defaultWebpack: ['webpack/lib/'],
      config: [paths.appBaseConfig],
      tsconfig: [paths.appTsConfig]
    }
  };
};
