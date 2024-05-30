# NinjaXT Library

NinjaXT is a comprehensive trading library designed for cryptocurrency platforms (currently supports Binance, Gateio and Bitmusa). It supports both spot and futures markets and is capable of handling both REST API calls and WebSocket streams.

## Features

- **REST API Integration**: Easy-to-use methods for accessing REST APIs.
- **WebSocket Support**: Real-time market data through WebSocket connections.
- **Proxy Configuration**: Support for routing traffic through a proxy server.
- **Multi-Exchange Support**: Currently supports Binance, Bitmusa and Gateio with plans to expand.
- **Unified functions Arguments and repsonses**: Ensures a consistent interface across different exchanges, simplifying the development process by standardizing how inputs and outputs are handled.


## Installation

```bash
npm install ninjaxt
```

## QuickStart

```javascript
import Ninjaxt from 'ninjaxt';

const binance = new Ninjaxt.Binance({
    apiKey: 'yourApiKey',
    apiSecret: 'yourApiSecret',
    reconnect: true,
    verbose: true,
    timeout: 1000,
});

async function main(){
    try{
        const recentTrades = await binance.recentTrades('BTC/USDT', 10);
        console.log(recentTrades);
    }catch(error){
        console.log(error);
    }
}
```

## Proxy Configuration

Proxy support allows NinjaXT to route all its WebSocket and REST communications through a specified proxy server.

#### Configuring Proxty after instance Creation

```javascript
const binance = new Ninjaxt.Binance({
    apiKey: 'yourApiKey',
    apiSecret: 'yourApiSecret',
    proxyUrl: 'yourProxyUrl'
});
```

[READ.ME] for more details please see **proxy.md**

## API Reference

[READ.ME] Please view **functions.md**

