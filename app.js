var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy'),
    util = require('util'),
    colors = require('colors'),
    path = require('path');

// auth server proxy
var authProxy = httpProxy.createServer({
    target: {
        host: '10.10.30.240',
        port: 8082
    },
    ssl: {
        key: fs.readFileSync('ia.key', 'utf8'),
        cert: fs.readFileSync('ia.crt', 'utf8')
    }
}).listen(8082);

authProxy.on('error', function (e) {
    console.log("Auth Proxy => Some error happened: " + JSON.stringify(e));
});

authProxy.on('proxyRes', function (proxyRes, req, res, options) {
    //console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
    //console.log("This is the location header value: " + proxyRes.headers.location);
    if (proxyRes.headers.location) {
        console.log("Location found, so operating: " + proxyRes.headers.location);
        proxyRes.headers.location = proxyRes.headers.location.replace("http://10.10.30.240", "https://gw.rajmohan.mitel.com");
    }
});

console.log('https auth proxy server'.blue + ' started '.green.bold + 'on port '.blue + '8082'.yellow);


// web server proxy
var webProxy = httpProxy.createServer({
    target: {
        host: '10.10.30.240',
        port: 8080
    },
    ssl: {
        key: fs.readFileSync('ia.key', 'utf8'),
        cert: fs.readFileSync('ia.crt', 'utf8')
    }
}).listen(8080);

webProxy.on('error', function (e) {
    console.log("Web Proxy => Some error happened: " + JSON.stringify(e));
});

console.log('https web server proxy '.blue + 'started '.green.bold + 'on port '.blue + '8080 '.yellow);