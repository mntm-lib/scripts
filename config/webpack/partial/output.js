const paths = require('../../paths');
const path = require('path');

const appPackageJson = require(paths.appPackageJson);

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';
  const target = isLegacy ? 'legacy' : 'modern';

  const baseFilename = isEnvProduction ?
    '/[id].[fullhash:4].js' :
    '/[name].js';

  const baseChunkFilename = isEnvProduction ?
    '/[id].[fullhash:4].chunk.js' :
    '/[name].chunk.js';

  return {
    path: isEnvProduction ? paths.appBuild : undefined,
    pathinfo: !isEnvProduction,
    filename: target + baseFilename,
    chunkFilename: target + baseChunkFilename,
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
    chunkLoading: 'jsonp',
    chunkLoadingGlobal: `mntm_${appPackageJson.name}`,
    globalObject: 'this',
    environment: {
      arrowFunction: !isLegacy,
      bigIntLiteral: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      forOf: !isLegacy,
      module: !isLegacy
    }
  };
};
