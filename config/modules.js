const fs = require('fs-extra');
const path = require('path');
const paths = require('./paths');
const chalk = require('chalk');
const resolve = require('resolve');

const getAdditionalModulePaths = (options = {}) => {
  const baseUrl = options.baseUrl;

  if (!baseUrl) {
    return '';
  }

  const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

  if (path.relative(paths.appNodeModules, baseUrlResolved) === '') {
    return null;
  }

  if (path.relative(paths.appSrc, baseUrlResolved) === '') {
    return [paths.appSrc];
  }

  if (path.relative(paths.appPath, baseUrlResolved) === '') {
    return null;
  }

  throw new Error(
    chalk.red.bold(
      'Your project\'s `baseUrl` can only be set to `src` or `node_modules`.'
    )
  );
};

const getWebpackAliases = (options = {}) => {
  const baseUrl = options.baseUrl;

  if (!baseUrl) {
    return {};
  }

  const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

  if (path.relative(paths.appPath, baseUrlResolved) === '') {
    return {
      src: paths.appSrc
    };
  }
};

const getModules = () => {
  const hasTsConfig = fs.existsSync(paths.appTsConfig);

  if (!hasTsConfig) {
    throw new Error(
      chalk.red.bold(
        'tsconfig.json is not found'
      )
    );
  }

  const ts = require(resolve.sync('typescript', {
    basedir: paths.appNodeModules
  }));
  const config = ts.readConfigFile(paths.appTsConfig, ts.sys.readFile).config;
  const options = config.compilerOptions || {};

  const additionalModulePaths = getAdditionalModulePaths(options);

  return {
    additionalModulePaths: additionalModulePaths,
    webpackAliases: getWebpackAliases(options)
  };
};

module.exports = getModules();
