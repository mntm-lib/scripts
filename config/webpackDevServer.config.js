const errorOverlayMiddleware = require('./utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('./utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('./utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('./utils/ignoredFiles');
const redirectServedPath = require('./utils/redirectServedPathMiddleware');
const paths = require('./paths');

module.exports = (proxy, allowedHost) => {
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
    transportMode: 'ws',
    dev: {
      publicPath: paths.publicUrlOrPath.slice(0, -1)
    },
    https: false,
    http2: false,
    host: process.env.HOST || '0.0.0.0',
    overlay: false,
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath
    },
    public: allowedHost,
    proxy,
    onBeforeSetupMiddleware(app, server) {
      app.use(evalSourceMapMiddleware(server));
      app.use(errorOverlayMiddleware());
    },
    onAfterSetupMiddleware(app) {
      app.use(redirectServedPath(paths.publicUrlOrPath));
      app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));
    }
  };
};
