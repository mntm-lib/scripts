#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');

const pkg = require(path.resolve(__dirname, '../package.json'));
const deps = Object.keys(pkg.peerDependencies).join(' ');

const ua = process.env.npm_config_user_agent || '';
const ex = process.env.npm_execpath || '';

const isYarn = ua.includes('yarn') || ex.includes('yarn');
const command = (isYarn ? 'yarn add ' : 'npm i ') + deps;

console.log();
console.log(chalk.green(`Thank you for using ${pkg.name} v${pkg.version}`));
console.log(chalk.gray(`Don't forget to install peer dependencies`));
console.log();
console.log(`  ${command}`);
console.log();
