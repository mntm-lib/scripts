const path = require('path');
const moduleAlias = require('module-alias');
const paths = require('./paths');
const appPackageJson = require(paths.appPackageJson);

const npm = (name) => path.resolve(paths.appNodeModules, name);
const base = (name) => require.resolve(name, {
  paths: [
    paths.appPath
  ]
});

const app = require(paths.appAliasModules);
const appAliases = {};

for (const from in app) {
  appAliases[from] = base(app[from]);
}

const resolutions = appPackageJson.resolutions || {};
const resolutionsAliases = {};

for (const name in resolutions) {
  resolutionsAliases[name] = npm(name);
}

const preactAliases = {
  'react': npm('@mntm/react'),
  'react-dom': npm('@mntm/react'),
  'preact/compat': npm('preact/compat')
};

const aliases = Object.assign({}, resolutionsAliases, preactAliases, appAliases);

moduleAlias.addAliases(aliases);

module.exports = aliases;
