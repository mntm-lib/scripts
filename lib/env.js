const chalk = require('chalk');

const NODE_ENV = process.env.NODE_ENV || process.env.BABEL_ENV;

if (
  NODE_ENV &&
  NODE_ENV !== 'development' &&
  NODE_ENV !== 'production'
) {
  throw new Error(
    chalk.red.bold(
      `The NODE_ENV environment variable is "${NODE_ENV}" but was not supported.`
    )
  );
}

module.exports = {
  fallback(env) {
    const ENV = NODE_ENV || env;

    process.env.NODE_ENV = ENV;
    process.env.BABEL_ENV = ENV;
  }
};
