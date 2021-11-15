const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const appTemplate = path.resolve(__dirname, './template/index.html');
const appDevClient = path.resolve(__dirname, '../lib/WebpackDevServerClient.js');
const appBaseConfig = path.resolve(__dirname, './webpack/base.config.js');

const moduleFileExtensions = ['tsx', 'ts', 'jsx', 'js', 'mjs', 'mts'];

const resolveModule = (resolveFn, filePath, extensions) => {
  const extension = extensions.find((ext) =>
    fs.existsSync(resolveFn(`${filePath}.${ext}`)));

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

module.exports = {
  appTemplate,
  appDevClient,
  appBaseConfig,

  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('build'),
  appPublic: resolveApp('public'),
  appIndexJs: resolveModule(resolveApp, 'src/index', moduleFileExtensions),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appBabelModules: resolveApp('babel.modules.json'),
  appNodeModules: resolveApp('node_modules'),
  appWebpackCache: resolveApp('node_modules/.cache/webpack'),
  appTsBuildInfoFile: resolveApp('node_modules/.cache/tsconfig.tsbuildinfo'),
  publicUrlOrPath: './',

  moduleFileExtensions,

  vkTunnelConfig: resolveApp('vk-tunnel-config.json'),
  vkDeployConfig: resolveApp('vk-hosting-config.json')
};
