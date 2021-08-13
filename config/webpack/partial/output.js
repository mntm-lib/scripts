const paths = require('../../paths');
const path = require('path');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';
  const target = isLegacy ? 'legacy' : 'modern';

  const baseFilename = isEnvProduction ?
    '/[id].[chunkhash:8].js' :
    '/[name].js';

  const baseChunkFilename = isEnvProduction ?
    '/[id].[chunkhash:8].chunk.js' :
    '/[name].chunk.js';

  return {
    path: paths.appBuild,
    pathinfo: !isEnvProduction,
    filename: target + baseFilename,
    chunkFilename: target + baseChunkFilename,
    assetModuleFilename: 'static/media/[name].[hash:8][ext]',
    publicPath: paths.publicUrlOrPath,
    devtoolModuleFilenameTemplate: isEnvProduction ?
      (info =>
        path
          .relative(paths.appSrc, info.absoluteResourcePath)
          .replace(/\\/g, '/')) :
      (info =>
        path
          .resolve(info.absoluteResourcePath)
          .replace(/\\/g, '/')),
    module: !isLegacy,
    library: {
      type: isLegacy ? 'window' : 'module'
    },
    chunkLoadingGlobal: 'mntm',
    crossOriginLoading: isLegacy ? false : 'anonymous',
    globalObject: 'window',
    environment: {
      arrowFunction: !isLegacy,
      bigIntLiteral: false,
      const: false,
      destructuring: false,
      dynamicImport: !isLegacy,
      forOf: !isLegacy,
      module: !isLegacy
    }
  };
};
