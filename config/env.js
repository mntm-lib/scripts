const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const chalk = require('chalk');

delete require.cache[require.resolve('./paths')];

const NODE_ENV = process.env.NODE_ENV || process.env.BABEL_ENV || 'development';

if (NODE_ENV !== 'development' && NODE_ENV !== 'production') {
  throw new Error(
    chalk.red.bold(
      `The NODE_ENV environment variable is "${NODE_ENV}" but was not supported.`
    )
  );
}

const dotenvFiles = [
  `${paths.dotenv}.${NODE_ENV}.local`,
  `${paths.dotenv}.local`,
  `${paths.dotenv}.${NODE_ENV}`,
  paths.dotenv
].filter(Boolean);

dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: dotenvFile
      })
    );
  }
});

const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || '')
  .split(path.delimiter)
  .filter(folder => folder && !path.isAbsolute(folder))
  .map(folder => path.resolve(appDirectory, folder))
  .join(path.delimiter);

const REACT_APP = /^REACT_APP_/i;

module.exports = (publicUrl = '') => {
  const raw = Object.keys(process.env).filter(key => {
    return REACT_APP.test(key);
  }).reduce((env, key) => {
    env[key] = process.env[key];
    return env;
  }, {
    NODE_ENV: process.env.NODE_ENV || process.env.BABEL_ENV || 'development',
    BABEL_ENV: process.env.BABEL_ENV || process.env.NODE_ENV || 'development',
    PUBLIC_URL: publicUrl,
    WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
    WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
    WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT
  });

  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {})
  };

  return { raw, stringified };
};
