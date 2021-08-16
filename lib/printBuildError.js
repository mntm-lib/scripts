const chalk = require('chalk');

module.exports = (err) => {
  const message = err != null && err.message;
  const stack = err != null && err.stack;

  if (
    stack &&
    typeof message === 'string' &&
    message.includes('Terser')
  ) {
    try {
      const matched = /(.+)\[(.+):(.+),(.+)]\[.+]/.exec(stack);

      if (!matched) {
        throw new Error('Using errors for control flow is bad.');
      }
      const problemPath = matched[2];
      const line = matched[3];
      const column = matched[4];

      console.log(
        'Failed to minify the code from this file: \n\n',
        chalk.yellow(
          `\t${problemPath}:${line}${column !== '0' ? `:${column}` : ''}`
        ),
        '\n'
      );
    } catch {
      console.log('Failed to minify the bundle.', err);
      console.log();
    }
  } else {
    console.log(`${message || err}\n`);
  }
};
