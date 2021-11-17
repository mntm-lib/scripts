const fs = require('fs-extra');
const path = require('path');
const paths = require('./paths');

// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
delete require.cache[require.resolve('./paths')];

const envFile = [
  `${paths.dotenv}.${process.env.NODE_ENV}`,
  paths.dotenv
].find((file) => fs.existsSync(file));

if (envFile) {
  require('dotenv-expand')(
    require('dotenv').config({
      path: envFile
    })
  );
}

const appDirectory = fs.realpathSync(process.cwd());

process.env.NODE_PATH = (process.env.NODE_PATH || '').
  split(path.delimiter).
  filter((folder) => folder && !path.isAbsolute(folder)).
  map((folder) => path.resolve(appDirectory, folder)).
  join(path.delimiter);

const REACT_APP = /^react_app_/i;

const raw = Object.keys(process.env).filter((key) => {
  return REACT_APP.test(key);
}).reduce((env, key) => {
  env[key] = process.env[key];

  return env;
}, {
  NODE_ENV: process.env.NODE_ENV,
  BABEL_ENV: process.env.BABEL_ENV
});

const stringified = {
  'process.env': Object.keys(raw).reduce((env, key) => {
    env[key] = JSON.stringify(raw[key]);

    return env;
  }, {}),
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'process.env.BABEL_ENV': JSON.stringify(process.env.BABEL_ENV)
};

module.exports = { raw, stringified };
