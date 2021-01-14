const getPresets = require('./presets');
const getPlugins = require('./plugins');

const cache = (environment, packageName) => {
  let cacheIdentifier = environment == null ? '' : environment.toString();
  cacheIdentifier += `:${packageName}@`;
  try {
    cacheIdentifier += require(`${packageName}/package.json`).version;
  } catch (_) {
    // ignored
  }
  return cacheIdentifier;
};

module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';

  return {
    loader: require.resolve('babel-loader'),
    options: {
      babelrc: false,
      configFile: false,
      presets: getPresets(mode, isLegacy),
      plugins: getPlugins(mode),
      cacheIdentifier: cache(mode, '@mntm/scripts'),
      cacheDirectory: true,
      cacheCompression: false,
      compact: isEnvProduction
    }
  };
};
