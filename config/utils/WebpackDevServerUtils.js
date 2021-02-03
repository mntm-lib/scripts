const address = require('address');
const url = require('url');
const chalk = require('chalk');
const detect = require('detect-port-alt');
const isRoot = require('is-root');
const prompts = require('prompts');
const clearConsole = require('./clearConsole');
const formatWebpackMessages = require('./formatWebpackMessages');
const getProcessForPort = require('./getProcessForPort');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const isInteractive = process.stdout.isTTY;

const prepareUrls = (protocol, host, port, pathname = '/') => {
  const formatUrl = (hostname) => {
    return url.format({
      protocol,
      hostname,
      port,
      pathname
    });
  };
  const prettyPrintUrl = (hostname) => {
    return url.format({
      protocol,
      hostname,
      port: chalk.bold(port),
      pathname
    });
  };

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
  let prettyHost, lanUrlForConfig, lanUrlForTerminal;
  if (isUnspecifiedHost) {
    prettyHost = 'localhost';
    try {
      lanUrlForConfig = address.ip();
      if (lanUrlForConfig) {
        if (
          /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(
            lanUrlForConfig
          )
        ) {
          lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
        } else {
          lanUrlForConfig = undefined;
        }
      }
    } catch (_e) {
      // ignored
    }
  } else {
    prettyHost = host;
  }
  const localUrlForTerminal = prettyPrintUrl(prettyHost);
  const localUrlForBrowser = formatUrl(prettyHost);
  return {
    lanUrlForConfig,
    lanUrlForTerminal,
    localUrlForTerminal,
    localUrlForBrowser
  };
};

const printInstructions = (appName, urls, useYarn) => {
  console.log();
  console.log(`You can now view ${chalk.bold(appName)} in the browser.`);
  console.log();

  if (urls.lanUrlForTerminal) {
    console.log(
      `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`
    );
    console.log(
      `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`
    );
  } else {
    console.log(`  ${urls.localUrlForTerminal}`);
  }

  console.log();
  console.log('Note that the development build is not optimized.');
  console.log(
    `To create a production build, use ` +
      `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.`
  );
  console.log();
};

const createCompiler = ({
  appName,
  config,
  devSocket,
  urls,
  webpack
}) => {
  let compiler;
  try {
    compiler = webpack(config);
  } catch (err) {
    console.log(chalk.red('Failed to compile.'));
    console.log();
    console.log(err.message || err);
    console.log();
    process.exit(1);
  }

  compiler.hooks.invalid.tap('invalid', () => {
    if (isInteractive) {
      clearConsole();
    }
    console.log('Compiling...');
  });

  let isFirstCompile = true;
  let tsMessagesPromise;
  let tsMessagesResolver;

  compiler.hooks.beforeCompile.tap('beforeCompile', () => {
    tsMessagesPromise = new Promise(resolve => {
      tsMessagesResolver = msgs => resolve(msgs);
    });
  });

  const tsHooks = ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler);
  tsHooks.issues.tap('issues', (issues) => {
    tsMessagesResolver({
      errors: issues.filter(msg => msg.severity === 'error'),
      warnings: issues.filter(msg => msg.severity === 'warning')
    });
  });

  compiler.hooks.done.tap('done', async (stats) => {
    if (isInteractive) {
      clearConsole();
    }

    const statsData = stats.toJson({
      all: false,
      warnings: true,
      errors: true
    });

    if (statsData.errors.length === 0) {
      const delayedMsg = setTimeout(() => {
        console.log(
          chalk.yellow(
            'Files successfully emitted, waiting for typecheck results...'
          )
        );
      }, 100);

      const messages = await tsMessagesPromise;
      clearTimeout(delayedMsg);
      statsData.warnings.push(...messages.errors);
      statsData.warnings.push(...messages.warnings);
      stats.compilation.warnings.push(...messages.errors);
      stats.compilation.warnings.push(...messages.warnings);

      if (messages.errors.length > 0) {
        devSocket.warnings(messages.errors);
      } else if (messages.warnings.length > 0) {
        devSocket.warnings(messages.warnings);
      }

      if (isInteractive) {
        clearConsole();
      }
    }

    const messages = formatWebpackMessages(statsData);
    const isSuccessful = !messages.errors.length && !messages.warnings.length;
    if (isSuccessful) {
      console.log(chalk.green('Compiled successfully!'));
    }
    if (isSuccessful && (isInteractive || isFirstCompile)) {
      printInstructions(appName, urls, true);
    }
    isFirstCompile = false;

    if (messages.errors.length) {
      if (messages.errors.length > 1) {
        messages.errors.length = 1;
      }
      console.log(chalk.red('Failed to compile.\n'));
      console.log(messages.errors.join('\n\n'));
      return;
    }

    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(messages.warnings.join('\n\n'));

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
    }
  });

  return compiler;
};


const choosePort = (host, defaultPort) => detect(defaultPort, host).then((port) => {
  return new Promise((resolve) => {
    if (port === defaultPort) {
      return resolve(port);
    }
    const message = process.platform !== 'win32' && defaultPort < 1024 && !isRoot()
      ? `Admin permissions are required to run a server on a port below 1024.`
      : `Something is already running on port ${defaultPort}.`;
    if (isInteractive) {
      clearConsole();
      const existingProcess = getProcessForPort(defaultPort);
      const question = {
        type: 'confirm',
        name: 'shouldChangePort',
        message: chalk.yellow(
          `${message}${existingProcess ? ` Probably:\n  ${existingProcess}` : ''}`
        ) + '\n\nWould you like to run the app on another port instead?',
        initial: true
      };
      prompts(question).then(answer => {
        if (answer.shouldChangePort) {
          resolve(port);
        } else {
          resolve(null);
        }
      });
    } else {
      console.log(chalk.red(message));
      resolve(null);
    }
  });
}).catch((err) => {
  throw new Error(
    chalk.red(`Could not find an open port at ${chalk.bold(host)}.`) +
        '\n' + ('Network error message: ' + err.message || err) + '\n'
  );
});

module.exports = {
  choosePort,
  createCompiler,
  prepareUrls
};
