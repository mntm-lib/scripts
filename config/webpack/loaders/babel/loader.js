const getPresets = require('./presets');
const getPlugins = require('./plugins');

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

/**
 * @param {'production'|'development'} mode
 */
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
      cacheDirectory: false,
      cacheCompression: false,
      compact: isEnvProduction,
      minify: isEnvProduction,
      comments: isEnvProduction,
      sourceType: 'unambiguous'
    }
  };
};
