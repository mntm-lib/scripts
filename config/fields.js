const esm = [
  // Non-standard esm
  'modern',
  'esm',
  'esnext',

  // Previous de-facto standard
  'jsnext:main',
  'jsnext',

  // These are generally shipped as a higher ES language level than `module`
  'es2015',
  'esm2015',
  'fesm2015',

  // Current leading de-facto standard
  'module',

  // Lower ES level
  'esm5',
  'fesm5'
];

const cjs = [
  // Standard
  'main',
  'browser',

  // Fallback
  'umd:main',
  'umd',

  // Vendor specific
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
