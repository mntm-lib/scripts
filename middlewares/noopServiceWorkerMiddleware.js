const path = require('path');

const sw = 'self.addEventListener("install",()=>self.skipWaiting()),self.addEventListener("activate",()=>{self.clients.matchAll({type:"window"}).then(e=>{for(let t of e)t.navigate(t.url)})})';

module.exports = (servedPath) => (req, res, next) => {
  if (req.url === path.join(servedPath, 'service-worker.js')) {
    res.setHeader('Content-Type', 'text/javascript');
    res.send(sw);
  } else {
    return next();
  }
};
