const address = require('address');
const url = require('url');
const fs = require('fs-extra');
const chalk = require('chalk');
const detect = require('detect-port-alt');
const isRoot = require('is-root');
const paths = require('../config/paths');
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
  let lanUrlForConfig,
      lanUrlForTerminal,
      prettyHost;

  if (isUnspecifiedHost) {
    prettyHost = 'localhost';
    try {
      lanUrlForConfig = address.ip();
      if (lanUrlForConfig) {
        if (
          /^10\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\./.test(
            lanUrlForConfig
          )
        ) {
          lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
        } else {
          lanUrlForConfig = undefined;
        }
      }
    } catch {
      // Ignored
    }
  } else {
    prettyHost = host;
  }

  const localUrlForTerminal = prettyPrintUrl(prettyHost);
  const localUrlForBrowser = formatUrl(prettyHost);

  let appUrlForTerminal;
  let appUrlForBrowser;

  try {
    const config = fs.readJSONSync(paths.vkTunnelConfig);

    if (config.endpoints.includes('web')) {
      appUrlForBrowser = `https://vk.com/app${config.app_id}`;
    } else if (config.endpoints.includes('mvk')) {
      appUrlForBrowser = `https://m.vk.com/app${config.app_id}`;
    } else {
      appUrlForBrowser = `https://vk.com/app${config.app_id}`;
    }
    appUrlForTerminal = appUrlForBrowser;
  } catch {
    appUrlForBrowser = localUrlForBrowser;
    appUrlForTerminal = localUrlForTerminal;
  }

  return {
    lanUrlForConfig,
    lanUrlForTerminal,

    localUrlForTerminal,
    localUrlForBrowser,

    appUrlForTerminal,
    appUrlForBrowser
  };
};

const printInstructions = (appName, urls, useYarn) => {
  console.log();
  console.log(`You can now view ${chalk.bold(appName || 'app')} in the browser.`);
  console.log();

  console.log(
    `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`
  );

  if (urls.lanUrlForTerminal) {
    console.log(
      `  ${chalk.bold('Network:')}          ${urls.lanUrlForTerminal}`
    );
  }
  if (urls.appUrlForTerminal !== urls.localUrlForTerminal) {
    console.log(
      `  ${chalk.bold('App:')}              ${urls.appUrlForTerminal}`
    );
  } else {
    console.log();
    console.log(
      `${chalk.yellow(
        'Tunnel config not found.'
      )} ${chalk.grey(
        'See: https://github.com/VKCOM/vk-tunnel-client'
      )}`
    );
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
  urls,
  webpack
}) => {
  let compiler;

  try {
    compiler = webpack(config);
  } catch (ex) {
    console.log(chalk.red('Failed to compile.'));
    console.log();
    console.log(ex.message || ex);
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

  const tsHooks = ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler);

  tsHooks.waiting.tap('awaitingTypeScriptCheck', () => {
    console.log(
      chalk.yellow(
        'Files successfully emitted, waiting for typecheck results...'
      )
    );
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

    const messages = formatWebpackMessages(statsData);
    const isSuccessful = messages.errors.length === 0 && messages.warnings.length === 0;

    if (isSuccessful) {
      console.log(chalk.green('Compiled successfully!'));
    }
    if (isSuccessful && (isInteractive || isFirstCompile)) {
      printInstructions(appName, urls, true);
    }
    isFirstCompile = false;

    if (messages.errors.length > 0) {
      if (messages.errors.length > 1) {
        messages.errors.length = 1;
      }
      console.log(chalk.red('Failed to compile.\n'));
      console.log(messages.errors.join('\n\n'));

      return;
    }

    if (messages.warnings.length > 0) {
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(messages.warnings.join('\n\n'));

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
    }
  });

  return compiler;
};

const choosePort = (host, defaultPort) => detect(defaultPort, host).catch((ex) => {
  throw new Error(
    `${chalk.red(`Could not find an open port at ${chalk.bold(host)}.`)
    }\n${`Network error message: ${ex.message}` || ex}\n`
  );
}).then((port) => {
  if (port === defaultPort) {
    return port;
  }

  const message = process.platform !== 'win32' && defaultPort < 1024 && !isRoot() ?
    `Admin permissions are required to run a server on a port below 1024.` :
    `Something is already running on port ${defaultPort}.`;
  const existingProcess = getProcessForPort(defaultPort);

  throw new Error(`${message}${existingProcess ? ` Probably:\n  ${existingProcess}` : ''}`);
});

module.exports = {
  choosePort,
  createCompiler,
  prepareUrls
};
