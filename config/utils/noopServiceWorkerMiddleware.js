const path = require('path');

module.exports = (servedPath) => (req, res, next) => {
  if (req.url === path.join(servedPath, 'service-worker.js')) {
    res.setHeader('Content-Type', 'text/javascript');
    res.send('self.addEventListener("install",()=>self.skipWaiting()),self.addEventListener("activate",()=>{self.clients.matchAll({type:"window"}).then(e=>{for(let t of e)t.navigate(t.url)})})');
  } else {
    next();
  }
};
