# Proxy Configuration

## Overview

This document describes how to configure a proxy in the NinjaXT library. Proxy support allows the library to route all its WebSocket and REST communications through a specified proxy server.

## Proxy Configuration

You can configure your proxy by passing a `proxyUrl` parameter when you instantiate the Exchange class. This can be done directly in the constructor or by setting the `proxyUrl` property on an existing instance.

### Example Usage

#### Configuring Proxy During Instance Creation

```javascript
import { Binance } from './binance.js';

// Create instance with proxy
const binance = new Binance({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    proxyUrl: process.env.PROXY_URL, // Example: http://localhost:8080
});
```

#### Configuring Proxy After Instance Creation

```javascript
// Create instance without proxy
const binance = new Binance({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
});

// Set proxy URL
binance.proxyUrl = process.env.PROXY_URL; // Example: http://localhost:8080
```

## Server Configuration Example

```javascript
import http from 'http';
import httpProxy from 'http-proxy';

// Create a proxy server with WebSocket support
const httpProxyServer = httpProxy.createProxyServer({ ws: true });

// Create an HTTP server
const httpServer = http.createServer(function (req, res) {
    const host = req.headers.host;
    console.log(`HTTP Request received for ${host}`);
    httpProxyServer.web(req, res, { target: `https://${host}` });
});

// Handle WebSocket requests
httpServer.on('upgrade', function (req, socket, head) {
    httpProxyServer.ws(req, socket, head, { target: `wss://${req.headers.host}` });
});

// Listen on port 8000
httpServer.listen(8000, () => {
    console.log('HTTP Proxy server listening on port 8000');
});
```

## Client Example

```javascript
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { Binance } from './binance.js';

const binance = new Binance({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    proxyUrl: process.env.PROXY_URL, // Example: http://localhost:8080
});

(async () => {
    let openOrders = await binance.openOrders('BTC/USDT');
    console.log(openOrders);

    let tradeStream = await binance.tradeStream('BTC/USDT');
    tradeStream.on('message', trade => {
        console.log(trade);
    });
})();
```
