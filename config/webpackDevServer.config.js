const ignoredFiles = require('../lib/ignoredFiles');

const paths = require('./paths');

/** @return {import('webpack-dev-server').Configuration} */
module.exports = (host, port) => {
  return {
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*'
    },
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
    }
  };
};
