// @ts-expect-error module
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

const build = async () => {
  return new Promise((resolve, reject) => {
    // @ts-expect-error wrong typing
    webpack(configFactory, (err, stats) => {
      const raw = {
        errors: [],
        warnings: []
      };

      if (stats) {
        const info = stats.toJson({ all: false, warnings: true, errors: true });

        raw.errors.push.apply(raw.errors, info.errors);
        raw.warnings.push.apply(raw.warnings, info.warnings);
      }

      if (err) {
        raw.errors.push(err);
      }

      const formatted = formatWebpackMessages(raw);

      if (formatted.errors.length > 0) {
        reject(new Error(formatted.errors.join('\n\n')));

        return;
      }

      resolve({
        stats,
        warnings: formatted.warnings
      });
    });
  });
};

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
Promise.resolve().
  then(async () => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    fs.emptyDirSync(paths.appBuild);

    // Merge with the public folder
    fs.copySync(paths.appPublic, paths.appBuild, {
      dereference: true
    });

    // Start the webpack build
    console.log('Creating an optimized production build...');

    return build();
  }).
  then(
    ({ stats, warnings }) => {
      if (warnings.length > 0) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
        console.log(
          `\nSearch for the ${
            chalk.underline(chalk.yellow('keywords'))
          } to learn more about each warning.`
        );
        console.log(
          `To ignore, add ${
            chalk.cyan('// eslint-disable-next-line')
          } to the line before.\n`
        );
      } else {
        console.log(chalk.green('Compiled successfully.\n'));
      }

      size(
        stats,
        paths.appBuild
      );
    },
    (ex) => {
      console.log(
        chalk.red(
          'Compilation failed:\n'
        )
      );
      printBuildError(ex);
      process.exit(1);
    }
  ).
  then(() => {
    if (fs.existsSync(paths.vkDeployConfig)) {
      execBin('@vkontakte/vk-miniapps-deploy');
    } else {
      console.log(
        `${chalk.yellow(
          'Deploy config not found.'
        )} ${chalk.grey(
          'See: https://github.com/VKCOM/vk-miniapps-deploy'
        )}`
      );
    }
  }).
  catch((ex) => {
    if (ex && ex.message) {
      console.log(ex.message);
    }
    process.exit(1);
  });
