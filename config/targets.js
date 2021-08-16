module.exports = {
  development: {
    terser: {
      modern: 2020,
      legacy: 2020
    },
    babel: {
      modern: {
        chrome: '90',
        safari: '14'
      },
      legacy: {
        chrome: '90',
        safari: '14'
      }
    },
    swc: {
      modern: 'es2020',
      legacy: 'es2020'
    },
    postcss: 'chrome >= 90, safari >= 14'
  },
  production: {
    terser: {
      modern: 2018,
      legacy: 5
    },
    babel: {
      modern: {
        chrome: '63',
        safari: '11.1',
        ios: '11.3',
        edge: '79',
        firefox: '67'
      },
      legacy: {
        chrome: '30',
        safari: '9',
        ios: '9',
        edge: '15',
        firefox: '54'
      }
    },
    swc: {
      modern: 'es2015',
      legacy: 'es5'
    },
    postcss: 'chrome >= 30, safari >=9, ios >= 9, edge >= 15, firefox >= 54'
  }
};
