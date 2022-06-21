const aliases = require('../../alias');
const modules = require('../../modules');
const paths = require('../../paths');
const fields = require('../../fields');

module.exports = () => {
  return {
    modules: ['node_modules', paths.appNodeModules].concat(
      modules.additionalModulePaths || []
    ),
    extensions: paths.moduleFileExtensions.map((ext) => `.${ext}`),
    alias: {
      ...aliases,
      ...modules.webpackAliases
    },

    // Force esm-first
    mainFields: fields.all,
    aliasFields: fields.all,

    // Force resolve old way
    importsFields: [],
    exportsFields: [],
    conditionNames: []
  };
};
