const HtmlWebpackPlugin = require('html-webpack-plugin');

const safariPolyfill = '(()=>{var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",e=>{if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}})()';
const importInject = '(function(){function t(t,n){var c=document.createElement("script");c.defer=!0,n&&(c.crossOrigin="",c.type="module"),c.src=t,document.head.appendChild(c)}function n(){__LEGACY__.forEach((function(n){t(n,!1)}))}try{if("file:"===location.protocol)n();else{new Function("return import(`data:text/javascript;base64,Cg==`)")().then((function(){__MODERN__.forEach((function(n){t(n,!0)}))})).catch(n)}}catch(t){n()}})()';

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
            htmlPluginData.headTags.push({
              meta: {
                plugin: 'HtmlWebpackMultiBuildPlugin'
              },
              tagName: 'script',
              voidTag: false,
              innerHTML: safariPolyfill,
              attributes: {
                type: 'module'
              }
            });

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
