const launchEditor = require('./launchEditor');
const launchEditorEndpoint = require('./launchEditorEndpoint');

module.exports = () => (req, res, next) => {
  if (req.url.startsWith(launchEditorEndpoint)) {
    const lineNumber = parseInt(req.query.lineNumber, 10) || 1;
    const colNumber = parseInt(req.query.colNumber, 10) || 1;
    launchEditor(req.query.fileName, lineNumber, colNumber);
    res.end();
  } else {
    next();
  }
};
