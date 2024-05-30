# Functions && Types

## REST

**_[IMPORTANT]_** All the timestamps must be displayed in milliseconds.

### checkSystemStatus()

---->>>> args <<<<----

```typescript
function checkSystemStatus(): obj;
```

```javascript
const response = await binance.checkSystemStatus();
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    status: number;
    msg: string;
}
```

```json
{
    "status": 0,
    "msg": "normal"
}
```

### commissionRate()

---->>>> args <<<<----

```typescript
function commissionRate(symbol: string): obj;
```

```javascript
const response = await binance.commissionRate('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    maker: string;
    taker: string;
}
```

```json
{
    "symbol": "BTC/USDT",
    "maker": "0.00100000",
    "taker": "0.00100000"
}
```

### recentTrades()

---->>>> args <<<<----

```typescript
function recentTrades(symbol: string): Array[RESPONSE];
```

```javascript
const response = await binance.recentTrades('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    timestamp: number;
    price: string;
    qty: string;
    quoteQty: string;
    side: string;
}
```

```json
[
    {
        "price": "62393.29000000",
        "qty": "0.00024000",
        "quoteQty": "14.97438960",
        "side" : "SELL",
        "timestamp": 1714377335569
    },
    {
        "price": "62393.30000000",
        "qty": "0.01270000",
        "quoteQty": "792.39491000",
        "side" : "BUY",
        "timestamp": 1714377335699
    }
]
```

### balance()

---->>>> args <<<<----

```typescript
function balance(symbol: string): obj;
```

```javascript
const response = await binance.balance('USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    wallet: string;
    available: string;
    frozen: string;
}
```

```json
{
    "symbol": "USDT",
    "wallet": "23.0025",
    "available": "23.00250000",
    "frozen": "0.00000000"
}
```

or

```json
{}
```

**_[PLEASE READ]_** If the wallet balance is not greater than 0 or the wallet does not exist, it will return an empty object <br>
**_[PLEASE READ]_** frozen balance must be **_ a postive Number _**

### balances()

---->>>> args <<<<----

```typescript
function balances(): Array[RESPONSE];
```

```javascript
const response = await binance.balances();
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    wallet: string;
    available: string;
    frozen: string;
}
```

```json
[
    {
        "symbol": "USDT",
        "wallet": "23.0025",
        "available": "23.00250000",
        "frozen": "0.00000000"
    },
    {
        "symbol": "FUSD",
        "wallet": "0.00432",
        "available": "0.00432000",
        "frozen": "0.00000000"
    }
]
```

or

```JSON
[]
```

**_[PLEASE READ]_** If the wallet balance is not greater than 0 or the wallet does not exist, it will return an empty array <br>
**_[PLEASE READ]_** frozen balance must be **_ a postive Number _**

### orderBook()

---->>>> args <<<<----

```typescript
function orderBook(symbol: string): obj;
```

```javascript
const response = await binance.orderBook('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    asks: ordersArray[];
    available: ordersArray[];
    timestamp: number;
}
interface ordersArray {
    price: string;
    amount: string;
}
```

```json
{
    "symbol": "BTC/USDT",
    "asks": [{ "price": "62239.01000000", "amount": "4.94546000" }],
    "bids": [{ "price": "62239.00000000", "amount": "4.33222000" }],
    "timestamp": 1714378627534
}
```

### orderBooks()

---->>>> args <<<<----

```typescript
function orderBooks(symbols: string[]): Array[RESPONSE];
```

```javascript
const response = await binance.orderBook(['BTC/USDT', 'ETH/USDT']);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    bestBidPrice: string;
    bestBidQty: string;
    bestAskPrice: string;
    bestAskQty: string;
}
```

```json
[
    {
        "symbol": "BTC/USDT",
        "bestBidPrice": "62318.00000000",
        "bestBidQty": "0.55731000",
        "bestAskPrice": "62318.01000000",
        "bestAskQty": "9.78949000",
        "timestamp": 1714379144598
    },
    {
        "symbol": "ETH/USDT",
        "bestBidPrice": "3177.00000000",
        "bestBidQty": "11.05180000",
        "bestAskPrice": "3177.01000000",
        "bestAskQty": "53.25900000",
        "timestamp": 1714379144598
    }
]
```

**_[PLEASE READ]_** Args -> symbols must be an array

### ticker()

---->>>> args <<<<----

```typescript
function ticker(symbol: string): obj;
```

