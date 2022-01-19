var http = require('http');
var https = require('https');

const proxyIp = '127.0.0.1';
const proxyPort = '10809';
const targetUrl = 'https://petstore.swagger.io/v2/swagger.json';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36';

http.request(
  {
    host: proxyIp,
    port: proxyPort,
    method: 'GET',
    path: targetUrl,
    headers: {
      'User-Agent': UA
    }
  },
  function (res) {
    let chunk = '';
    res.on('data', function (data) {
      console.log('data:', data);
      chunk += data;
    });
    res.on('end', function() {
      console.log('end', chunk);
    });
    res.on('error', function(e) {
      console.log('err', e.message);
    });
  }
).end();
