const resolve = require('resolve');
const fs = require('fs-extra');

const getBin = (candidate) => {
  if (typeof candidate === 'string') {
    return candidate;
  }
  for (const key in candidate) {
    return candidate[key];
  }
  return null;
};

module.exports = (id) => {
  require(resolve.sync(id, {
    readPackageSync(_, pkgPath) {
      const pkg = fs.readJSONSync(pkgPath);
      const bin = getBin(pkg.bin);
      if (bin) {
        pkg.main = bin;
      }
      return pkg;
    }
  }));
};
