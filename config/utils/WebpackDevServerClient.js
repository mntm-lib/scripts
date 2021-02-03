/* eslint-env browser */
const formatWebpackMessages = require('./formatWebpackMessages');

module.exports = class WebpackDevServerClient {
  static getClientPath() {
    return require.resolve('./WebpackDevServerClient');
  }

  constructor() {
    this.hasRuntimeError = false;
    this.hasCompileError = false;

    this.mostRecentCompilationHash = null;

    this.client = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:${window.location.port}/ws`);

    const noop = () => { };
    const console = typeof window.console !== 'undefined' ? window.console : {};
    this.hmrLog = typeof console.log === 'function' ? console.log.bind(console, '[HMR]') : noop;
    this.hmrReport = typeof console.error === 'function' ? console.error.bind(console, '[HMR]') : this.hmrLog;
    this.hmrClear = typeof console.clear === 'function' ? console.clear.bind(console) : noop;
  }

  onOpen(callback) {
    this.client.onopen = () => {
      this.hmrLog('The development server has connected');
      callback();
    };
  }

  onClose(callback) {
    this.client.onclose = () => {
      this.hmrReport('The development server has disconnected');
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
    this.hasCompileErrors = false;
    this.tryApplyUpdates();
  }

  handleWarnings() {
    this.hmrReport('Warnings while compiling - check console output');
    this.handleSuccess();
  }

  handleErrors(errors) {
    this.clearOutdatedErrors();
    this.hasCompileErrors = true;

    const formatted = formatWebpackMessages({
      errors: errors,
      warnings: []
    });

    for (let i = 0; i < formatted.errors.length; ++i) {
      this.hmrReport(formatted.errors[i]);
    }
  }

  handleError(error) {
    this.hmrReport(error);
  }

  handleInvalid() {
    this.hmrLog('Update detected');
  }

  clearOutdatedErrors() {
    if (this.hasCompileErrors) {
      this.hmrClear();
    }
  }

  canApplyUpdates() {
    return module.hot.status() === 'idle';
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
      if (err) {
        this.hmrReport(err);
      }

      if (update && update.length) {
        this.hmrLog('Updated:', update.map((name) => `\r\n\xa0\xa0\xa0${name}`).join(''));
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
