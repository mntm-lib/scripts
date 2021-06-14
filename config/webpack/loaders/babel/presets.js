const targets = require('../../../targets');
const pkg = require('../../../../package.json');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';
  const target = isLegacy ? 'legacy' : 'modern';

  const corejs = pkg.dependencies['core-js'];
  const corejsVersion = corejs.slice(1, corejs.lastIndexOf('.'));

  return [[
    require.resolve('@babel/preset-env'), {
      bugfixes: true,
      spec: false,
      loose: true,
      modules: false,
      useBuiltIns: 'usage',
      corejs: {
        version: corejsVersion,
        proposals: false
      },
      exclude: isLegacy ? [] : [
        'transform-typeof-symbol',
        'transform-regenerator',
        'transform-async-to-generator'
      ],
      targets: targets[mode].babel[target],
      ignoreBrowserslistConfig: true
    }], [
    require.resolve('@babel/preset-react'), {
      development: !isEnvProduction,
      throwIfNamespace: false,
      runtime: 'automatic'
    }], [
    require.resolve('@babel/preset-typescript'), {
      isTSX: true,
      allExtensions: true,
      allowNamespaces: true,
      allowDeclareFields: true,
      onlyRemoveTypeImports: true
    }]
  ];
};
