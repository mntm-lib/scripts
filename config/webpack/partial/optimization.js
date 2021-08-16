const TerserPlugin = require('terser-webpack-plugin');
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin');

const targets = require('../../targets');

/**
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = false) => {
  const isEnvProduction = mode === 'production';
  const target = isLegacy ? 'legacy' : 'modern';
  const ecma = targets[mode].terser[target];

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
            ecma,
            safari10: true,
            webkit: true
          },
          parse: {
            ecma: 2020
          },
          compress: {
            defaults: true,
            arrows: !isLegacy,

            // @ts-expect-error wrong typing
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
            ecma,
            evaluate: true,
            expression: false,
            hoist_funs: true,
            hoist_props: true,
            hoist_vars: false,
            if_return: true,
            inline: 2,
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
            unsafe_regexp: false,
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
      chunks: 'all',
      automaticNameDelimiter: '_',
      cacheGroups: Object.assign(isEnvProduction ?
        {} :
        {
          hmr: {
            chunks: 'all',
            name: 'hmr',
            test: /(?<!node_modules.*)[/\\]node_modules[/\\](react-refresh|react-hot-loader|@prefresh|@hot-loader|@pmmmwh|webpack|webpack-dev-server)[/\\]/,
            priority: 50,
            enforce: true
          }
        }, {
        polyfills: {
          chunks: 'all',
          name: 'polyfills',
          test: /(?<!node_modules.*)[/\\]node_modules[/\\](core-js|core-js-pure|core-js-compat|@babel|@swc|regenerate|regenerator-runtime|object-assign|es6-object-assign|raf|blueimp-canvas-to-blob|ssr-window|@mntm\/polyfill|@webcomponents([\w-]*promise[\w-]*)|([\w-]*fetch[\w-]*)|([\w-]*polyfill[\w-]*))[/\\]/,
          priority: 40,
          enforce: true
        },
        render: {
          chunks: 'all',
          name: 'render',
          test: /(?<!node_modules.*)[/\\]node_modules[/\\](react|react-dom|react-reconciler|react-is|scheduler|prop-types|preact|preact-compat|preact-iso|@mntm\/react|style-loader|css-loader|postcss-loader|@svgr|svg-baker-runtime)[/\\]/,
          priority: 30,
          enforce: true
        },
        framework: {
          chunks: 'all',
          name: 'framework',
          test: /(?<!node_modules.*)[/\\]node_modules[/\\](@vkontakte\/vkui|@vkontakte\/icons|@vkontakte\/vkjs|@vkontakte\/vk-bridge|@mntm\/vkui|@mntm\/icons|@mntm\/painless-bridge|@popperjs|react-popper)[/\\]/,
          priority: 20,
          enforce: true
        }
      }),
      hidePathInfo: isEnvProduction,
      name: false
    },
    runtimeChunk: 'single'
  };
};
