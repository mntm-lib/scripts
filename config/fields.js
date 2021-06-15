const esm = [
  // these are generally shipped as a higher ES language level than `module`
  'modern',
  'es2015',
  'esm2015',
  'fesm2015',
  // non-standard esm
  'esm',
  'esnext',
  // current leading de-facto standard
  'module',
  // previous de-facto standard
  'jsnext:main',
  'jsnext',
  // lower ES level
  'esm5',
  'fesm5'
];

const cjs = [
  // standard
  'browser',
  'main',
  // fallback
  'umd:main',
  'umd',
  // vendor specific
  'unpkg'
];

const all = [
  ...esm,
  ...cjs
];

module.exports = {
  esm,
  cjs,
  all
};
