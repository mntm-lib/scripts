const esm = [
  // non-standard esm
  'modern',
  'esm',
  'esnext',
  // these are generally shipped as a higher ES language level than `module`
  'es2015',
  'esm2015',
  'fesm2015',
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
  'main',
  'browser',
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
