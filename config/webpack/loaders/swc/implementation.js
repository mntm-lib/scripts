const loaderUtils = require('loader-utils');
const swc = require('@swc/core');

/**
 * @this {any}
 */
module.exports = async function(source, inputSourceMap) {
  // Make the loader async
  const callback = this.async();

  const loaderOptions = loaderUtils.getOptions(this) || {};

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

  programmaticOptions.env = Object.assign({}, loaderOptions.env);
  programmaticOptions.env.dynamicImport = true;

  programmaticOptions.jsc = Object.assign({}, loaderOptions.jsc);
  programmaticOptions.jsc.parser = Object.assign({}, loaderOptions.jsc.parser);
  programmaticOptions.jsc.transform = Object.assign({}, loaderOptions.jsc.transform);

  // Detect syntax
  if (
    this.resourcePath.endsWith('.ts') ||
    this.resourcePath.endsWith('.tsx')
  ) {
    programmaticOptions.jsc.parser.syntax = 'typescript';

    // Consist with ecmascript
    programmaticOptions.jsc.parser.dynamicImport = true;
  } else {
    programmaticOptions.jsc.parser.syntax = 'ecmascript';
  }

  // Detect jsx
  if (
    this.resourcePath.endsWith('.jsx') ||
    this.resourcePath.endsWith('.tsx')
  ) {
    if (programmaticOptions.jsc.parser.syntax === 'typescript') {
      programmaticOptions.jsc.parser.tsx = true;
    } else {
      programmaticOptions.jsc.parser.jsx = true;
    }

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
    } else {
      programmaticOptions.jsc.transform.react.development = false;
      programmaticOptions.jsc.transform.react.refresh = false;
    }
  } else if (programmaticOptions.jsc.parser.syntax === 'typescript') {
    programmaticOptions.jsc.parser.tsx = false;
  } else {
    programmaticOptions.jsc.parser.jsx = false;
  }

  // Unstable implementation
  programmaticOptions.jsc.minify = null;

  if (this.mode === 'development') {
    programmaticOptions.jsc.transform.optimizer = null;
  } else {
    programmaticOptions.jsc.transform.optimizer = Object.assign({}, programmaticOptions.jsc.transform.optimizer);
  }

  try {
    const output = await swc.transform(source, programmaticOptions);

    return callback(
      null,
      output.code,
      output.map && JSON.parse(output.map)
    );
  } catch (ex) {
    return callback(
      ex
    );
  }
};
