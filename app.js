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
        proxyRes.headers.location = proxyRes.headers.location.replace("http://10.10.30.240", "https://gw.somedomainat.com");
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


// notification server websocket proxy
var wsProxy = httpProxy.createServer({
    target: {
        host: '10.10.30.240',
        port: 3030
    },
    ssl: {
        key: fs.readFileSync('ia.key', 'utf8'),
        cert: fs.readFileSync('ia.crt', 'utf8')
    },
    ws: true
}).listen(3030);

wsProxy.on('error', function (e) {
    console.log("WS Proxy => Some error happened: " + JSON.stringify(e));
});

wsProxy.on('upgrade', function (req, socket, head) {
    console.log("Upgrading http to websocket");
    console.log("REQ: " + JSON.stringify(req));
    console.log("HEAD: " + JSON.stringify(head));
    proxy.ws(req, socket, head);
});

wsProxy.on('proxyReqWs', function (proxyReq, req, socket, options, head) {
    // http-proxy header names are in lower case including the first character and
    // some webservers do not like it. So just rewrite the header name to satisfy them.
    proxyReq.setHeader('Host', proxyReq.getHeader('host'));
    proxyReq.setHeader('Upgrade', proxyReq.getHeader('upgrade'));
    proxyReq.setHeader('Connection', proxyReq.getHeader('connection'));
    proxyReq.setHeader('Origin', proxyReq.getHeader('origin'));

    proxyReq.setHeader('Sec-WebSocket-Version', proxyReq.getHeader('sec-websocket-version'));
    proxyReq.setHeader('Sec-WebSocket-Key', proxyReq.getHeader('sec-websocket-key'));
    proxyReq.setHeader('Sec-WebSocket-Extensions', proxyReq.getHeader('sec-websocket-extensions'));

    proxyReq.setHeader('Accept-Encoding', proxyReq.getHeader('accept-encoding'));
    proxyReq.setHeader('Accept-Language', proxyReq.getHeader('accept-language'));
});

console.log('WS web server proxy '.red.bold + 'started '.green.bold + 'on port '.yellow + '8080 '.green);
