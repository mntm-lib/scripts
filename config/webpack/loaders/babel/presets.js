const targets = require('../../../targets');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', legacy = false) => {
  const isEnvProduction = mode === 'production';
  const target = legacy ? 'legacy' : 'modern';

  return [[
    require.resolve('@babel/preset-env'), {
      bugfixes: true,
      spec: false,
      loose: true,
      modules: false,
      useBuiltIns: 'usage',
      corejs: 3,
      exclude: ['transform-typeof-symbol'],
      targets: targets[mode].babel[target]
    }], [
    require.resolve('@babel/preset-typescript'), {
      isTSX: true,
      allExtensions: true,
      allowNamespaces: true,
      allowDeclareFields: true,
      onlyRemoveTypeImports: true
    }], [
    require.resolve('@babel/preset-react'), {
      development: !isEnvProduction,
      throwIfNamespace: false,
      runtime: 'automatic'
    }], [
    require.resolve('@linaria/babel-preset'), {
      displayName: !isEnvProduction
    }
  ]];
};
