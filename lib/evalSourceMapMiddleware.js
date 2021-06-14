const base64SourceMap = (source) => {
  const base64 = Buffer.from(JSON.stringify(source.map()), 'utf8').toString('base64');
  return `data:application/json;charset=utf-8;base64,${base64}`;
};

const getSourceById = (server, id) => {
  const module = server._stats.compilation.modules.find(m => m.id == id);
  return module.originalSource();
};

module.exports = (server) => (req, res, next) => {
  if (req.url.startsWith('/__get-internal-source')) {
    const fileName = req.query.fileName;
    const id = fileName.match(/webpack-internal:\/\/\/(.+)/)[1];
    if (!id || !server._stats) {
      next();
    }

    const source = getSourceById(server, id);
    const sourceMapURL = `//# sourceMappingURL=${base64SourceMap(source)}`;
    const sourceURL = `//# sourceURL=webpack-internal:///${module.id}`;
    res.end(`${source.source()}\n${sourceMapURL}\n${sourceURL}`);
  } else {
    next();
  }
};
