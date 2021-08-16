const targets = require('../../../targets');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const target = isLegacy ? 'legacy' : 'modern';

  return {
    loader: require.resolve('./implementation'),
    options: {
      jsc: {
        loose: true,
        dynamicImport: true,
        target: targets[mode].swc[target],
        externalHelpers: true,
        privateMethod: true,
        classPrivateProperty: true
      },
      env: {
        loose: true,
        dynamicImport: true,
        target: targets[mode].babel[target],
        mode: 'usage',
        coreJs: 3
      }
    }
  };
};
