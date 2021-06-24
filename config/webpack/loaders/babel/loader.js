const getPresets = require('./presets');
const getPlugins = require('./plugins');

const cache = (mode, packages) => {
  let cacheIdentifier = mode;
  for (const packageName of packages) {
    cacheIdentifier += `:${packageName}@`;
    try {
      cacheIdentifier += require(`${packageName}/package.json`).version;
    } catch (_) {
      // ignored
    }
  }
  return cacheIdentifier;
};

const assumptions = {
  arrayLikeIsIterable: true,
  constantReexports: false,
  constantSuper: true,
  enumerableModuleMeta: false,
  ignoreFunctionLength: true,
  ignoreToPrimitiveHint: true,
  iterableIsArray: true,
  mutableTemplateObject: true,
  noClassCalls: true,
  noDocumentAll: true,
  noNewArrows: true,
  objectRestNoSymbols: true,
  privateFieldsAsProperties: true,
  pureGetters: false,
  setClassMethods: true,
  setComputedProperties: true,
  setPublicClassFields: true,
  setSpreadProperties: true,
  skipForOfIteratorClosing: true,
  superIsCallableConstructor: true
};

module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';

  return {
    loader: require.resolve('babel-loader'),
    options: {
      babelrc: false,
      configFile: false,
      assumptions,
      presets: getPresets(mode, isLegacy),
      plugins: getPlugins(mode, isLegacy),
      cacheIdentifier: cache(mode, [
        '@mntm/scripts',
        '@babel/core',
        'core-js'
      ]),
      cacheDirectory: true,
      cacheCompression: false,
      compact: isEnvProduction,
      sourceType: 'unambiguous'
    }
  };
};
