require('../lib/unhandled');
require('../lib/paths');

// Do this as the first thing so that any code reading it knows the right env.
const env = require('../lib/env');
env.fallback('development');

const chalk = require('chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');
const formatWebpackMessages = require('../lib/formatWebpackMessages');
const size = require('../lib/size');
const printBuildError = require('../lib/printBuildError');
const execBin = require('../lib/bin');

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
Promise.resolve()
  .then(() => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    fs.emptyDirSync(paths.appBuild);
    // Merge with the public folder
    fs.copySync(paths.appPublic, paths.appBuild, {
      dereference: true
    });
    // Start the webpack build
    return build();
  })
  .then(
    ({ stats, warnings }) => {
      if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
        console.log(
          '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        );
        console.log(
          'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        );
      } else {
        console.log(chalk.green('Compiled successfully.\n'));
      }

      size(
        stats,
        paths.appBuild
      );
    },
    err => {
      console.log(
        chalk.yellow(
          'Compiled with the following type errors (you may want to check these before deploying your app):\n'
        )
      );
      printBuildError(err);
    }
  )
  .then(() => {
    if (fs.existsSync(paths.vkDeployConfig)) {
      execBin('@vkontakte/vk-miniapps-deploy');
    } else {
      console.log(
        chalk.yellow(
          'Deploy config not found.'
        ) + ' ' + chalk.grey(
          'See: https://github.com/VKCOM/vk-miniapps-deploy'
        )
      );
    }
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });

// Create the production build and print the deployment instructions.
function build() {
  console.log('Creating an optimized production build...');

  const compiler = webpack(configFactory);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages;
      if (err) {
        if (!err.message) {
          return reject(err);
        }

        let errMessage = err.message;

        // Add additional information for postcss errors
        if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
          errMessage +=
            '\nCompileError: Begins at CSS selector ' +
            err['postcssNode'].selector;
        }

        messages = formatWebpackMessages({
          errors: [{ message: errMessage }],
          warnings: []
        });
      } else {
        messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: true })
        );
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }

      const resolveArgs = {
        stats,
        warnings: messages.warnings
      };

      return resolve(resolveArgs);
    });
  });
}
