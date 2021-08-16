const chalk = require('chalk');
const execSync = require('child_process').execSync;

/**
 * @type {any}
 */
const execOptions = {
  encoding: 'utf8',
  stdio: [
    'pipe',
    'pipe',
    'ignore'
  ]
};

const getProcessIdOnPort = (port) => {
  return execSync(`lsof -i:${port} -P -t -sTCP:LISTEN`, execOptions).
    split('\n')[0].
    trim();
};

const getProcessCommand = (processId) => {
  const command = execSync(
    `ps -o command -p ${processId} | sed -n 2p`,
    execOptions
  );

  return command.replace(/\n$/, '');
};

const getDirectoryOfProcessById = (processId) => {
  return execSync(
    `lsof -p ${
      processId
    } | awk '$4=="cwd" {for (i=9; i<=NF; i++) printf "%s ", $i}'`,
    execOptions
  ).trim();
};

module.exports = (port) => {
  try {
    const processId = getProcessIdOnPort(port);
    const directory = getDirectoryOfProcessById(processId);
    const command = getProcessCommand(processId);

    return (
      chalk.cyan(command) +
      chalk.grey(` (pid ${processId})\n`) +
      chalk.blue('  in ') +
      chalk.cyan(directory)
    );
  } catch {
    return null;
  }
};
