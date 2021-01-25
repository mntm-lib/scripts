const HtmlWebpackPlugin = require('html-webpack-plugin');

const safariPolyfill = '(()=>{var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",e=>{if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}})()';

const shared = new Set();

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
            htmlPluginData.assetTags.scripts.forEach((tag) => {
              const isModern = tag.attributes.src.includes('/modern/');
              if (isModern) {
                tag.attributes.type = 'module';
                tag.attributes.nomodule = false;
                return;
              }

              const isLegacy = tag.attributes.src.includes('/legacy/');
              if (isLegacy) {
                tag.attributes.type = 'application/javascript';
                tag.attributes.nomodule = true;
                return;
              }
            });

            callback(null, htmlPluginData);
          }
        );

        hooks.alterAssetTagGroups.tapAsync(
          'HtmlWebpackMultiBuildPlugin',
          (htmlPluginData, callback) => {
            htmlPluginData.headTags.push({
              tagName: 'script',
              voidTag: false,
              innerHTML: safariPolyfill,
              attributes: {
                type: 'module'
              }
            });

            callback(null, htmlPluginData);
          }
        );
      }
    );
  }
}

module.exports = HtmlCrossWebpackPlugin;
