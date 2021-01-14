const chalk = require('chalk');
const execSync = require('child_process').execSync;
const path = require('path');

const execOptions = {
  encoding: 'utf8',
  stdio: [
    'pipe', // stdin (default)
    'pipe', // stdout (default)
    'ignore' //stderr
  ]
};

const isProcessAReactApp = (processCommand) => {
  return /^node .*react-scripts\/scripts\/start\.js\s?$/.test(processCommand);
};

const getProcessIdOnPort = (port) => {
  return execSync('lsof -i:' + port + ' -P -t -sTCP:LISTEN', execOptions)
    .split('\n')[0]
    .trim();
};

const getPackageNameInDirectory = (directory) => {
  const packagePath = path.join(directory.trim(), 'package.json');

  try {
    return require(packagePath).name;
  } catch (e) {
    return null;
  }
};

const getProcessCommand = (processId, processDirectory) => {
  let command = execSync(
    'ps -o command -p ' + processId + ' | sed -n 2p',
    execOptions
  );

  command = command.replace(/\n$/, '');

  if (isProcessAReactApp(command)) {
    const packageName = getPackageNameInDirectory(processDirectory);
    return packageName ? packageName : command;
  } else {
    return command;
  }
};

const getDirectoryOfProcessById = (processId) => {
  return execSync(
    'lsof -p ' +
      processId +
      ' | awk \'$4=="cwd" {for (i=9; i<=NF; i++) printf "%s ", $i}\'',
    execOptions
  ).trim();
};

module.exports = (port) => {
  try {
    const processId = getProcessIdOnPort(port);
    const directory = getDirectoryOfProcessById(processId);
    const command = getProcessCommand(processId, directory);
    return (
      chalk.cyan(command) +
      chalk.grey(' (pid ' + processId + ')\n') +
      chalk.blue('  in ') +
      chalk.cyan(directory)
    );
  } catch (e) {
    return null;
  }
};
