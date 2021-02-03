const evalSourceMapMiddleware = require('./utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('./utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('./utils/ignoredFiles');
const redirectServedPath = require('./utils/redirectServedPathMiddleware');
const paths = require('./paths');

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
    injectHot: true,
    injectClient: true,
    transportMode: {
      client: paths.appDevClient
    },
    dev: {
      publicPath: paths.publicUrlOrPath.slice(0, -1)
    },
    host,
    client: {
      port
    },
    https: false,
    http2: false,
    overlay: false,
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath
    },
    public: allowedHost,
    onBeforeSetupMiddleware(app, server) {
      app.use(evalSourceMapMiddleware(server));
    },
    onAfterSetupMiddleware(app) {
      app.use(redirectServedPath(paths.publicUrlOrPath));
      app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));
    }
  };
};
