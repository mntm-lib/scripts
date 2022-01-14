const targets = require('../../../targets');
const pkg = require('../../../../package.json');

// Slowdown symbol polyfills
const EXCLUDE_SYMBOL = [
  'transform-typeof-symbol'
];

// Slowdown regex polyfills
const EXCLUDE_REGEX = [
  'transform-unicode-regex',
  'transform-sticky-regex',
  'proposal-unicode-property-regex',
  'transform-named-capturing-groups-regex',
  'transform-dotall-regex'
];

// Slowdown async/await to generator
const EXCLUDE_GENERATOR = [
  'transform-regenerator',
  'transform-async-to-generator'
];

const EXCLUDE_LEGACY = [
  ...EXCLUDE_SYMBOL,
  ...EXCLUDE_REGEX
];

const EXCLUDE_MODERN = [
  ...EXCLUDE_SYMBOL,
  ...EXCLUDE_GENERATOR,
  ...EXCLUDE_REGEX
];

// Force transform reserved
const INCLUDE_LEGACY = [
  'transform-member-expression-literals',
  'transform-property-literals',
  'transform-reserved-words'
];

// Empty
const INCLUDE_MODERN = [];

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
      include: isLegacy ? INCLUDE_LEGACY : INCLUDE_MODERN,
      exclude: isLegacy ? EXCLUDE_LEGACY : EXCLUDE_MODERN,
      targets: targets[mode].babel[target],
      ignoreBrowserslistConfig: true
    }], [
    require.resolve('@babel/preset-react'), {
      development: !isEnvProduction,
      throwIfNamespace: false,
      useBuiltIns: true,

      // ImportSource has internal check so omit
      runtime: 'automatic'
    }], [
    require.resolve('@babel/preset-typescript'), {
      isTSX: true,
      allExtensions: true,
      allowNamespaces: true,
      allowDeclareFields: true,
      onlyRemoveTypeImports: true,
      optimizeConstEnums: true
    }]
  ];
};
