const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    proxy('/api', {
      target: 'http://94.191.43.76:3000',
      pathRewrite:{
        '^/api':''
      }
    })
  );
};
