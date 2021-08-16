const paths = require('../config/paths');
const fs = require('fs-extra');
const constants = require('fs').constants;
const path = require('path');
const chalk = require('chalk');

const checkRequiredFiles = (files) => {
  let currentFilePath;

  try {
    files.forEach((filePath) => {
      currentFilePath = filePath;
      fs.accessSync(filePath, constants.F_OK);
    });

    return true;
  } catch {
    const dirName = path.dirname(currentFilePath);
    const fileName = path.basename(currentFilePath);

    console.log(chalk.red('Could not find a required file.'));
    console.log(chalk.red('  Name: ') + chalk.cyan(fileName));
    console.log(chalk.red('  Searched in: ') + chalk.cyan(dirName));

    return false;
  }
};

// Create public dir
fs.ensureDirSync(paths.appPublic);

// Create env file
fs.ensureFileSync(paths.dotenv);

// Create babel modules file
if (!fs.existsSync(paths.appBabelModules)) {
  fs.writeJSONSync(paths.appBabelModules, {
    include: [],
    exclude: []
  }, {
    spaces: 2
  });
}

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appIndexJs])) {
  process.exit(1);
}
