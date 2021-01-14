const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const filesize = require('filesize');
const recursive = require('recursive-readdir');
const stripAnsi = require('strip-ansi');
const gzipSize = require('gzip-size').sync;

const canReadAsset = (asset) => (
  /\.(js|css)$/.test(asset) &&
  !/service-worker\.js/.test(asset) &&
  !/precache-manifest\.[0-9a-f]+\.js/.test(asset)
);

const printFileSizesAfterBuild = (
  webpackStats,
  previousSizeMap,
  buildFolder,
  maxBundleGzipSize,
  maxChunkGzipSize
) => {
  const root = previousSizeMap.root;
  const sizes = previousSizeMap.sizes;
  const assets = (webpackStats.stats || [webpackStats])
    .map(stats =>
      stats
        .toJson({ all: false, assets: true })
        .assets.filter(asset => canReadAsset(asset.name))
        .map(asset => {
          const fileContents = fs.readFileSync(path.join(root, asset.name));
          const size = gzipSize(fileContents);
          const previousSize = sizes[removeFileNameHash(root, asset.name)];
          const difference = getDifferenceLabel(size, previousSize);
          return {
            folder: path.join(
              path.basename(buildFolder),
              path.dirname(asset.name)
            ),
            name: path.basename(asset.name),
            size: size,
            sizeLabel: filesize(size) + (difference ? ' (' + difference + ')' : '')
          };
        })
    )
    .reduce((single, all) => all.concat(single), []);
  assets.sort((a, b) => b.size - a.size);
  const longestSizeLabelLength = Math.max.apply(
    null,
    assets.map(a => stripAnsi(a.sizeLabel).length)
  );
  let suggestBundleSplitting = false;
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
    if (isLarge && path.extname(asset.name) === '.js') {
      suggestBundleSplitting = true;
    }
    console.log(
      '  ' +
        (isLarge ? chalk.yellow(sizeLabel) : sizeLabel) +
        '  ' +
        chalk.dim(asset.folder + path.sep) +
        chalk.cyan(asset.name)
    );
  });
  if (suggestBundleSplitting) {
    console.log();
    console.log(
      chalk.yellow('The bundle size is significantly larger than recommended.')
    );
    console.log(
      chalk.yellow(
        'Consider reducing it with code splitting: https://goo.gl/9VhYWB'
      )
    );
    console.log(
      chalk.yellow(
        'You can also analyze the project dependencies: https://goo.gl/LeUzfb'
      )
    );
  }
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

// Input: 1024, 2048
// Output: "(+1 KB)"
const getDifferenceLabel = (currentSize, previousSize) => {
  const FIFTY_KILOBYTES = 1024 * 50;
  const difference = currentSize - previousSize;
  const fileSize = !Number.isNaN(difference) ? filesize(difference) : 0;
  if (difference >= FIFTY_KILOBYTES) {
    return chalk.red('+' + fileSize);
  } else if (difference < FIFTY_KILOBYTES && difference > 0) {
    return chalk.yellow('+' + fileSize);
  } else if (difference < 0) {
    return chalk.green(fileSize);
  } else {
    return '';
  }
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
