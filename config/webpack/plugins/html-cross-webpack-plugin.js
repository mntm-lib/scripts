const HtmlWebpackPlugin = require('html-webpack-plugin');

const importInject = '(function(){function n(n,t){var c=document.createElement("script");c.defer=!0,t&&(c.crossOrigin="",c.type="module"),c.src=n,document.head.appendChild(c)}function t(){__LEGACY__.forEach((function(t){n(t,!1)}))}try{if("file:"===location.protocol){t()}else{var c=new Function("return import(`data:text/javascript;base64,Cg==`)");c().then((function(){__MODERN__.forEach((function(t){n(t,!0)}))})).catch(t)}}catch(n){t()}})()';

const shared = new Set();
const modern = new Set();
const legacy = new Set();

class HtmlCrossWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      'HtmlWebpackMultiBuildPlugin',
      (compilation) => {
        const hooks = HtmlWebpackPlugin.getHooks(compilation);

        hooks.beforeAssetTagGeneration.tapAsync(
          'HtmlWebpackMultiBuildPlugin',
          (htmlPluginData, callback) => {
            htmlPluginData.assets.js.forEach((asset) => shared.add(asset));
            htmlPluginData.assets.js = Array.from(shared);

            callback(null, htmlPluginData);
          }
        );

        hooks.alterAssetTags.tapAsync(
          'HtmlWebpackMultiBuildPlugin',
          (htmlPluginData, callback) => {
            const inlined = htmlPluginData.assetTags.scripts.filter((tag) => {
              if (typeof tag.attributes.src === 'string') {
                const isModern = tag.attributes.src.includes('/modern/');

                if (isModern) {
                  modern.add(tag.attributes.src);

                  return false;
                }

                const isLegacy = tag.attributes.src.includes('/legacy/');

                if (isLegacy) {
                  legacy.add(tag.attributes.src);

                  return false;
                }
              }

              return true;
            });

            htmlPluginData.assetTags.scripts = inlined;

            callback(null, htmlPluginData);
          }
        );

        hooks.alterAssetTagGroups.tapAsync(
          'HtmlWebpackMultiBuildPlugin',
          (htmlPluginData, callback) => {
            const injectModern = Array.from(modern);
            const injectLegacy = Array.from(legacy);

            const inject = importInject.
              replace('__MODERN__', JSON.stringify(injectModern)).
              replace('__LEGACY__', JSON.stringify(injectLegacy));

            htmlPluginData.bodyTags.push({
              meta: {
                plugin: 'HtmlWebpackMultiBuildPlugin'
              },
              tagName: 'script',
              voidTag: false,
              innerHTML: inject,
              attributes: {
                type: 'application/javascript'
              }
            });

            injectModern.forEach((src) => {
              htmlPluginData.headTags.push({
                meta: {
                  plugin: 'HtmlWebpackMultiBuildPlugin'
                },
                tagName: 'link',
                voidTag: true,
                attributes: {
                  rel: 'modulepreload',
                  href: src,
                  crossorigin: ''
                }
              });
            });

            callback(null, htmlPluginData);
          }
        );
      }
    );
  }
}

module.exports = HtmlCrossWebpackPlugin;
