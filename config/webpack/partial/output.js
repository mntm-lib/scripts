const path = require('path');

const paths = require('../../paths');
const esm = require('../../esm');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';
  const target = isLegacy ? 'legacy' : 'modern';

  const baseFilename = isEnvProduction ?
    '/[id].[chunkhash].js' :
    '/[name].js';

  const baseChunkFilename = isEnvProduction ?
    '/[id].[chunkhash].chunk.js' :
    '/[name].chunk.js';

  const output = {
    hashFunction: 'xxhash64',
    hashDigest: 'hex',
    hashDigestLength: 12,
    path: paths.appBuild,
    pathinfo: !isEnvProduction,
    filename: target + baseFilename,
    chunkFilename: target + baseChunkFilename,
    publicPath: paths.publicUrlOrPath,
    assetModuleFilename: 'static/[name].[fullhash][ext]',
    hotUpdateChunkFilename: 'static/[id].[fullhash].hot-update.js',
    hotUpdateMainFilename: 'static/[fullhash].[runtime].hot-update.json',
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

  if (!esm(mode, isLegacy)) {
    return output;
  }

  return Object.assign({}, output, {
    chunkFormat: 'module',
    chunkLoading: 'import',
    iife: false,
    library: {
      type: 'module'
    },
    libraryTarget: 'module',
    module: true,
    scriptType: 'module',
    environment: {
      module: true,
      destructuring: false
    }
  });
};
