const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const calcFileSize = require('filesize');
const calcGzipSize = require('gzip-size').sync;

const printBundleSize = (longestFileSizeLength, longestGzipSizeLength, fileSize, gzipSize, title, assets) => {
  console.log(title);
  console.log();
  assets.forEach(asset => {
    console.log(
      '  ' +
      asset.fileSize.padEnd(longestFileSizeLength) +
      '  ' +
      chalk.green(asset.gzipSize.padEnd(longestGzipSizeLength)) +
      '  ' +
      chalk.dim(asset.folder + path.sep) +
      chalk.cyan(asset.name) +
      '  ' +
      '[' + asset.chunks + ']'
    );
  });
  console.log('  ' + '-'.repeat(longestFileSizeLength + 2 + longestGzipSizeLength));
  console.log(
    '  ' +
    fileSize.padEnd(longestFileSizeLength) +
    '  ' +
    chalk.green(gzipSize)
  );
  console.log();
};

module.exports = (
  webpackStats,
  buildFolder
) => {
  const assets = webpackStats.stats
    .map((stats) =>
      stats
        .toJson({ all: false, assets: true, assetsSort: 'size' })
        .assets.filter((asset) => ('' + asset.name).endsWith('.js'))
        .map(asset => {
          const fileContents = fs.readFileSync(path.join(buildFolder, asset.name));
          const gzip = calcGzipSize(fileContents);
          return {
            folder: path.join(
              path.basename(buildFolder),
              path.dirname(asset.name)
            ),
            name: path.basename(asset.name),
            chunks: asset.chunkNames.concat(asset.chunkIdHints).join(', '),
            rawFileSize: fileContents.length,
            fileSize: calcFileSize(fileContents.length),
            rawGzipSize: gzip,
            gzipSize: calcFileSize(gzip)
          };
        })
    );

  const all = assets.flat();

  const modern = assets[0];
  const modernRawFileSize = modern.reduce((acc, asset) => acc + asset.rawFileSize, 0);
  const modernFileSize = calcFileSize(modernRawFileSize);
  const modernRawGzipSize = modern.reduce((acc, asset) => acc + asset.rawGzipSize, 0);
  const modernGzipSize = calcFileSize(modernRawGzipSize);

  const legacy = assets[1];
  const legacyRawFileSize = legacy.reduce((acc, asset) => acc + asset.rawFileSize, 0);
  const legacyFileSize = calcFileSize(legacyRawFileSize);
  const legacyRawGzipSize = legacy.reduce((acc, asset) => acc + asset.rawGzipSize, 0);
  const legacyGzipSize = calcFileSize(legacyRawGzipSize);

  const longestFileSizeLength = Math.max.apply(
    null,
    [modernFileSize.length, legacyFileSize.length].concat(all.map(a => a.fileSize.length))
  );
  const longestGzipSizeLength = Math.max.apply(
    null,
    [modernGzipSize.length, legacyGzipSize.length].concat(all.map(a => a.gzipSize.length))
  );

  printBundleSize(
    longestFileSizeLength,
    longestGzipSizeLength,
    modernFileSize,
    modernGzipSize,
    'Modern bundle size:',
    modern
  );
  printBundleSize(
    longestFileSizeLength,
    longestGzipSizeLength,
    legacyFileSize,
    legacyGzipSize,
    'Legacy bundle size:',
    legacy
  );
};
