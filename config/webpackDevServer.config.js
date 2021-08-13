const ignoredFiles = require('../lib/ignoredFiles');

const paths = require('./paths');

const noopServiceWorkerMiddleware = require('../middlewares/noopServiceWorkerMiddleware');
const redirectServedPath = require('../middlewares/redirectServedPathMiddleware');

module.exports = (allowedHost, host, port) => {
  return {
    firewall: false,
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
    transportMode: {
      client: paths.appDevClient
    },
    devMiddleware: {
      publicPath: paths.publicUrlOrPath.slice(1)
    },
    host,
    client: {
      port,
      overlay: false
    },
    https: false,
    http2: false,
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath
    },
    public: allowedHost,
    onAfterSetupMiddleware(app) {
      app.use(redirectServedPath(paths.publicUrlOrPath));
      app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));
    }
  };
};
