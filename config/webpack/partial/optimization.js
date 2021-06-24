const TerserPlugin = require('terser-webpack-plugin');
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';

  return {
    minimize: isEnvProduction,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          toplevel: !isLegacy,
          keep_classnames: false,
          keep_fnames: false,
          safari10: true,
          format: {
            comments: false,
            ascii_only: isLegacy,
            ecma: isLegacy ? 5 : 2015,
            safari10: true,
            webkit: true
          },
          parse: {
            ecma: 2020
          },
          compress: {
            defaults: true,
            arrows: !isLegacy,
            arguments: true,
            booleans_as_integers: false,
            collapse_vars: true,
            comparisons: true,
            computed_props: true,
            conditionals: true,
            dead_code: true,
            directives: true,
            drop_console: false,
            drop_debugger: true,
            ecma: isLegacy ? 5 : 2015,
            evaluate: true,
            expression: false,
            hoist_funs: true,
            hoist_props: true,
            hoist_vars: false,
            if_return: true,
            inline: 3,
            join_vars: true,
            keep_classnames: false,
            keep_fargs: false,
            keep_fnames: false,
            keep_infinity: true,
            loops: false,
            module: !isLegacy,
            negate_iife: true,
            passes: isLegacy ? 2 : 4,
            properties: true,
            pure_funcs: null,
            pure_getters: false,
            reduce_funcs: true,
            reduce_vars: true,
            sequences: 0,
            side_effects: !isLegacy,
            switches: true,
            toplevel: !isLegacy,
            top_retain: false,
            typeofs: !isLegacy,
            unsafe: false,
            unsafe_arrows: false,
            unsafe_comps: !isLegacy,
            unsafe_Function: false,
            unsafe_math: !isLegacy,
            unsafe_symbols: false,
            unsafe_methods: !isLegacy,
            unsafe_proto: !isLegacy,
            unsafe_regexp: !isLegacy,
            unsafe_undefined: false,
            unused: true
          },
          mangle: {
            keep_classnames: false,
            keep_fnames: false,
            module: !isLegacy,
            reserved: [],
            toplevel: !isLegacy,
            safari10: true
          }
        }
      }),
      new CSSMinimizerPlugin({
        parallel: true,
        minimizerOptions: {
          preset: ['default', {
            minifyFontValues: {
              removeQuotes: false
            },
            discardComments: {
              removeAll: true
            }
          }]
        }
      })
    ],
    splitChunks: {
      automaticNameDelimiter: '_',
      chunks: 'all',
      hidePathInfo: isEnvProduction,
      name: false
    },
    runtimeChunk: 'single'
  };
};
