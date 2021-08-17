const targets = require('../../../targets');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const target = isLegacy ? 'legacy' : 'modern';

  return {
    loader: require.resolve('./implementation'),
    options: {
      swcrc: false,
      swcrcRoots: false,
      configFile: false,
      jsc: {
        loose: true,
        target: targets[mode].swc[target]
      },
      env: {
        loose: true,
        target: targets[mode].babel[target],
        mode: 'usage',
        coreJs: 3
      },
      module: {
        type: 'es6',
        strict: false,
        strictMode: false,
        lazy: true,
        noInterop: false
      }
    }
  };
};