```javascript
const response = await binance.ticker('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}
```

```json
{
    "symbol": "BTC/USDT",
    "open": "63118.62000000",
    "high": "63367.05000000",
    "low": "61923.13000000",
    "close": "62369.57000000",
    "volume": "9633.08750000"
}
```

### tickers()

---->>>> args <<<<----

```typescript
function tickers(symbols: string[]): Array[RESPONSE];
```

```javascript
const response = await binance.ticker('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}
```

```json
[
    {
        "symbol": "BTC/USDT",
        "open": "63118.62000000",
        "high": "63367.05000000",
        "low": "61923.13000000",
        "close": "62284.47000000",
        "volume": "9663.32665000"
    },
    {
        "symbol": "ETH/USDT",
        "open": "3263.44000000",
        "high": "3286.95000000",
        "low": "3153.44000000",
        "close": "3170.06000000",
        "volume": "203771.50930000"
    }
]
```

**_[PLEASE READ]_** It will always return an array
**_[PLEASE READ]_** Args -> symbols must be an array

### price()

---->>>> args <<<<----

```typescript
function price(symbol: string): obj;
```

```javascript
const response = await binance.price('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    [key: string]: string;
}
```

```json
{ "BTC/USDT": "62300.31000000" }
```

### prices()

---->>>> args <<<<----

```typescript
function prices(symbols: string[]): Array[RESPONSE];
```

```javascript
const response = await binance.prices(['BTC/USDT', 'ETH/USDT']);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    [key: string]: string;
}
```

```json
[{ "BTC/USDT": "62349.73000000" }, { "ETH/USDT": "3172.18000000" }]
```

**_[PLEASE READ]_** Args -> symbols must be an array

### candles()

---->>>> args <<<<----

```typescript
function candles(symbol: string, timeframe: string, limit: number): Array[RESPONSE];
```

```javascript
const response = await binance.candles('BTC/USDT', '1m', 2);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    openTime: number;
    closeTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}
```

```json
[
    {
        "openTime": 1714379880000,
        "closeTime": 1714379939999,
        "open": "62328.21000000",
        "high": "62376.00000000",
        "low": "62328.21000000",
        "close": "62375.99000000",
        "volume": "13.40583000"
    },
    {
        "openTime": 1714379940000,
        "closeTime": 1714379999999,
        "open": "62376.00000000",
        "high": "62376.00000000",
        "low": "62368.00000000",
        "close": "62375.70000000",
        "volume": "3.98339000"
    }
]
```

### tradeHistory()

---->>>> args <<<<----

```typescript
function tradeHistory(symbol: string, limit: number): Array[RESPONSE];
```

```javascript
const response = await binance.tradeHistory('BTC/USDT', 2);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    timestamp: number;
    orderId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    price: string;
    qty: string;
    isMaker: 'true' | 'false';
    commission: string;
}
```

```json
[
    {
        "timestamp": 1708326648937,
        "orderId": "24968046306",
        "symbol": "BTC/USDT",
        "side": "BUY",
        "price": "52300.00000000",
        "qty": "0.00010000",
        "isMaker": "true",
        "commission": "0.00000010"
    },
    {
        "timestamp": 1708672925956,
        "orderId": "25058613963",
        "symbol": "BTC/USDT",
        "side": "SELL",
        "price": "51206.20000000",
        "qty": "0.00010000",
        "isMaker": "false",
        "commission": "0.00512062"
    }
]
```

### openOrders()

---->>>> args <<<<----

```typescript
function openOrders(symbol: string): Array[RESPONSE];
```

```javascript
const response = await binance.openOrders('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    timestamp: number;
    id: string;
    symbol: string;
    price: string;
    qty: string;
    executedQty: string;
    type: string;
    tif: string;
    side: string;
}
```

```json
[
    {
        "timestamp": 1714381526380,
        "id": "26887329109",
        "symbol": "BTC/USDT",
        "price": "55000.00000000",
        "qty": "0.00020000",
        "executedQty": "0.00000000",
        "type": "LIMIT",
        "tif": "GTC",
        "side": "BUY"
    },
    {
        "timestamp": 1714381537072,
        "id": "26887330595",
        "symbol": "BTC/USDT",
        "price": "55200.00000000",
        "qty": "0.00020000",
        "executedQty": "0.00000000",
        "type": "LIMIT",
        "tif": "GTC",
        "side": "BUY"
    }
]
```

