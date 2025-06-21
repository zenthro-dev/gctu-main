const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy requests to Expo API
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://expo.dev',
      changeOrigin: true,
      secure: false,
      headers: {
        'Connection': 'keep-alive'
      },
      onProxyRes: function(proxyRes) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );
};