const ignoredFiles = require('../lib/ignoredFiles');

const paths = require('./paths');

const noopServiceWorkerMiddleware = require('../middlewares/noopServiceWorkerMiddleware');
const redirectServedPath = require('../middlewares/redirectServedPathMiddleware');

module.exports = (host, port) => {
  return {
    allowedHosts: 'all',
    compress: false,
    static: [{
      directory: paths.appPublic,
      publicPath: paths.publicUrlOrPath,
      serveIndex: false,
      watch: {
        ignored: ignoredFiles(paths.appSrc)
      }
    }],
    hot: true,
    devMiddleware: {
      publicPath: paths.publicUrlOrPath.slice(1)
    },
    host,
    port,
    client: {
      overlay: false,
      webSocketTransport: paths.appDevClient
    },
    https: false,
    http2: false,
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath
    },
    onAfterSetupMiddleware(app) {
      app.use(redirectServedPath(paths.publicUrlOrPath));
      app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));
    }
  };
};