**_[PLEASE READ]_** Returns an empty array if there is no open order
**_[PLEASE READ]_** The most recent order in the array should be at index **_ordersArry.length -1_**

### openOrders() --- Not Implemented

### fundingFee() --- Not Implemented

### fundingfees() --- Not Implemented

### futuresRecentTrades()

---->>>> args <<<<----

```typescript
function futuresRecentTrades(symbol: string): Array[RESPONSE];
```

```javascript
const response = await binance.futuresRecentTrades('BTC/USDT', 2);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    price: string;
    qty: string;
    quoteQty: string;
    side: string;
    timestamp: number;
}
```

```json
[
    {
        "price": "62335.40",
        "qty": "0.021",
        "quoteQty": "1309.04",
        "side" : "BUY",
        "timestamp": 1714381883719
    },
    {
        "price": "62335.40",
        "qty": "0.040",
        "quoteQty": "2493.41",
        "side" : "BUY",
        "timestamp": 1714381883834
    }
]
```

### futuresBalance()

---->>>> args <<<<----

```typescript
function futuresBalance(symbol: string): Array[RESPONSE];
```

```javascript
const response = await binance.futuresBalance('USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    price: string;
    qty: string;
    quoteQty: string;
    timestamp: number;
}
```

```json
[
    {
        "price": "62335.40",
        "qty": "0.021",
        "quoteQty": "1309.04",
        "timestamp": 1714381883719
    },
    {
        "price": "62335.40",
        "qty": "0.040",
        "quoteQty": "2493.41",
        "timestamp": 1714381883834
    }
]
```

**_[PLEASE READ]_** If the wallet balance is not greater than 0 or the wallet does not exist, it will return an empty object <br>
**_[PLEASE READ]_** frozen balance must be **_ a postive Number _**

### futuresBalances()

---->>>> args <<<<----

```typescript
function futuresBalances(): Array[RESPONSE];
```

```javascript
const response = await binance.futuresBalances();
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    wallet: string;
    available: string;
    frozen: string;
}
```

```json
[
    {
        "symbol": "USDT",
        "wallet": "43.45092964",
        "available": "48.44163446",
        "frozen": "4.99070482"
    },
    {
        "symbol": "USDC",
        "wallet": "5.00000000",
        "available": "48.43781865",
        "frozen": "43.43781865"
    }
]
```

or

```JSON
[]
```

**_[PLEASE READ]_** If the wallet balance is not greater than 0 or the wallet does not exist, it will return an empty array <br>
**_[PLEASE READ]_** frozen balance must be **_ a postive Number _**

### futuresExposure()

---->>>> args <<<<----

```typescript
function futuresExposure(symbol: string): Array[RESPONSE];
```

```javascript
const response = await binance.futuresExposure('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    qty: string;
    entryPrice: string;
    positionSide: 'LONG' | 'SHORT';
    leverage: string;
    notional: string;
    liquidPrice: string;
    marginType: 'cross' | 'isolated';
    unRealizedPnL: string;
}
```

```json
[
    {
        "symbol": "BTC/USDT",
        "qty": "0.002",
        "entryPrice": "62322.0",
        "positionSide": "LONG",
        "leverage": "4",
        "notional": "124.62778963",
        "liquidPrice": "38281.23274162",
        "marginType": "cross",
        "unRealizedPnL": "-0.01621036"
    }
]
```

or

```JSON
[]
```

**_[PLEASE READ]_** If there is no open position, it returns an empty array
**_[PLEASE READ]_** response - qty && notional - should be a negative number when the position is "SHORT"

### futuresExposures()

---->>>> args <<<<----

```typescript
function futuresExposures(): Array[RESPONSE];
```

```javascript
const response = await binance.futuresExposures();
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    qty: string;
    entryPrice: string;
    positionSide: 'LONG' | 'SHORT';
    leverage: string;
    notional: string;
    liquidPrice: string;
    marginType: 'cross' | 'isolated';
    unRealizedPnL: string;
}
```

```json
[
    {
        "symbol": "ETH/USDT",
        "qty": "-0.007",
        "entryPrice": "3172.27",
        "positionSide": "SHORT",
        "leverage": "5",
        "notional": "-22.20043000",
        "liquidPrice": "9962.04589201",
        "marginType": "cross",
        "unRealizedPnL": "0.00546000"
    },
    {
        "symbol": "BTC/USDT",
        "qty": "0.002",
        "entryPrice": "62322.0",
        "positionSide": "LONG",
        "leverage": "4",
        "notional": "124.57220965",
        "liquidPrice": "38328.26004988",
        "marginType": "cross",
        "unRealizedPnL": "-0.07179034"
    }
]
```

