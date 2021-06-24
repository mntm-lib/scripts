const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const appTemplate = path.resolve(__dirname, './template/index.html');
const appDevClient = path.resolve(__dirname, '../lib/WebpackDevServerClient.js');

const moduleFileExtensions = ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'];

const resolveModule = (resolveFn, filePath, extensions) => {
  const extension = extensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

module.exports = {
  appTemplate,
  appDevClient,
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
  publicUrlOrPath: './',
  moduleFileExtensions,

  vkTunnelConfig: resolveApp('vk-tunnel-config.json'),
  vkDeployConfig: resolveApp('vk-hosting-config.json')
};
