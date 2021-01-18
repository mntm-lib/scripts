const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const template = path.resolve(__dirname, './template/index.html');

const moduleFileExtensions = ['mjs', 'js', 'jsx', 'json', 'ts', 'tsx'];
const configFileExtensions = ['js', 'json'];

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
  template,
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('build'),
  appPublic: resolveApp('public'),
  appIndexJs: resolveModule(resolveApp, 'src/index', moduleFileExtensions),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appExclude: resolveModule(resolveApp, 'babel.exclude', configFileExtensions),
  appNodeModules: resolveApp('node_modules'),
  publicUrlOrPath: '/',
  moduleFileExtensions
};