or

```JSON
[]
```

**_[PLEASE READ]_** If there is no open position, it returns an empty array
**_[PLEASE READ]_** response - qty && notional - should be a negative number when the position is "SHORT"

### futuresOrderBook()

---->>>> args <<<<----

```typescript
function orderBook(symbol: string): obj;
```

```javascript
const response = await binance.futuresOrderBook('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    asks: ordersArray[];
    available: ordersArray[];
    timestamp: number;
}
interface ordersArray {
    price: string;
    amount: string;
}
```

```json
{
    "symbol": "BTC/USDT",
    "asks": [
        { "price": "62293.30", "amount": "0.205" },
        { "price": "62293.50", "amount": "0.045" },
        { "price": "62294.00", "amount": "0.002" },
        { "price": "62295.50", "amount": "0.589" },
        { "price": "62295.60", "amount": "0.586" }
    ],
    "bids": [
        { "price": "62293.20", "amount": "15.988" },
        { "price": "62293.10", "amount": "0.002" },
        { "price": "62292.70", "amount": "0.036" },
        { "price": "62292.50", "amount": "0.966" },
        { "price": "62292.40", "amount": "0.005" }
    ],
    "timestamp": 1714383915279
}
```

### futuresOrderBooks()

---->>>> args <<<<----

```typescript
function futuresOrderBooks(symbols: string[]): Array[RESPONSE];
```

```javascript
const response = await binance.futuresOrderBooks(['BTC/USDT', 'ETH/USDT']);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    bestBidPrice: string;
    bestBidQty: string;
    bestAskPrice: string;
    bestAskQty: string;
}
```

```json
[
    {
        "symbol": "BTC/USDT",
        "bestBidPrice": "62479.60",
        "bestBidQty": "2.067",
        "bestAskPrice": "62479.70",
        "bestAskQty": "5.553",
        "timestamp": 1714384869328
    },
    {
        "symbol": "ETH/USDT",
        "bestBidPrice": "3174.39",
        "bestBidQty": "108.371",
        "bestAskPrice": "3174.40",
        "bestAskQty": "1.247",
        "timestamp": 1714384869137
    }
]
```

**_[PLEASE READ]_** Args -> symbols must be an array

### futuresTicker()

---->>>> args <<<<----

```typescript
function futuresTicker(symbol: string): obj;
```

```javascript
const response = await binance.futuresTicker('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}
```

```json
{
    "symbol": "BTC/USDT",
    "open": "63755.00",
    "high": "63973.90",
    "low": "61888.00",
    "close": "62537.10",
    "volume": "160743.444"
}
```

### futuresTickers()

---->>>> args <<<<----

```typescript
function futuresTickers(symbols: string[]): Array[RESPONSE];
```

```javascript
const response = await binance.futuresTickers('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}
```

```json
[
    {
        "symbol": "BTC/USDT",
        "open": "63727.90",
        "high": "63973.90",
        "low": "61888.00",
        "close": "62500.90",
        "volume": "160973.934"
    },
    {
        "symbol": "ETH/USDT",
        "open": "3305.29",
        "high": "3365.69",
        "low": "3150.00",
        "close": "3181.80",
        "volume": "2561519.380"
    }
]
```

**_[PLEASE READ]_** Args -> symbols must be an array

### futuresPrice()

---->>>> args <<<<----

```typescript
function futuresPrice(symbol: string): obj;
```

```javascript
const response = await binance.futuresPrice('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    [key: string]: string;
}
```

```json
{ "BTC/USDT": "62518.70" }
```

### futuresPrices()

---->>>> args <<<<----

```typescript
function futuresPrices(symbols: string[]): Array[RESPONSE];
```

```javascript
const response = await binance.futuresPrices(['BTC/USDT', 'ETH/USDT']);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    [key: string]: string;
}
```

```json
[{ "BTC/USDT": "62349.7" }, { "ETH/USDT": "3172.18" }]
```

### futuresCandles()

---->>>> args <<<<----

```typescript
function futuresCandles(symbol: string, timeframe: string, limit: number): Array[RESPONSE];
```

```javascript
const response = await binance.futuresCandles('BTC/USDT', '1m', 1);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    openTime: number;
    closeTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}
```

