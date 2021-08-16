const loaderUtils = require('loader-utils');
const swc = require('@swc/core');

module.exports = async function (source, inputSourceMap) {
  // Make the loader async
  const callback = this.async();

  let loaderOptions = loaderUtils.getOptions(this) || {};

  const programmaticOptions = {
    filename: this.resourcePath,
    sourceFileName: this.resourcePath
  };

  if ('sourceMaps' in loaderOptions) {
    programmaticOptions.sourceMaps = loaderOptions.sourceMaps;
  } else if ('sourceMap' in loaderOptions) {
    programmaticOptions.sourceMaps = loaderOptions.sourceMap;
  } else {
    programmaticOptions.sourceMaps = this.sourceMap;
  }

  if (programmaticOptions.sourceMaps === 'inline') {
    programmaticOptions.sourceMaps = true;
  }

  if (inputSourceMap) {
    programmaticOptions.inputSourceMap = JSON.stringify(inputSourceMap);
  }

  programmaticOptions.jsc = loaderOptions.jsc || {};
  programmaticOptions.jsc.parser = loaderOptions.jsc.parser || {};
  programmaticOptions.jsc.transform = loaderOptions.jsc.transform || {};

  // detect syntax
  if (
    this.resourcePath.endsWith('.ts') ||
    this.resourcePath.endsWith('.tsx')
  ) {
    programmaticOptions.jsc.parser.syntax = 'typescript';
  } else {
    programmaticOptions.jsc.parser.syntax = 'ecmascript';
  }

  // detect jsx
  if (
    this.resourcePath.endsWith('.jsx') ||
    this.resourcePath.endsWith('.tsx')
  ) {
    programmaticOptions.jsc.parser.jsx = true;
    programmaticOptions.jsc.transform.react = {
      runtime: 'automatic'
    };

    if (this.mode === 'development') {
      programmaticOptions.jsc.transform.react.development = true;
      programmaticOptions.jsc.transform.react.refresh = {
        refreshReg: '$RefreshReg$',
        refreshSig: '$RefreshSig$',
        emitFullSignatures: true
      };
    }
  } else {
    programmaticOptions.jsc.parser.jsx = false;
  }

  // overwrite cuz we need plugin to minimize
  programmaticOptions.jsc.minify = false;
  programmaticOptions.jsc.transform.optimizer = this.mode === 'development';

  try {
    const output = await swc.transform(source, programmaticOptions);

    callback(
      null,
      output.code,
      output.map && JSON.parse(output.map)
    );
  } catch (err) {
    callback(
      err,
      null,
      null
    );
  }
};
