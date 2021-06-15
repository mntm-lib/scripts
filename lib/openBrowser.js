const execSync = require('child_process').execSync;
const open = require('open');

module.exports = (url) => {
  const shouldTryOpenChromiumWithAppleScript =
    process.platform === 'darwin';

  if (shouldTryOpenChromiumWithAppleScript) {
    const supportedChromiumBrowsers = [
      'Google Chrome Canary',
      'Google Chrome',
      'Microsoft Edge',
      'Brave Browser',
      'Vivaldi',
      'Chromium'
    ];

    for (let chromiumBrowser of supportedChromiumBrowsers) {
      try {
        execSync('ps cax | grep "' + chromiumBrowser + '"');
        execSync(
          'osascript openChrome.applescript "' +
            encodeURI(url) +
            '" "' +
            chromiumBrowser +
            '"',
          {
            cwd: __dirname,
            stdio: 'ignore'
          }
        );
        return true;
      } catch (err) {
        // Ignore errors.
      }
    }
  }

  try {
    const options = { wait: false, url: true };
    open(url, options).catch(() => {});
    return true;
  } catch (err) {
    return false;
  }
};