```json
[
    {
        "openTime": 1714385400000,
        "closeTime": 1714385436048,
        "open": "62503",
        "high": "62510.7",
        "low": "62503",
        "close": "62506",
        "volume": "0.06"
    }
]
```

### futuresTradeHistory()

---->>>> args <<<<----

```typescript
function futuresTradeHistory(symbol: string, limit: number): Array[RESPONSE];
```

```javascript
const response = await binance.futuresTradeHistory('BTC/USDT', 2);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    timestamp: number;
    orderId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    price: string;
    qty: string;
    isMaker: 'true' | 'false';
    commission: string;
}
```

```json
[
    {
        "timestamp": 1714384048318,
        "orderId": "323728093247",
        "symbol": "BTC/USDT",
        "side": "BUY",
        "price": "62317.40",
        "qty": "0.002",
        "isMaker": "false",
        "commission": "0.06231740",
        "realizedPnl": "-0.00920000"
    }
]
```

### futuresOpenOrders()

---->>>> args <<<<----

```typescript
function futuresOpenOrders(symbol: string): Array[RESPONSE];
```

```javascript
const response = await binance.futuresOpenOrders('BTC/USDT');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    timestamp: number;
    id: string;
    symbol: string;
    price: string;
    qty: string;
    type: string;
    tif: string;
    side: string;
    executedQty: string;
    reduceOnly: boolean;
    closePosition: boolean;
}
```

```json
[
    {
        "timestamp": 1714412496000,
        "id": "F17144448958056294",
        "symbol": "BTC/USDT",
        "price": "50000",
        "qty": "0.001",
        "type": "LIMIT",
        "tif": "GTC",
        "side": "BUY",
        "executedQty": "0",
        "reduceOnly": false,
        "closePosition": false
    },
    {
        "timestamp": 1714412501000,
        "id": "F17144449014196413",
        "symbol": "BTC/USDT",
        "price": "52000",
        "qty": "0.001",
        "type": "LIMIT",
        "tif": "GTC",
        "side": "BUY",
        "executedQty": "0",
        "reduceOnly": false,
        "closePosition": false
    }
]
```

**_[PLEASE READ]_** If there is no open position, it returns an empty array
**_[PLEASE READ]_** The most recent order in the array should be at index **_ordersArry.length -1_**

### futuresOpenOrdersHistory() --- Not Implemented

### setLeverage()

---->>>> args <<<<----

```typescript
function setLeverage(symbol: string, leverage: number): obj;
```

```javascript
const response = await binance.setLeverage('BTC/USDT', 1);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    leverage: number;
}
```

```json
{ "symbol": "BTC/USDT", "leverage": 1 }
```

### setLeverage()

---->>>> args <<<<----

```typescript
function setLeverage(symbol: string, leverage: number): obj;
```

```javascript
const response = await binance.setLeverage('BTC/USDT', 1);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    leverage: number;
}
```

```json
{ "symbol": "BTC/USDT", "leverage": 1 }
```

### setPositionMode()

---->>>> args <<<<----

```typescript
function setPositionMode(mode: string): obj;
```

Input -> mode : "ONEWAY" || "HEDGE"

```javascript
const response = await binance.setPositionMode('BTC/USDT', 1);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    code: string;
    msg: number;
}
```

```json
{ "code": 200, "msg": "success" }
```

### setLeverage()

---->>>> args <<<<----

```typescript
function setLeverage(symbol: string, leverage: number): obj;
```

```javascript
const response = await binance.setLeverage('BTC/USDT', 1);
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    symbol: string;
    leverage: number;
}
```

```json
{ "symbol": "BTC/USDT", "leverage": 1 }
```

### setMarginMode()

---->>>> args <<<<----

```typescript
function setMarginMode(symbol: string, mode: string): obj;
```

Input -> mode : "ISOLATED" || "CROSSED"

```javascript
const response = await binance.setMarginMode('BTC/USDT', 'CROSSED');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    code: string;
    msg: number;
}
```

```json
{ "code": 200, "msg": "success" }
```

### setMarginMode()

---->>>> args <<<<----

```typescript
function setMarginMode(symbol: string, mode: string): obj;
```

Input -> mode : "ISOLATED" || "CROSSED"

```javascript
const response = await binance.setMarginMode('BTC/USDT', 'CROSSED');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    code: string;
    msg: number;
}
```

