const loaderUtils = require('loader-utils');
const path = require('path');

module.exports = (
  context,
  localIdentName,
  localName,
  options
) => {
  const fileNameOrFolder = context.resourcePath.endsWith('index.module.css') ?
    '[folder]' :
    '[name]';

  const base = path.posix.relative(context.rootContext, context.resourcePath) + localName;
  const hash = loaderUtils.getHashDigest(base, 'md4', 'hex', 8);

  const className = loaderUtils.interpolateName(
    context,
    `${fileNameOrFolder}_${localName}__${hash}`,
    options
  );

  return className.replace('.module_', '_').replaceAll('.', '_');
};
