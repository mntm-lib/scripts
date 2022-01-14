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

            // @ts-expect-error wrong typing
            ecma,
            safari10: true,
            webkit: true
          },
          parse: {
            ecma: 2020
          },
          compress: {
            // @ts-expect-error wrong typing
            ecma,
            defaults: true,
            arrows: !isLegacy,
            arguments: true,

            // Breaks preact
            booleans_as_integers: false,
            collapse_vars: true,
            comparisons: true,
            directives: true,
            drop_console: false,
            evaluate: true,
            expression: false,
            hoist_funs: true,
            hoist_props: true,
            hoist_vars: false,
            if_return: true,

            // Bug
            inline: 2,
            join_vars: true,
            keep_infinity: true,
            loops: false,
            module: !isLegacy,

            // IIFE need for legacy
            negate_iife: !isLegacy,
            passes: isLegacy ? 1 : 4,
            properties: true,
            pure_funcs: null,
            pure_getters: false,
            reduce_funcs: true,
            reduce_vars: true,
            sequences: 0,
            switches: true,
            toplevel: !isLegacy,
            top_retain: [],
            typeofs: false,
            unsafe: false,
            unsafe_math: true,
            unsafe_methods: !isLegacy,
            unsafe_proto: !isLegacy,
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
        parallel: false,
        minify: CSSMinimizerPlugin.cssnanoMinify,
        minimizerOptions: {
          config: false,

          // @ts-expect-error wrong typing
          configFile: false,
          preset: [require.resolve('cssnano-preset-advanced'), {
            // Use svg loader instead
            svgo: false,

            // Use css loader instead
            autoprefixer: false,

            // Side-effects
            discardUnused: false,
            zindex: false,
            reduceIdents: {
              keyframes: false
            },

            // Compat
            minifyFontValues: {
              removeQuotes: false
            },

            // Strip all
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
            test: /(?<!node_modules.*)[/\\]node_modules[/\\](react-refresh|react-hot-loader|@prefresh|@hot-loader|@pmmmwh|webpack|webpack-dev-server|webpack-dev-middleware|webpack-hot-middleware)[/\\]/,
            priority: 50,
            enforce: true
          }
        }, {
        polyfills: {
          chunks: 'all',
          name: 'polyfills',
          test: /(?<!node_modules.*)[/\\]node_modules[/\\](core-js|core-js-pure|core-js-compat|@babel|@swc|regenerate|regenerator-runtime|performance-now|raf|blueimp-canvas-to-blob|ssr-window|@mntm\/polyfill|@webcomponents|@juggle|([\w-]*(object-assign|objectassign|promise|fetch|polyfill|shim|sham|es5|es6)[\w-]*))[/\\]/,
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
          test: /(?<!node_modules.*)[/\\]node_modules[/\\](@vkontakte\/vkui|@vkontakte\/icons|@vkontakte\/vkjs|@vkontakte\/vk-bridge|@mntm\/vkui|@mntm\/icons|@mntm\/painless-bridge|@popperjs|react-popper|mitt)[/\\]/,
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