```json
{ "code": 200, "msg": "success" }
```

### order()

---->>>> args <<<<----

```typescript
function LimitOrder(symbol: string, side: string, qty: number, price: number, parmas = {}): Params {}
function marketOrder(symbol: string, side: string, qty: number);
function stopLimitOrder();
function stopMarketorder();
function trailingLimitOrder();
function trailingMarketOrder();
```

Params Types:

```typescript
interface Params {
    tif: string;
    type: string;
    triggerPrice: number;
    deltaPercent: number;
}
```

```javascript
const response = await binance.limitOrder('BTC/USDT', 'BUY', 0.0001, 55000, { tif: 'GTC' });
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    timestamp: number;
    id: string;
    symbol: string;
    price: string;
    qty: string;
    type: string;
    tif: string;
    side: string;
}
```

```json
{
    "timestamp": 1714452490166,
    "id": "26905180183",
    "symbol": "BTC/USDT",
    "price": "55000.00000000",
    "qty": "0.00020000",
    "type": "LIMIT",
    "tif": "GTC",
    "side": "BUY"
}
```

### futuresOrder()

---->>>> args <<<<----

```typescript
function futuresLimitOrder(symbol: string, side: string, qty: number, price: number, parmas = {}): Params {}
function futuresMarketOrder(symbol: string, side: string, qty: number);
function futuresStopLimitOrder();
function futuresStopMarketorder();
function futuresTrailingLimitOrder();
function futuresTrailingMarketOrder();
```

Params Types:

```typescript
interface Params {
    tif: string;
    type: string;
    triggerType: string;
    triggerPrice: number;
    deltaPercent: number;
    goodTillDate: number;
    reduceOnly: boolean;
    closePosition: boolean;
}
```

```javascript
const response = await binance.fuutresLimitOrder('BTC/USDT', 'BUY', 0.0001, 55000, { tif: 'GTC' });
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    timestamp: number;
    id: string;
    symbol: string;
    price: string;
    qty: string;
    type: string;
    tif: string;
    side: string;
    reduceOnly: boolean;
    closePosition: boolean;
}
```

```json
{
    "timestamp": 1714452864998,
    "id": "F17144528650896492",
    "symbol": "BTC/USDT",
    "price": "55000",
    "qty": "0.002",
    "type": "1",
    "tif": "GTC",
    "side": "BUY",
    "reduceOnly": false,
    "closePosition": false
}
```

### cancelOrder()

---->>>> args <<<<----

```typescript
function cancelOrder(symbol: string, orderId: string): obj;
```

```javascript
const response = await binance.cancelOrder('BTC/USDT', 'C171445455349417');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    id: string;
    status: string;
}
```

```json
{ "id": "C171445455349417", "status": "cancelled" }
```

### futuresCancelOrder()

---->>>> args <<<<----

```typescript
function futuresCancelOrder(symbol: string, orderId: string): obj;
```

```javascript
const response = await binance.futuresCancelOrder('BTC/USDT', 'C171445455349417');
console.log(response);
```

---->>>> results <<<<----

```typescript
interface RESPONSE {
    id: string;
    status: string;
}
```

```json
{ "id": "C171445455349417", "status": "cancelled" }
```

## WEBSOCKET

### tradeStream()

---->>>> args <<<<----

```typescript
function tradeStream(symbol: string): obj;
```

```javascript
const socket = await binance.tradeStream('BTC/USDT');
socket.on('message' (data) => {console.log(data)});
```

---->>>> results <<<<----

```typescript
interface PAYLOAD {
    symbol: string;
    price: string;
    qty: string;
    timestamp: number;
    side: string;
}
```

```json
{
    "symbol": "BTC/USDT",
    "price": "63090.00000000",
    "qty": "0.00009000",
    "side" : "BUY",
    "timestamp": 1714455705837
}
```

### candleStream()

---->>>> args <<<<----

```typescript
function candleStream(symbol: string): obj;
```

```javascript
const socket = await binance.candleStream('BTC/USDT' , '1m');
socket.on('message' (data) => {console.log(data)});
```

---->>>> results <<<<----

```typescript
interface PAYLOAD {
    openTime: number;
    closeTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}
```

```json
{
    "openTime": 1714456260000,
    "closeTime": 1714456319999,
    "open": "63262.00000000",
    "high": "63262.00000000",
    "low": "63236.00000000",
    "close": "63236.01000000",
    "volume": "4.83726000"
}
```
