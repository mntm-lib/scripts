const path = require('path');

module.exports = (servedPath) => {
  const served = servedPath.slice(0, -1);

  return (req, res, next) => {
    if (
      served === '' ||
      req.url === served ||
      req.url.startsWith(served)
    ) {
      return next();
    }

    const newPath = path.join(served, req.path !== '/' ? req.path : '');

    res.redirect(newPath);
  };
};
