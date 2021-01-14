const aliases = require('../../alias');
const modules = require('../../modules');
const paths = require('../../paths');

module.exports = () => {
  return {
    modules: ['node_modules', paths.appNodeModules].concat(
      modules.additionalModulePaths || []
    ),
    extensions: paths.moduleFileExtensions.map(ext => `.${ext}`),
    alias: {
      ...aliases,
      ...(modules.webpackAliases || {})
    },
    mainFields: [
      // these are generally shipped as a higher ES language level than `module`
      'es2015',
      'esm2015',
      'fesm2015',
      // current leading de-facto standard
      'module',
      // previous de-facto standard
      'jsnext:main',
      'jsnext',
      // non-standard esm
      'esm',
      'esnext',
      // lower ES level
      'esm5',
      'fesm5',
      // standard
      'main',
      'browser',
      // fallback
      'umd:main',
      'umd',
      // vendor specific
      'unpkg'
    ]
  };
};
