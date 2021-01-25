const getPresets = require('./presets');
const getPlugins = require('./plugins');

const cache = (mode, name) => {
  return `${mode}:${name}@${require(`${name}/package.json`).version}`;
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
      compact: isEnvProduction,
      sourceType: 'unambiguous'
    }
  };
};
