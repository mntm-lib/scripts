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
  } catch (err) {
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

const needTunnelConfig = process.env.NODE_ENV === 'development';
const existTunnelConfig = fs.existsSync(paths.vkTunnelConfig);
if (!existTunnelConfig) {
  fs.writeJSONSync(paths.vkTunnelConfig, {
    app_id: 0,
    endpoints: ['mobile', 'mvk', 'web']
  }, {
    spaces: 2
  });
}
if (needTunnelConfig && !existTunnelConfig) {
  process.exit(1);
}

const needDeployConfig = process.env.NODE_ENV === 'production';
const existDeployConfig = fs.existsSync(paths.vkDeployConfig);
if (!existDeployConfig) {
  fs.writeJSONSync(paths.vkDeployConfig, {
    app_id: 0,
    static_path: 'build',
    endpoints: {
      mobile: 'index.html',
      mvk: 'index.html',
      web: 'index.html'
    }
  }, {
    spaces: 2
  });
}
if (needDeployConfig && !existDeployConfig) {
  process.exit(1);
}

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appIndexJs])) {
  process.exit(1);
}
