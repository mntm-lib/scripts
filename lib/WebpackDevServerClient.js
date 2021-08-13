/* eslint-env browser */
const formatWebpackMessages = require('./formatWebpackMessages');
const stripAnsi = require('strip-ansi');

module.exports = class WebpackDevServerClient {
  static getClientPath() {
    return require.resolve('./WebpackDevServerClient');
  }

  constructor() {
    this.hasRuntimeError = false;
    this.hasCompileError = false;

    this.mostRecentCompilationHash = null;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.hostname;
    const port = window.location.port;

    this.client = new WebSocket(`${protocol}://${host}:${port}/ws`);

    if (module.hot.dispose) {
      module.hot.dispose(() => {
        if (!this.hasCompileError) {
          this.hasRuntimeError = false;
        }
      });
    }
  }

  log(str) {
    console.log('[HMR]', str);
  }

  onOpen(callback) {
    this.client.onopen = () => {
      this.log('The development server has connected');
      callback();
    };
  }

  onClose(callback) {
    this.client.onclose = () => {
      this.log('The development server has disconnected');
      callback();
    };
  }

  onMessage() {
    this.client.onmessage = (e) => {
      const message = JSON.parse(e.data);
      switch (message.type) {
        case 'hash':
          this.handleHash(message.data);
          break;
        case 'still-ok':
        case 'ok':
          this.handleSuccess();
          break;
        case 'warnings':
          this.handleWarnings();
          break;
        case 'content-changed':
          window.location.reload();
          break;
        case 'error':
          this.handleError(message.data);
          break;
        case 'errors':
          this.handleErrors(message.data);
          break;
        case 'invalid':
          this.handleInvalid();
          break;
        default:
          break;
      }
    };
  }

  handleHash(hash) {
    this.mostRecentCompilationHash = hash;
  }

  handleSuccess() {
    this.clearOutdatedErrors();
    this.hasCompileError = false;
    this.tryApplyUpdates();
  }

  handleWarnings() {
    this.log('Warnings while compiling - check console output');
    this.handleSuccess();
  }

  handleErrors(errors) {
    this.clearOutdatedErrors();
    this.hasCompileError = true;

    const formatted = formatWebpackMessages({
      errors: errors,
      warnings: []
    });

    for (let i = 0; i < formatted.errors.length; ++i) {
      this.log(stripAnsi(formatted.errors[i]));
    }
  }

  handleError(error) {
    this.log(error);
  }

  handleInvalid() {
    this.log('Update detected');
  }

  clearOutdatedErrors() {
    if (this.hasCompileError) {
      this.hmrClear();
    }
  }

  canApplyUpdates() {
    return module.hot.status() === 'idle';
  }

  canAcceptErrors() {
    return !(['abort', 'fail'].includes(module.hot.status()));
  }

  isUpdateAvailable() {
    // eslint-disable-next-line no-undef
    return this.mostRecentCompilationHash !== __webpack_hash__;
  }

  tryApplyUpdates() {
    if (!module.hot) {
      window.location.reload();
      return;
    }

    if (!this.isUpdateAvailable() || !this.canApplyUpdates()) {
      return;
    }

    const handleApplyUpdates = (err, update) => {
      const haveErrors = (err || this.hasRuntimeError) && !this.canAcceptErrors();
      const needsForcedReload = !err && !update;

      if (haveErrors || needsForcedReload) {
        window.location.reload();
        return;
      }

      if (!this.hasCompileError) {
        this.hasRuntimeError = false;
      }

      if (update && update.length) {
        this.log('Updated:', update.map((name) => `\r\n\xa0\xa0\xa0${name}`).join(''));
      }

      if (this.isUpdateAvailable()) {
        this.tryApplyUpdates();
      }
    };

    const result = module.hot.check(true, handleApplyUpdates);
    if (result && result.then) {
      result.then((updatedModules) => {
        handleApplyUpdates(null, updatedModules);
      }, (err) => {
        handleApplyUpdates(err, null);
      });
    }
  }
};
