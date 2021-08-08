const HtmlWebpackPlugin = require('html-webpack-plugin');

class HtmlModuleWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      'HtmlModuleWebpackPlugin',
      (compilation) => {
        const hooks = HtmlWebpackPlugin.getHooks(compilation);

        hooks.alterAssetTags.tapAsync(
          'HtmlModuleWebpackPlugin',
          (htmlPluginData, callback) => {
            htmlPluginData.assetTags.scripts.forEach((tag) => {
              tag.attributes.type = 'module';
            });

            callback(null, htmlPluginData);
          }
        );
      }
    );
  }
}

module.exports = HtmlModuleWebpackPlugin;
