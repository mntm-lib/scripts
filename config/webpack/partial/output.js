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

  const base = {
    path: paths.appBuild,
    pathinfo: !isEnvProduction,
    filename: target + baseFilename,
    chunkFilename: target + baseChunkFilename,
    publicPath: paths.publicUrlOrPath,
    assetModuleFilename: 'static/[name].[hash:8][ext]',
    devtoolModuleFilenameTemplate: isEnvProduction ?
      (info) =>
        path.
          relative(paths.appSrc, info.absoluteResourcePath).
          replaceAll('\\', '/') :
      (info) =>
        path.
          resolve(info.absoluteResourcePath).
          replaceAll('\\', '/'),
    globalObject: 'window',
    chunkLoadingGlobal: 'mntm',
    environment: {
      destructuring: false,
      bigIntLiteral: false
    }
  };

  if (isLegacy) {
    return Object.assign({}, base);
  }

  return Object.assign({}, base, {
    module: true,
    crossOriginLoading: 'anonymous',
    library: {
      type: 'module'
    }
  });
};
