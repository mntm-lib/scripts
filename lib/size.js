const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const calcFileSize = require('filesize');
const calcGzipSize = require('gzip-size').sync;

const printBundleSize = (longestFileSizeLength, longestGzipSizeLength, fileSize, gzipSize, title, assets) => {
  console.log(title);
  console.log();
  assets.forEach((asset) => {
    console.log(
      `  ${
        asset.fileSize.padEnd(longestFileSizeLength)
      }  ${
        chalk.green(asset.gzipSize.padEnd(longestGzipSizeLength))
      }  ${
        chalk.dim(asset.folder + path.sep)
      }${chalk.cyan(asset.name)
      }  ` +
      `[${asset.chunks}]`
    );
  });
  if (assets.length > 1) {
    console.log(`  ${'-'.repeat(longestFileSizeLength + 2 + longestGzipSizeLength)}`);
    console.log(
      `  ${fileSize.padEnd(longestFileSizeLength)
      }  ${chalk.green(gzipSize)}`
    );
  }
  console.log();
};

const fastReduce = (arr, reduce, acc) => {
  for (const item of arr) {
    // eslint-disable-next-line no-param-reassign
    acc = reduce(acc, item);
  }

  return acc;
};

module.exports = (
  webpackStats,
  buildFolder
) => {
  const base = path.basename(buildFolder);

  const transform = (asset) => {
    const fileContents = fs.readFileSync(path.join(buildFolder, asset.name));
    const gzip = calcGzipSize(fileContents);

    const chunks = [].concat(
      asset.chunkNames,
      asset.chunkIdHints
    ).filter((item, iter, arr) => arr.indexOf(item) === iter);

    return {
      folder: path.join(base, path.dirname(asset.name)),
      name: path.basename(asset.name),
      chunks: chunks.join(', '),
      rawFileSize: fileContents.length,
      fileSize: calcFileSize(fileContents.length),
      rawGzipSize: gzip,
      gzipSize: calcFileSize(gzip)
    };
  };

  const stats = webpackStats.stats.map((all) => all.toJson({
    all: false,
    assets: true,
    assetsSort: 'size'
  }));

  const styles = stats.flatMap((stat) => {
    return stat.assets.filter((asset) => asset.name && asset.name.endsWith('.css')).map(transform);
  });

  const stylesRawFileSize = fastReduce(styles, (acc, asset) => acc + asset.rawFileSize, 0);
  const stylesFileSize = calcFileSize(stylesRawFileSize);
  const stylesRawGzipSize = fastReduce(styles, (acc, asset) => acc + asset.rawGzipSize, 0);
  const stylesGzipSize = calcFileSize(stylesRawGzipSize);

  const assets = stats.map((stat) => {
    return stat.assets.filter((asset) => asset.name && asset.name.endsWith('.js')).map(transform);
  });

  const modern = assets[0];
  const modernRawFileSize = fastReduce(modern, (acc, asset) => acc + asset.rawFileSize, 0);
  const modernFileSize = calcFileSize(modernRawFileSize);
  const modernRawGzipSize = fastReduce(modern, (acc, asset) => acc + asset.rawGzipSize, 0);
  const modernGzipSize = calcFileSize(modernRawGzipSize);

  const legacy = assets[1];
  const legacyRawFileSize = fastReduce(legacy, (acc, asset) => acc + asset.rawFileSize, 0);
  const legacyFileSize = calcFileSize(legacyRawFileSize);
  const legacyRawGzipSize = fastReduce(legacy, (acc, asset) => acc + asset.rawGzipSize, 0);
  const legacyGzipSize = calcFileSize(legacyRawGzipSize);

  const longestFileSizeLength = Reflect.apply(Math.max, Math, [stylesFileSize.length, modernFileSize.length, legacyFileSize.length]);
  const longestGzipSizeLength = Reflect.apply(Math.max, Math, [stylesGzipSize.length, modernGzipSize.length, legacyGzipSize.length]);

  printBundleSize(
    longestFileSizeLength,
    longestGzipSizeLength,
    stylesFileSize,
    stylesGzipSize,
    'Styles bundle size:',
    styles
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
