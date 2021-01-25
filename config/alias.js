const path = require('path');
const moduleAlias = require('module-alias');
const paths = require('./paths');
const appPackageJson = require(paths.appPackageJson);

const npm = (name) => path.resolve(paths.appNodeModules, name);
const resolutions = Object.keys(appPackageJson.resolutions || {}).reduce((acc, name) => {
  acc[name] = npm(name);
  return acc;
}, {});
const preact = {
  react: npm('@mntm/react'),
  'react-dom': npm('@mntm/react'),
  'preact/compat': npm('preact/compat')
};
const aliases = Object.assign({}, resolutions, preact);

moduleAlias.addAliases(aliases);

module.exports = aliases;
