const HtmlWebpackPlugin = require('html-webpack-plugin');

const favicon = 'data:image/x-icon;base64,AAABAAEAAQEAAAEAGAAwAAAAFgAAACgAAAABAAAAAgAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAA==';

class HtmlFaviconWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      'HtmlFaviconWebpackPlugin',
      (compilation) => {
        const hooks = HtmlWebpackPlugin.getHooks(compilation);

        hooks.alterAssetTagGroups.tapAsync(
          'HtmlFaviconWebpackPlugin',
          (htmlPluginData, callback) => {
            htmlPluginData.headTags.push({
              tagName: 'link',
              voidTag: true,
              attributes: {
                rel: 'icon',
                href: favicon
              }
            });

            callback(null, htmlPluginData);
          }
        );
      }
    );
  }
}

module.exports = HtmlFaviconWebpackPlugin;
