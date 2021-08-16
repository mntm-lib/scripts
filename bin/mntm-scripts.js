#!/usr/bin/env node
'use strict';

// @ts-expect-error module
require('../lib/unhandled');

const spawn = require('cross-spawn');
const chalk = require('chalk');
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  (x) =>
    x === 'build' ||
    x === 'prod' ||
    x === 'start' ||
    x === 'dev' ||
    x === 'watch' ||
    x === 'development' ||
    x === 'production'
);

const scriptMap = {
  build: 'build',
  prod: 'build',
  production: 'build',
  start: 'start',
  watch: 'start',
  dev: 'start',
  development: 'start'
};

const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (script in scriptMap) {
  const result = spawn.sync(
    process.execPath,
    nodeArgs.
      concat(require.resolve(`../scripts/${scriptMap[script]}`)).
      concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' }
  );

  if (result.signal) {
    if (result.signal === 'SIGKILL') {
      console.log(
        chalk.yellow(
          'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.'
        )
      );
    } else if (result.signal === 'SIGTERM') {
      console.log(
        chalk.yellow(
          'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `killall`, or the system could ' +
          'be shutting down.'
        )
      );
    } else {
      // Fallthrough
    }
    process.exit(1);
  }
  process.exit(result.status);
} else {
  console.log(chalk.red(`Unknown script "${script}".\n`));
  process.exit(1);
}
