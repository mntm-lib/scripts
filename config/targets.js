module.exports = {
  development: {
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
    postcss: 'chrome >= 90, safari >= 14'
  },
  production: {
    babel: {
      modern: {
        esmodules: true
      },
      legacy: {
        chrome: '30',
        safari: '9',
        ios: '9',
        edge: '15',
        firefox: '54'
      }
    },
    postcss: 'chrome >= 30, safari >=9, ios >= 9, edge >= 15, firefox >= 54'
  }
};
