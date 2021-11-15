const path = require('path');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';

  /** @type {any[]} */
  const plugins = [
    [require.resolve('@babel/plugin-proposal-object-rest-spread'), {
      // Cannot be rewritten in any other way
      useBuiltIns: true
    }],
    [require.resolve('@babel/plugin-transform-runtime'), {
      corejs: false,
      helpers: true,
      version: require('@babel/runtime/package.json').version,
      regenerator: isLegacy,
      useESModules: true,
      absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package.json'))
    }]
  ];

  if (isEnvProduction) {
    plugins.push(
      [require.resolve('babel-plugin-transform-react-remove-prop-types'), {
        mode: 'remove',
        removeImport: true,
        additionalLibraries: [
          'react-immutable-proptypes',
          'airbnb-prop-types'
        ]
      }]
    );
  } else {
    plugins.push(
      [require.resolve('@prefresh/babel-plugin'), {
        skipEnvCheck: true
      }]
    );
  }

  return plugins;
};
