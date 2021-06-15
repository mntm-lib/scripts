const evalSourceMapMiddleware = require('../lib/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('../lib/noopServiceWorkerMiddleware');
const ignoredFiles = require('../lib/ignoredFiles');
const redirectServedPath = require('../lib/redirectServedPathMiddleware');
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
    transportMode: {
      client: paths.appDevClient
    },
    devMiddleware: {
      publicPath: paths.publicUrlOrPath.slice(0, -1)
    },
    host,
    client: {
      port,
      overlay: false,
      needClientEntry: true,
      needHotEntry: true
    },
    https: false,
    http2: false,
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
