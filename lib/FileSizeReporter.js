const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const filesize = require('filesize');
const recursive = require('recursive-readdir');
const stripAnsi = require('strip-ansi');
const gzipSize = require('gzip-size').sync;

const canReadAsset = (asset) => /\.(js|css)$/.test(asset);

const printFileSizesAfterBuild = (
  webpackStats,
  previousSizeMap,
  buildFolder,
  maxBundleGzipSize,
  maxChunkGzipSize
) => {
  const root = previousSizeMap.root;
  const assets = (webpackStats.stats || [webpackStats])
    .map(stats =>
      stats
        .toJson({ all: false, assets: true })
        .assets.filter(canReadAsset)
        .map(asset => {
          const fileContents = fs.readFileSync(path.join(root, asset.name));
          const size = gzipSize(fileContents);
          return {
            folder: path.join(
              path.basename(buildFolder),
              path.dirname(asset.name)
            ),
            name: path.basename(asset.name),
            size: size,
            sizeLabel: filesize(size)
          };
        })
    )
    .reduce((single, all) => all.concat(single), []);
  assets.sort((a, b) => {
    const isAm = a.folder.includes('modern');
    const isBm = b.folder.includes('modern');

    if (isAm && isBm || !isAm && !isBm) {
      return b.size - a.size;
    }

    return isAm ? -1 : 1;
  });
  const longestSizeLabelLength = Math.max.apply(
    null,
    assets.map(a => stripAnsi(a.sizeLabel).length)
  );
  assets.forEach(asset => {
    let sizeLabel = asset.sizeLabel;
    const sizeLength = stripAnsi(sizeLabel).length;
    if (sizeLength < longestSizeLabelLength) {
      const rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength);
      sizeLabel += rightPadding;
    }
    const isMainBundle = asset.name.indexOf('main.') === 0;
    const maxRecommendedSize = isMainBundle
      ? maxBundleGzipSize
      : maxChunkGzipSize;
    const isLarge = maxRecommendedSize && asset.size > maxRecommendedSize;
    console.log(
      '  ' +
      (isLarge ? chalk.yellow(sizeLabel) : sizeLabel) +
      '  ' +
      chalk.dim(asset.folder + path.sep) +
      chalk.cyan(asset.name)
    );
  });
};

const removeFileNameHash = (buildFolder, fileName) => {
  return fileName
    .replace(buildFolder, '')
    .replace(/\\/g, '/')
    .replace(
      /\/?(.*)(\.[0-9a-f]+)(\.chunk)?(\.js|\.css)/,
      (match, p1, p2, p3, p4) => p1 + p4
    );
};

const measureFileSizesBeforeBuild = (buildFolder) => {
  return new Promise(resolve => {
    recursive(buildFolder, (err, fileNames) => {
      let sizes;
      if (!err && fileNames) {
        sizes = fileNames.filter(canReadAsset).reduce((memo, fileName) => {
          const contents = fs.readFileSync(fileName);
          const key = removeFileNameHash(buildFolder, fileName);
          memo[key] = gzipSize(contents);
          return memo;
        }, {});
      }
      resolve({
        root: buildFolder,
        sizes: sizes || {}
      });
    });
  });
};

module.exports = {
  measureFileSizesBeforeBuild: measureFileSizesBeforeBuild,
  printFileSizesAfterBuild: printFileSizesAfterBuild
};
