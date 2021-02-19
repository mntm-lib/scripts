const targets = require('../../../targets');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';
  const target = isLegacy ? 'legacy' : 'modern';

  return [[
    require.resolve('@babel/preset-env'), {
      bugfixes: true,
      spec: false,
      loose: true,
      modules: false,
      useBuiltIns: 'usage',
      corejs: {
        version: '3.8',
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
