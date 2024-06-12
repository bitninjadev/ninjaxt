const { BaseExchange } = require('./base/Exchange.js');
const { Rejected, Unavailable, EmptyParameters, InvalidOrder, DataLost, ExchangeError } = require('./base/errors.js');
const { Precise } = require('./base/functions/Precise.js');

class Bitmusa extends BaseExchange {
    has() {
        return this.deepExtend(super.has(), {
            features: {
                ws: true,
                publicAPI: true,
                privateAPI: true,
                spot: undefined,
                futures: undefined,
                //  --- spot trading --- //
                limitOrder: true,
                marketOrder: true,
                stopLimitOrder: false,
                stopMarketOrder: false,
                trailingLimitOrder: false,
                trailingMarketOrder: false,
                cancelOrder: true,
                cancelAllOrders: false,
                // --- spot wallet && market --- //
                recentTrades: undefined,
                balance: undefined,
                balances: undefined,
                orderBook: undefined,
                orderBooks: undefined,
                ticker: undefined,
                tickers: undefined,
                price: undefined,
                prices: undefined,
                candles: undefined,
                openOrders: undefined,
                tradeHistory: undefined,
                openOrderHistory: undefined,
                // --- futures trading --- //
                futuresLimitOrder: true,
                futuresMarketOrder: true,
                futuresStopLimitOrder: undefined,
                futuresStopMarketOrder: undefined,
                futuresTrailingLimitOrder: undefined,
                futuresTrailingMarketOrder: undefined,
                futuresCancelOrder: true,
                futuresCancelAllOrders: undefined,
                futuresCloseAll: undefined,
                // --- futures wallet && market --- //
                fundingFee: undefined,
                fundingFees: undefined,
                futuresRecentTrades: undefined,
                futuresBalance: undefined,
                futuresBalances: undefined,
                futuresExposure: undefined,
                futuresExposures: undefined,
                futuresOrderBook: undefined,
                futuresOrderBooks: undefined,
                futuresTicker: undefined,
                futuresTickers: undefined,
                futuresPrice: undefined,
                futuresPrices: undefined,
                futuresCandles: undefined,
                futuresTradeHistory: undefined,
                futuresOpenOrders: undefined,
                futuresOpenOrdersHistory: undefined,
                setLeverage: undefined,
                setPositionMode: undefined,
                setMarginMode: undefined,
                // --- websocket spot --- //
                tradeStream: undefined,
                candleStream: undefined,
                orderBookStream: undefined,
                balanceStream: undefined,
                orderStream: undefined,
                orderUpdateStream: undefined,
                executionStream: undefined,
                // --- websocket futures --- //
                futuresTradeStream: undefined,
                futuresCandleStream: undefined,
                futuresOrderBookStream: undefined,
                futuresBalanceStream: undefined,
                futuresPositionStream: undefined,
                futuresOrderStream: undefined,
                futuresOrderUpdateStream: undefined,
                futuresExecutionStream: undefined,
            },
            urls: {
                base: {
                    V0: 'https://openapi.bitmusa.com/',
                    ssV0: '',
                    sfV0: '',
                },
                sandbox: {},
            },
            endpoints: {
                public: {
                    get: {
                        'api/health': { versions: ['V0'], cost: null },
                    },
                    post: {},
                    put: {},
                    delete: {},
                },
                private: {
                    get: {
                        'api/v1/spot/market/exchange-info': { versions: ['V0'], cost: null },
                        'api/v1/spot/wallet': { versions: ['V0'], cost: null },
                        'api/v1/spot/market': { versions: ['V0'], cost: null },
                        'api/v1/spot/market/orderbook': { versions: ['V0'], cost: null },
                        'api/v1/spot/market/trade': { versions: ['V0'], cost: null },
                        'api/v1/spot/order/history': { versions: ['V0'], cost: null },
                        'api/v1/spot/trade/history': { versions: ['V0'], cost: null },
                        'api/v1/spot/market/kline/current': { versions: ['V0'], cost: null },
                        'api/v1/spot/market/kline': { versions: ['V0'], cost: null },
                        'api/v1/spot/order': { versions: ['V0'], cost: null },
                        // futures
                        'api/v2/future/market/exchange-info': { versions: ['V0'], cost: null },
                        'api/v2/future/market': { versions: ['V0'], cost: null },
                        'api/v2/future/market/trade': { versions: ['V0'], cost: null },
                        'api/v2/future/wallet': { versions: ['V0'], cost: null },
                        'api/v2/future/wallet/noposition': { versions: ['V0'], cost: null },
                        'api/v2/future/market/orderbook': { versions: ['V0'], cost: null },
                        'api/v2/future/position': { versions: ['V0'], cost: null },
                        'api/v2/future/leverage': { versions: ['V0'], cost: null },
                        'api/v2/future/position/mode': { versions: ['V0'], cost: null },
                        'api/v2/future/order': { versions: ['V0'], cost: null },
                        'api/v2/future/market/kline/current': { versions: ['V0'], cost: null },
                        'api/v2/future/market/kline': { versions: ['V0'], cost: null },
                        'api/v2/future/trade/history': { versions: ['V0'], cost: null },
                    },
                    post: {
                        'api/v1/spot/order': { versions: ['V0'], cost: null },
                        'api/v1/spot/order/cancel': { versions: ['V0'], cost: null },
                        'api/v1/spot/order/cancel/all': { versions: ['V0'], cost: null },
                        'api/v1/spot/userDataStream': { versions: ['V0'], cost: null },
                        // futures
                        'api/v2/future/position/close/all': { versions: ['V0'], cost: null },
                        'api/v2/future/leverage': { versions: ['V0'], cost: null },
                        'api/v2/future/position/mode': { versions: ['V0'], cost: null },
                        'api/v2/future/leverage/hedge': { versions: ['V0'], cost: null },
                        'api/v2/future/order': { versions: ['V0'], cost: null },
                        'api/v2/future/order/cancel/all': { versions: ['V0'], cost: null },
                        'api/v2/future/order/cancel': { versions: ['V0'], cost: null },
                        'api/v2/future/userDataStream': { versions: ['V0'], cost: null },
                    },
                    put: {
                        'api/v1/spot/userDataStream': { versions: ['V0'], cost: null },
                        'api/v2/future/userDataStream': { versions: ['V0'], cost: null },
                    },
                    delete: {
                        'api/v1/spot/userDataStream': { versions: ['V0'], cost: null },
                        'api/v2/future/userDataStream': { versions: ['V0'], cost: null },
                    },
                },
            },
            ws: {
                public: {
                    candle: { base: ['ssV0'], weight: 1 },
                    orderBook: { base: ['ssV0'], weight: 1 },
                    futuresCandle: { base: ['sfV0'], weight: 1 },
                    futuresOrderBook: { base: ['sfV0'], weight: 1 },
                },
                private: {
                    balance: { base: ['ssV0'], weight: 1 },
                    orderUpdate: { base: ['ssV0'], weight: 1 },
                    futuresBalance: { base: ['sfV0'], weight: 1 },
                    futuresOrderUpdate: { base: ['sfV0'], weight: 1 },
                    futuresExposure: { base: ['sfV0'], weight: 1 },
                },
            },
            timeframes: {
                spot: {
                    '1m': '1min',
                    '3m': '3min',
                    '5m': '5min',
                    '15m': '15min',
                    '30m': '30min',
                    '1h': '1H',
                    '2h': '2H',
                    '4h': '4H',
                    '6h': '6H',
                    '8h': '8H',
                    '12h': '12H',
                    '1d': '1D',
                    '1w': '1W',
                    '1M': '1M',
                },
                futures: {
                    '1m': '1min',
                    '3m': '3min',
                    '5m': '5min',
                    '15m': '15min',
                    '30m': '30min',
                    '1h': '1H',
                    '2h': '2H',
                    '4h': '4H',
                    '6h': '6H',
                    '8h': '8H',
                    '12h': '12H',
                    '1d': '1D',
                    '1w': '1W',
                    '1M': '1M',
                }
            },
            listenKeys: {
                spot: undefined,
                futures: undefined,
            },
        });
    }
    sign(url, method = 'GET', body = undefined, isPrivate = false) {
        method = method.toUpperCase();
        let headers = {};
        let queryString = '';

        headers['Content-Type'] = 'application/json';
        if (isPrivate) {
            headers['Authorization'] = `Bearer ${this.apiSecret}`;
            headers['x-api-key'] = this.apiKey;
        }

        if (method === 'GET' && body) {
            queryString = Object.entries(body)
                .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
                .join('&');
            url += '?' + queryString;
            body = undefined;
        }
        if (method === 'POST' && this.hasProp(body, ['orderId'])) {
            queryString = Object.entries(body)
                .map(([key, val]) => `${encodeURIComponent(val)}`)
                .join('/');
            url += '/' + queryString;
            body = undefined;
        }
        const parameters = {
            url: url,
            method: method,
            headers: headers,
            body: body,
        };
        return parameters;
    }
    handleErrors(statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        if (statusCode === 200) {
            if (responseBody.code !== 0) {
                throw new ExchangeError(this.exchange + ' ' + url + ' ' + JSON.stringify(responseBody));
            }
        }
    }
    handleResponse(response) {
        const data = this.safeValue(response.data, 'data', {});
        if (this.isArray(data)) {
            return data;
        }
        if (Object.keys(data).length !== 0) {
            return data;
        }

        return response.data;
    }
    parseMarkets(exchangeInfo) {
        // SPOT
        // [
        //     {
        //         "symbol": "BTC/USDT",
        //         "baseCoin": "BTC",
        //         "quoteCoin": "USDT",
        //         "fee": "0.0015",
        //         "baseCoinScale": 2,
        //         "quoteCoinPrecision": 5,
        //         "maxBuyOrderPrice": "0.0",
        //         "minSellOrderPrice": "0.0",
        //         "maxOpenOrder": 200,
        //         "maxBaseCoinQty": "0.0",
        //         "minBaseCoinQty": "1.0E-5",
        //         "minQuoteCoinQty": "10.0",
        //         "enableMarketSell": true,
        //         "enableMarketBuy": true,
        //         "enableSell": true,
        //         "enableBuy": true,
        //         "enable": true
        //     },
        // ]
        // FUTURES
        // [
        //     {
        //         "ticker": "BTCUSDT",
        //         "baseCoin": "BTC",
        //         "quoteCoin": "USDT",
        //         "takerFee": "0.03",
        //         "makerFee": "0.02",
        //         "baseCoinPrecision": 1,
        //         "quoteCoinPrecision": 3,
        //         "minOrderPrice": "0.1",
        //         "maxOrderPrice": "1000000.0",
        //         "maxOpenOrder": 5000,
        //         "maxBaseCoinQty": "2000000.0",
        //         "minBaseCoinQty": "10.0",
        //         "maxQuoteCoinQty": "1000.0",
        //         "minQuoteCoinQty": "0.001",
        //         "enableLimitBuy": true,
        //         "enableLimitSell": true,
        //         "enableMarketSell": true,
        //         "enableMarketBuy": true,
        //         "enable": true
        //     },
        // ]
        for (let i = 0; i < exchangeInfo.length; i++) {
            const item = exchangeInfo[i];
            const id = this.define(item, ['symbol', 'ticker']);
            const baseAsset = this.safeStringUpper(item, 'baseCoin');
            const quoteAsset = this.safeStringUpper(item, 'quoteCoin');
            const socketId = baseAsset + quoteAsset;
            const assetType = this.hasProp(item, ['fee']) ? 'spot' : 'futures';
            const pricePrecision = String(this.define(item, ['baseCoinScale', 'baseCoinPrecision']));
            const amountPrecision = this.safeString(item, 'quoteCoinPrecision');
            let minBaseLotSize = this.convertSciToNormal(this.safeString(item, 'minBaseCoinQty'));
            let maxBaseLotSize = this.convertSciToNormal(this.safeString(item, 'maxBaseCoinQty'));
            if (!Precise.stringGt(maxBaseLotSize, '0')) {
                maxBaseLotSize = null;
            }
            let minQuoteLotSize = this.convertSciToNormal(this.safeString(item, 'minQuoteCoinQty'));
            let maxQuoteLotSize = this.safeString(item, 'maxQuoteCoinQty', null);
            const input = `${baseAsset}/${quoteAsset}`;
            if (!this.markets[assetType]) {
                this.markets[assetType] = {};
            }
            if (!this.markets['parsed']) {
                this.markets['parsed'] = {};
            }
            if (!this.markets['parsed'][assetType]) {
                this.markets['parsed'][assetType] = {};
            }
            const obj = {
                id: id,
                symbol: input,
                socketId: socketId,
                base: baseAsset,
                quote: quoteAsset,
                pricePrecision: pricePrecision,
                amountPrecision: amountPrecision,
                minBaseLotSize: minBaseLotSize,
                maxBaseLotSize: maxBaseLotSize,
                minQuoteLotSize: minQuoteLotSize,
                maxQuoteLotSize: maxQuoteLotSize,
            }
            this.markets[assetType][input] = obj;
            this.markets['parsed'][assetType][id] = obj;
        }
    }
    async loadMarkets() {
        if (Object.keys(this.instruments).length > 0) return; // already loaded
        const promisesAry = [];
        promisesAry.push(this.getApiV1SpotMarketExchangeInfo());
        promisesAry.push(this.getApiV2FutureMarketExchangeInfo());
        const promises = await Promise.all(promisesAry);
        for (let i = 0; i < promises.length; i++) {
            const response = promises[i];
            const data = this.handleResponse(response);
            if (data) {
                this.parseMarkets(data);
            }
        }
    }
    parseSystemStatus(data) {
        if (data === 'OK') {
            return { status: 0, msg: 'normal' };
        } else {
            return { status: 1, msg: 'system_maintenance' };
        }
    }
    parseTrade(trades) {
        // SPOT
        // {
        //     id: '182731490',
        //     symbol: 'BTC/USDT',
        //     price: 70619.73,
        //     amount: 0.00002,
        //     buyTurnover: 1.4123946,
        //     sellTurnover: 1.4123946,
        //     direction: 'SELL',
        //     buyOrderId: 'W171282968207054',
        //     sellOrderId: 'T171282968210655',
        //     buyOrder: {
        //       orderId: 'W171282968207054',
        //       memberId: 84526,
        //       symbol: 'BTC/USDT',
        //       coinSymbol: 'BTC',
        //       baseSymbol: 'USDT',
        //       status: 'COMPLETED',
        //       direction: 'BUY',
        //       type: 'LIMIT_PRICE',
        //       price: 70619.73,
        //       amountSymbol: 'BTC',
        //       amountType: 'COIN',
        //       amount: 0.00002,
        //       tradedAmount: 0.00002,
        //       turnover: 1.4123946,
        //       time: 1712829682070,
        //       completedTime: 1712829682123,
        //       canceledTime: null,
        //       useDiscount: '0',
        //       orderResource: 'CUSTOMER',
        //       detail: null,
        //       completed: true
        //     },
        //     sellOrder: {
        //       orderId: 'T171282968210655',
        //       memberId: 84526,
        //       symbol: 'BTC/USDT',
        //       coinSymbol: 'BTC',
        //       baseSymbol: 'USDT',
        //       status: 'COMPLETED',
        //       direction: 'SELL',
        //       type: 'LIMIT_PRICE',
        //       price: 70619.73,
        //       amountSymbol: 'BTC',
        //       amountType: 'COIN',
        //       amount: 0.00002,
        //       tradedAmount: 0.00002,
        //       turnover: 1.4123946,
        //       time: 1712829682106,
        //       completedTime: 1712829682125,
        //       canceledTime: null,
        //       useDiscount: '0',
        //       orderResource: 'CUSTOMER',
        //       detail: null,
        //       completed: true
        //     },
        //     time: 1712829682123,
        //     timeString: '2024-04-11 10:01:22'
        //   },
        // FUTURES
        // {
        //     "ticker": "TBTCTUSDT",
        //     "price": "26059.2000000000000000",
        //     "qty": "0.4600000000000000",
        //     "value": "11987.2320000000000000",
        //     "position": 1,
        //     "traded_time": 1686697378264
        // },
        if (this.isObject(trades)) {
            let side = this.define(trades, ['direction', 'position']);
            if (side === 0) side = 'BUY'
            else if (side === 1) side = 'SELL'
            return this.safeTrade({
                price: this.define(trades, ['price']),
                qty: this.define(trades, ['amount', 'qty']),
                quoteQty: this.define(trades, ['buyTurnover', 'sellTurnover', 'value']),
                timestamp: this.define(trades, ['time', 'traded_time']),
                side: side
            });
        } else if (this.isArray(trades)) {
            return trades.map(t => this.parseTrade(t));
        }
    }
    parseBalance(balance) {
        // SPOT
        // [
        //   {
        //     id: 66692,
        //     memberId: 78246,
        //     coin: {
        //       name: 'JUST',
        //       nameCn: 'JUST',
        //       unit: 'JST',
        //       status: 0,
        //       minTxFee: 50,
        //       maxTxFee: 50,
        //       cnyRate: 0,
        //       usdRate: 0.04297,
        //       enableRpc: 0,
        //       sort: 5,
        //       canSend: 1,
        //       canWithdraw: 0,
        //       canRecharge: 0,
        //       canTransfer: 0,
        //       canAutoWithdraw: 0,
        //       withdrawScale: 8,
        //       withdrawThreshold: 1,
        //       minWithdrawAmount: 100,
        //       maxWithdrawAmount: 10000,
        //       minRechargeAmount: 1e-8,
        //       isPlatformCoin: 1,
        //       isToken: 1,
        //       hasLegal: false,
        //       allBalance: null,
        //       coldWalletAddress: '',
        //       hotAllBalance: null,
        //       blockHeight: null,
        //       minerFee: null,
        //       infolink: '',
        //       information: 'JST',
        //       accountType: 0,
        //       depositAddress: 'TCht7FVg72wGnHaxMuZJS3MdgAt9gxektM',
        //       memoAdjust: null,
        //       scanTxidWeburl: null,
        //       scanAddressWeburl: null,
        //       visible: 1,
        //       testMode: 0,
        //       networkCoins: null,
        //       icon: 'https://static.bitmusa.com/image/coin/JST.svg',
        //       defaultIcon: 'https://static.bitmusa.com/image/coin/default.svg',
        //       spotTradable: null
        //     },
        //     balance: 252.5,
        //     frozenBalance: 0,
        //     lockedBalance: 0,
        //     address: 'TNjPG8UCdNdX3ZhEMEUxGjCc7G6eaSPyfX',
        //     version: 0,
        //     isLock: false
        //   },
        //   ...
        // ]
        // FUUTRES
        // [
        //     {
        //       total_margin_balance: 93664932.74348629,
        //       symbol: 'USDT',
        //       total_wallet_balance: 93664932.74348629,
        //       total_unpnl: 0,
        //       total_multiasset_balance: 0,
        //       position: [],
        //       total_available_balance: 45409.99564381
        //     },
        //     {
        //       total_margin_balance: 9999867.86137291,
        //       symbol: 'MUSA',
        //       total_wallet_balance: 9999867.86137291,
        //       total_unpnl: 0,
        //       total_multiasset_balance: 0,
        //       position: [],
        //       total_available_balance: 9939630.02091515
        //     }
        // ]
        if (balance.coin) balance.symbol = balance.coin.unit;
        if (this.isObject(balance)) {
            return this.safeBalance({
                symbol: this.define(balance, ['symbol']),
                wallet: this.define(balance, ['total_wallet_balance']),
                available: this.define(balance, ['balance', 'total_available_balance']),
                frozen: this.define(balance, ['frozenBalance']),
            });
        } else if (this.isArray(balance)) {
            return balance.map(b => this.parseBalance(b));
        }
    }
    parseOrderBook(orderBook, symbol, limit) {
        // SPOT
        // {
        //     ask: {
        //       direction: 'SELL',
        //       maxAmount: 0.001,
        //       minAmount: 0.00004,
        //       highestPrice: 79526.02,
        //       lowestPrice: 69472.01,
        //       symbol: 'BTC/USDT',
        //       items: [
        //          { price: 69472.01, amount: 0.00016 },
        //          { price: 69485.96, amount: 0.00017 },
        //          { price: 69487.26, amount: 0.00008 },
        //          { price: 69487.71, amount: 0.00011 },
        //          { price: 69492.11, amount: 0.00005 },
        //          { price: 69496.09, amount: 0.00008 },
        //       ]
        //     },
        //     bid: {
        //       direction: 'BUY',
        //       maxAmount: 0.0006,
        //       minAmount: 0.00004,
        //       highestPrice: 69467.06,
        //       lowestPrice: 62852,
        //       symbol: 'BTC/USDT',
        //       items: [
        //          { price: 69467.06, amount: 0.00012 },
        //          { price: 69430.93, amount: 0.00025 },
        //          { price: 69430.59, amount: 0.0001 },
        //          { price: 69423.73, amount: 0.0001 },
        //          { price: 69422.45, amount: 0.00011 },
        //       ]
        //     }
        //   }
        // FUTURES
        // {
        //     sell: [
        //       {
        //         amount: '7000.000',
        //         mode: 'add',
        //         payload: 'None',
        //         pk: 'None',
        //         position: '1',
        //         price: '70000.0',
        //         qty: '0.100',
        //         scale: '0.1000000000000000',
        //         ticker: 'BTCUSDT',
        //         total: '7000.000',
        //         total_qty: '0.100',
        //         update_time: '1712143119901'
        //       },
        //       ...
        //     ],
        //     buy: [
        //       {
        //         amount: '6639.300',
        //         mode: 'add',
        //         payload: 'None',
        //         pk: 'None',
        //         position: '0',
        //         price: '66393.0',
        //         qty: '0.100',
        //         scale: '0.1000000000000000',
        //         ticker: 'BTCUSDT',
        //         total: '6639.300',
        //         total_qty: '0.100',
        //         update_time: '1712143101457'
        //       },
        //       ...    
        //     ]
        //   }
        const timestamp = Date.now();
        let asks, bids;
        if (orderBook.ask && orderBook.bid) {
            asks = orderBook.ask.items.map(ask => [this.safeString(ask, 'price'), this.safeString(ask, 'amount')]);
            bids = orderBook.bid.items.map(bid => [this.safeString(bid, 'price'), this.safeString(bid, 'amount')]);
        }
        else if (orderBook.sell && orderBook.buy) {
            asks = orderBook.sell.map(sell => [this.safeString(sell, 'price'), this.safeString(sell, 'qty')]);
            bids = orderBook.buy.map(buy => [this.safeString(buy, 'price'), this.safeString(buy, 'qty')]);
        } else {
            throw new Error('Unknown order book format');
        }
        return this.safeOrderBook(
            { asks, bids },
            symbol,
            timestamp,
            limit,
        );
    }
    parseTicker(ticker, params = {}) {
        // SPOT
        // {
        //     symbol: 'BTC/USDT',
        //     open: 69472.01,
        //     high: 69487.26,
        //     low: 69472.01,
        //     close: 69487.26,
        //     chg: 0.0003,
        //     change: 15.25,
        //     volume: 0.0004,
        //     turnover: 6924751.0335169,
        //     lastDayClose: 69472.01,
        //     usdRate: 69487.26,
        //     baseUsdRate: 1,
        //     zone: 0,
        //     baseCoinScale: 2
        // },
        // FUTURES
        // {
        //     ticker: 'BTCUSDT',
        //     base_price: 65968,
        //     high_price: 69999.6,
        //     low_price: 65180.8,
        //     last_price: 65525.1,
        //     mark_price: 65533.67071906,
        //     index_price: 65525.349,
        //     funding_fee_rate: 0.0012,
        //     funding_time: 1712138400000,
        //     remaining_funding_time: 380653,
        //     change_price: -4122.8,
        //     change_rate: -5.9195,
        //     total_qty: 1923.96,
        //     total_value: 127061896.2466,
        //     last_updated_time: 1712206419347
        // }
        if (this.isObject(ticker)) {
            const assetType = this.define(ticker, ['symbol']) ? 'spot' : 'futures';
            return this.safeTicker({
                symbol: this.safeSymbols(this.define(ticker, ['symbol', 'ticker']), assetType, false, true),
                open: this.define(ticker, ['open', 'base_price']),
                high: this.define(ticker, ['high', 'high_price']),
                low: this.define(ticker, ['low', 'low_price']),
                close: this.define(ticker, ['close', 'last_price']),
                volume: this.define(ticker, ['volume', 'total_qty']),
            });
        } else if (this.isArray(ticker)) {
            return ticker.map(t => this.parseTicker(t));
        }
    }
    parsePrice(prices) {
        // SPOT
        //[
        // {
        //     symbol: 'BIFI/USDT',
        //     open: 406.1,
        //     high: 407.9,
        //     low: 390.5,
        //     close: 395.3,
        //     chg: -0.0266,
        //     change: -10.8,
        //     volume: 27.035,
        //     turnover: 452715.2506,
        //     lastDayClose: 405.5,
        //     usdRate: 395.3,
        //     baseUsdRate: 1,
        //     zone: 0,
        //     baseCoinScale: 1
        //   },
        //   {
        //     symbol: 'AUTO/USDT',
        //     open: 18.5,
        //     high: 18.5,
        //     low: 18,
        //     close: 18,
        //     chg: -0.0271,
        //     change: -0.5,
        //     volume: 11.958,
        //     turnover: 15305.2335,
        //     lastDayClose: 18.4,
        //     usdRate: 18,
        //     baseUsdRate: 1,
        //     zone: 0,
        //     baseCoinScale: 1
        //   }
        // ]
        if (this.isObject(prices)) {
            return this.safePrice({
                symbol: this.safeSymbols(this.define(prices, ['symbol', 'ticker']), undefined, false, true),
                price: this.define(prices, ['close', 'price']),
            });
        } else if (this.isArray(prices)) {
            return prices.map(p => this.parsePrice(p));
        }
    }
    parseCandle(candles) {
        if (Array.isArray(candles)) {
            return candles.map(candle => {
                return this.safeCandle({
                    openTime: candle[0],
                    closeTime: candle[1],
                    open: candle[2],
                    high: candle[3],
                    low: candle[4],
                    close: candle[5],
                    volume: candle[6],
                });
            });
        } else if (this.isObject(candles)) {
            return this.safeCandle({
                openTime: candles[0],
                closeTime: candles[1],
                open: candles[2],
                high: candles[3],
                low: candles[4],
                close: candles[5],
                volume: candles[6],
            });
        }
    }
    parseTradeHistory(trades) {
        // SPOT
        // {
        //     "tradeId": "72405394",
        //     "tradeTime": 1686535666448,
        //     "memberId": 79010,
        //     "symbol": "BTC/USDT",
        //     "coinSymbol": "BTC",
        //     "baseSymbol": "USDT",
        //     "direction": "BUY",
        //     "type": "MARKET_PRICE",
        //     "role": "TAKER",
        //     "price": 23380.0,
        //     "tradedAmount": 4.2E-4,
        //     "turnover": 10.0,
        //     "orderId": "E168653566641932",
        //     "feeSymbol": "BTC",
        //     "fee": 0.0
        // },        
        // FUTURES
        // [
        //     {
        //       id: 196358763,
        //       member_id: 78246,
        //       order_id: 'F17143837012381583',
        //       opposite_order_id: 'F17143836850151227',
        //       transaction_time: '2024-04-29T09:41:41',
        //       ticker_id: 2,
        //       order_type: 0,
        //       margin_mode: 1,
        //       position_mode: 0,
        //       direction: 0,
        //       position: 0,
        //       leverage: 3,
        //       ticker: 'BTCUSDT',
        //       symbol: 'USDT',
        //       income_symbol: 'BTC',
        //       price: 62311.4,
        //       traded_qty: 0.002,
        //       traded_value: 124.6228,
        //       trading_fee: 0,
        //       profit_and_loss: 0,
        //       role: 0,
        //       margin_gap: null,
        //       order: null,
        //       calc_position: null,
        //       tp_trigger_type: null,
        //       tp_trigger_price: null,
        //       tp_price: null,
        //       sl_trigger_type: null,
        //       sl_trigger_price: null,
        //       sl_price: null,
        //       cross_position_type: null,
        //       copy_trading_type: -1,
        //       pnl_update: false,
        //       post_fee: { totalFrozen: 0, usdt: 0, musa: 0, musaUsdt: 0 }
        //     }
        //   ]
        if (this.isObject(trades)) {
            const assetType = this.define(trades, ['transaction_time']) ? 'futures' : 'spot';
            let symbol = this.define(trades, ['symbol']);
            let timestamp = this.define(trades, ['tradeTime']);
            let isMaker = this.define(trades, ['role']) === 'MAKER' ? true : false;
            let side = this.define(trades, ['direction']);
            if (assetType === 'futures') {
                symbol = this.define(trades, ['ticker']);
                timestamp = new Date(this.define(trades, ['transaction_time'])).getTime();
                isMaker = this.define(trades, ['role']) === 0 ? false : true;
                side = this.define(trades, ['direction']) === 0 ? 'BUY' : 'SELL';
            }
            return this.safeTradeHistory({
                timestamp: timestamp,
                orderId: this.define(trades, ['orderId', 'order_id']),
                symbol: this.safeSymbols(symbol, undefined, false, true),
                price: this.define(trades, ['price']),
                side: side,
                qty: this.define(trades, ['tradedAmount', 'traded_qty']),
                isMaker: isMaker,
                commission: this.define(trades, ['fee', 'trading_fee']),
            });
        } else if (this.isArray(trades)) {
            return trades.map(t => this.parseTradeHistory(t));
        }
    }
    parseOrder(order) {
        // SPOT
        // {
        //     "data": "E168629530081880",
        //     "code": 0,
        //     "message": "success"
        // }
        // FUTURES
        // {
        //     "data": "F7364016934738311031874",
        //     "code": 0,
        //     "message": "success"
        // }
        const orderId = this.define(order, ['orderId']);
        const symbol = this.safeSymbols(this.define(order, ['symbol']), undefined, false, true);
        const price = this.define(order, ['price']);
        const quantity = this.define(order, ['qty']);
        const executedQty = undefined;
        const side = this.define(order, ['side']);
        const status = undefined;
        const reduceOnly = this.define(order, ['reduceOnly']);
        const closePosition = this.define(order, ['closePosition']);
        let tif = this.define(order, ['tif']);
        if (tif === 0) tif = 'GTC';
        else if (tif === 1) tif = 'IOC';
        else if (tif === 2) tif = 'FOK';
        else tif = 'GTC'
        let type = this.define(order, ['type']);
        if (type === 'MARKET_PRICE') type = 'MARKET';
        if (type === 'LIMIT_PRICE') type = 'LIMIT';
        if (type === 0) type = 'LIMIT';
        if (type === 1) type = 'MARKET';
        return this.safeOrder({
            timestamp: this.now(),
            id: orderId,
            symbol: symbol,
            price: price,
            qty: quantity,
            executedQty: executedQty,
            type: type,
            tif: tif,
            side: side,
            status: status,
            reduceOnly: reduceOnly,
            closePosition: closePosition,
        });
    }
    parseCancelOrder(response) {
        if (this.isObject(response) && this.hasProp(response, ['orderId'])) {
            const orderId = this.safeString(response, 'orderId');
            return { id: orderId, status: 'success' }
        } else {
            return { msg: 'cancel all success' }
        }
    }
    parseOpenOrders(openOrders) {
        // SPOT
        // [
        //     {
        //       orderId: 'S171213445924221',
        //       memberId: 83052,
        //       symbol: 'BTC/USDT',
        //       coinSymbol: 'BTC',
        //       baseSymbol: 'USDT',
        //       status: 'TRADING',
        //       direction: 'SELL',
        //       type: 'LIMIT_PRICE',
        //       price: 69487.26,
        //       amountSymbol: 'BTC',
        //       amountType: 'COIN',
        //       amount: 10,
        //       tradedAmount: 0,
        //       turnover: 0,
        //       time: 1712134459242,
        //       completedTime: null,
        //       canceledTime: null,
        //       useDiscount: '0',
        //       orderResource: 'CUSTOMER',
        //       detail: null,
        //       completed: false
        //     }
        // ]
        // FUTURES
        // {
        //     id: 204884,
        //     member_id: 83052,
        //     order_id: 'F17122082452016894',
        //     trigger_id: null,
        //     order_time: '2024-04-04T05:24:05',
        //     filled_time: null,
        //     cancel_time: null,
        //     ticker_id: 1,
        //     margin_mode: 1,
        //     position_mode: 0,
        //     direction: 0,
        //     position: 0,
        //     order_type: 1,
        //     status: 4,
        //     tif_mode: 0,
        //     trigger_type: 0,
        //     trigger_direction: 0,
        //     ticker: 'BTCUSDT',
        //     coin_symbol: 'BTC',
        //     base_symbol: 'USDT',
        //     leverage: 100,
        //     order_price: 10000,
        //     order_qty: 0.001,
        //     traded_price: 0,
        //     traded_qty: 0,
        //     traded_value: 0,
        //     left_qty: 0.001,
        //     post_only: 0,
        //     reduce_only: 0,
        //     price_protected: 0,
        //     trigger: null,
        //     tp_trigger_type: 0,
        //     tp_trigger_price: null,
        //     tp_price: null,
        //     sl_trigger_type: 0,
        //     sl_trigger_price: null,
        //     sl_price: null,
        //     copy_trading_type: -1,
        //     copy_trading_data: null,
        //     frozen_detail: null
        //  }
        if (this.isArray(openOrders)) {
            openOrders = openOrders.reverse();
            return openOrders.map(order => this.parseOpenOrders(order));
        } else if (this.isObject(openOrders)) {
            const orderId = this.define(openOrders, ['orderId', 'order_id']);
            const symbol = this.safeSymbols(this.define(openOrders, ['symbol', 'ticker']), undefined, false, true);
            const price = this.define(openOrders, ['price', 'order_price']);
            const quantity = this.define(openOrders, ['amount', 'order_qty']);
            const executedQty = this.define(openOrders, ['tradedAmount', 'traded_qty']);
            let tif = this.define(openOrders, ['tif_mode']);
            if (tif === 0) tif = 'GTC';
            if (tif === 1) tif = 'IOC';
            if (tif === 2) tif = 'FOK';

            let closePosition = undefined;
            let reduceOnly = undefined;
            let timestamp = this.define(openOrders, ['time', 'order_time']);
            let side = this.define(openOrders, ['direction']);
            if (this.hasProp(openOrders, ['reduce_only'])) { // FUTURES
                closePosition = false; // Bitmusa does not support Close Position
                side = this.define(openOrders, ['position']) === 0 ? 'BUY' : 'SELL';
                timestamp = new Date(timestamp).getTime();
                reduceOnly = this.define(openOrders, ['reduce_only']) === 1 ? true : false;
            }
            let type = this.define(openOrders, ['type', 'order_type']);
            if (type === 'MARKET_PRICE') type = 'MARKET';
            if (type === 'LIMIT_PRICE') type = 'LIMIT';
            if (type === 0) type = 'MARKET';
            if (type === 1) type = 'LIMIT';
            const order = {};
            this.extendWithObj(order, {
                id: orderId,
                symbol: symbol,
                price: price,
                qty: quantity,
                executedQty: executedQty,
                type: type,
                tif: tif,
                side: side,
                timestamp: timestamp,
                closePosition: closePosition,
                reduceOnly: reduceOnly,
            })
            return this.safeOrder(order);
        }
    }
    parseExposure(exposures) {
        // [
        //     {
        //       id: 105002,
        //       member_id: 83052,
        //       entry_time: '2024-04-03T11:07:08',
        //       close_time: null,
        //       ticker_id: 1,
        //       margin_mode: 1,
        //       position_mode: 0,
        //       position: 1,
        //       status: 0,
        //       ticker: 'BTCUSDT',
        //       coin_symbol: 'BTC',
        //       base_symbol: 'USDT',
        //       leverage: 4,
        //       qty: 1.1,
        //       value: 73032.52,
        //       entry_price: 66393.2,
        //       close_qty: 0,
        //       sum_close_value: 0,
        //       avg_close_price: 0,
        //       max_qty: 1.1,
        //       liquid_price: 154276622.80126715,
        //       bankruptcy_price: 154276954.76726714,
        //       initial_margin: 18258.13,
        //       maintenance_margin: 365.1626,
        //       liquid_margin: 154210229.60126713,
        //       position_margin: 18258.13,
        //       extra_margin: 0,
        //       margin_gap: 0,
        //       cross_margin: 0,
        //       available_value: 169613359.59399387,
        //       hedge_cross: 0,
        //       close_fee: 33959.186820159564,
        //       take_profit_price: 0,
        //       stop_loss_price: 0,
        //       adl: 0,
        //       return_liquid_margin: null,
        //       realized_pnl: 0,
        //       tp_trigger_type: 0,
        //       tp_trigger_price: null,
        //       tp_price: null,
        //       sl_trigger_type: 0,
        //       sl_trigger_price: null,
        //       sl_price: null,
        //       copy_trading_type: -1,
        //       unpnl: null,
        //       temp_id: null,
        //       return_market_margin: 0,
        //       frozen_detail: null,
        //       cross_detail: null,
        //       liquid: false
        //     }
        // ]
        if (this.isArray(exposures)) {
            return exposures.map(exposure => this.parseExposure(exposure));
        } else if (this.isObject(exposures)) {
            const sign = this.define(exposures, ['position']) === 0 ? 1 : -1;
            return this.safeExposure({
                symbol: this.safeSymbols(this.define(exposures, ['ticker']), 'futures', false, true),
                qty: this.define(exposures, ['qty']) * sign,
                entryPrice: this.define(exposures, ['entry_price']),
                positionSide: this.define(exposures, ['position']) === 0 ? 'LONG' : 'SHORT',
                leverage: this.define(exposures, ['leverage']),
                notional: this.define(exposures, ['value']) * sign,
                liquidPrice: this.define(exposures, ['liquid_price']),
                marginType: this.define(exposures, ['margin_mode']) === 0 ? 'isloated' : 'cross',
                unRealizedPnL: this.define(exposures, ['unpnl']),
            });
        }
    }
    parseLeverage(response, symbol, leverage) {
        if (response.code === 0) {
            return { symbol: symbol, leverage: leverage };
        }
    }
    async checkSystemStatus() {
        let method = 'getApiHealth';
        const response = await this[method]();
        const data = this.handleResponse(response);
        return this.parseSystemStatus(data);
    }
    async recentTrades(symbol, limit) {
        await this.loadMarkets();
        let method = 'getApiV1SpotMarketTrade';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol, size: limit });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseTrade(data);
    }
    async balance(symbol) {
        await this.loadMarkets();
        let method = 'getApiV1SpotWallet';
        const response = await this[method]();
        const data = this.handleResponse(response);
        const allBalances = this.parseBalance(data);
        const balance = allBalances.find(b => b.symbol === symbol);
        return balance || {};
    }
    async balances() {
        await this.loadMarkets();
        let method = 'getApiV1SpotWallet';
        const response = await this[method]();
        const data = this.handleResponse(response);
        const filteredBalances = data.filter(wallet => parseFloat(wallet.balance) + parseFloat(wallet.frozenBalance) > 0);
        return this.parseBalance(filteredBalances);
    }
    async orderBook(symbol, limit) {
        await this.loadMarkets();
        let method = 'getApiV1SpotMarketOrderbook';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseOrderBook(data, symbol, limit);
    }
    async ticker(symbol) {
        await this.loadMarkets();
        let method = 'getApiV1SpotMarket';
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        const response = await this[method]();
        let data = this.handleResponse(response);
        data = data.find(t => t.symbol === parsedSymbol);
        return this.parseTicker(data, { symbol: parsedSymbol });
    }
    async tickers(symbols) {
        await this.loadMarkets();
        let method = 'getApiV1SpotMarket';
        const parsedSymbols = this.safeSymbols(symbols, 'spot', true);
        const response = await this[method]();
        let data = this.handleResponse(response);
        if (this.isArray(symbols)) {
            data = data.filter(t => parsedSymbols.includes(t.symbol));
        } else {
            throw new TypeError(this.exchange + ' ' + 'tickers() requires an array of symbols');
        }
        return this.parseTicker(data);
    }
    async price(symbol) {
        await this.loadMarkets();
        let method = 'getApiV1SpotMarket';
        const response = await this[method]();
        const allPrices = this.handleResponse(response);
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        const price = allPrices.find(t => t.symbol === parsedSymbol);
        return this.parsePrice(price);
    }
    async prices(symbols) {
        await this.loadMarkets();
        let method = 'getApiV1SpotMarket';
        const response = await this[method]();
        const tickers = this.handleResponse(response);
        if (this.isArray(symbols)) {
            const parsedSymbols = this.safeSymbols(symbols, 'spot', true);
            const prices = tickers.filter(t => parsedSymbols.includes(t.symbol)).map(t => ({ symbol: t.symbol, price: t.close }));
            return this.parsePrice(prices);
        } else {
            throw new TypeError(this.exchange + ' ' + 'prices() requires an array of symbols');
        }
    }
    async candles(symbol, timeframe, limit, params = {}) {
        await this.loadMarkets();
        let method = 'getApiV1SpotMarketKline';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        const parsedTimeframe = this.safeTimeframe(timeframe, 'spot', false);
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            interval: parsedTimeframe,
            size: limit,
            startTime: params.startTime,
            endTime: params.endTime
        });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseCandle(data);
    }
    async tradeHistory(symbol, limit, params = {}) {
        throw new Unavailable(this.exchange + ' ' + 'tradeHistory() not supported');
        await this.loadMarkets();
        this.method = 'getApiV1SpotTradeHistory';
        const parameters = {};
        this.extendWithObj(parameters, {
            symbol: symbol,
            size: limit,
            direction: params.side,
            startTime: params.startTime,
            endTime: params.endTime
        });
        const response = await this[this.method](parameters);
        const data = this.handleResponse(response);
        return this.parseTradeHistory(data);
    }
    async openOrders(symbol) {
        await this.loadMarkets();
        let method = 'getApiV1SpotOrder';
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        const parameters = {};
        this.extendWithObj(parameters, { symbol: parsedSymbol, pageNo: 1, pageSize: 999 });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseOpenOrders(data.content);
    }
    async cancelOrder(symbol, orderId) {
        await this.loadMarkets();
        let method = 'postApiV1SpotOrderCancel';
        const parameters = {};
        this.extendWithObj(parameters, {
            orderId: orderId
        })
        await this[method](parameters);
        const response = { orderId: orderId }
        return this.parseCancelOrder(response);
    }
    async futuresRecentTrades(symbol, limit) {
        await this.loadMarkets();
        let method = 'getApiV2FutureMarketTrade';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        const parameters = {};
        this.extendWithObj(parameters, { ticker: parsedSymbol, size: limit });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseTrade(data);
    }
    async futuresBalance(symbol) {
        await this.loadMarkets();
        let method = 'getApiV2FutureWalletNoposition';
        const response = await this[method]();
        const data = this.handleResponse(response);
        const allBalance = this.parseBalance(data);
        const balance = allBalance.find(b => b.symbol === symbol);
        return balance;
    }
    async futuresBalances() {
        await this.loadMarkets();
        let method = 'getApiV2FutureWalletNoposition';
        const response = await this[method]();
        const data = this.handleResponse(response);
        let balances = data.filter(wallet => parseFloat(wallet.total_wallet_balance) > 0);
        return this.parseBalance(balances);
    }
    async futuresExposure(symbol) {
        await this.loadMarkets();
        let method = 'getApiV2FuturePosition';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { ticker: parsedSymbol });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseExposure(data);
    }
    async futuresExposures() {
        await this.loadMarkets();
        let method = 'getApiV2FuturePosition';
        const response = await this[method]();
        const data = this.handleResponse(response);
        return this.parseExposure(data);
    }
    async futuresOrderBook(symbol, limit) {
        await this.loadMarkets();
        let method = 'getApiV2FutureMarketOrderbook';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { ticker: parsedSymbol, size: limit });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseOrderBook(data, symbol, limit);
    }
    async futuresTicker(symbol) {
        await this.loadMarkets();
        let method = 'getApiV2FutureMarket';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { ticker: parsedSymbol });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseTicker(data);
    }
    async futuresPrice(symbol) {
        await this.loadMarkets();
        let method = 'getApiV2FutureMarket';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { ticker: parsedSymbol });
        const response = await this[method](parameters);
        const ticker = this.handleResponse(response);
        return this.parsePrice({ symbol: symbol, price: ticker.last_price });
    }
    async futuresCandles(symbol, timeframe, limit, params = {}) {
        await this.loadMarkets();
        let method = 'getApiV2FutureMarketKline';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, {
            ticker: parsedSymbol,
            interval: timeframe,
            size: limit,
            startTime: params.startTime,
            endTime: params.endTime
        });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseCandle(data);
    }
    async futuresTradeHistory(symbol, limit, params = {}) {
        await this.loadMarkets();
        let method = 'getApiV2FutureTradeHistory';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, {
            ticker: parsedSymbol,
            size: limit,
            startTime: params.startTime,
            endTime: params.endTime
        });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseTradeHistory(data.content);
    }
    async futuresOpenOrders(symbol) {
        await this.loadMarkets();
        let method = 'getApiV2FutureOrder';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { ticker: parsedSymbol, size: 999 });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseOpenOrders(data);
    }
    async futuresCancelOrder(symbol, orderId) {
        await this.loadMarkets();
        let method = 'postApiV2FutureOrderCancel';
        const parameters = {};
        this.extendWithObj(parameters, {
            orderId: orderId
        })
        await this[method](parameters);
        const response = { orderId: orderId }
        return this.parseCancelOrder(response);
    }
    async setLeverage(symbol, leverage) {
        await this.loadMarkets();
        let method = 'postApiV2FutureLeverage';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { ticker: parsedSymbol, leverage: leverage });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return this.parseLeverage(data, symbol, leverage);
    }
    async setPositionMode(dualSidePosition) {
        throw new Error('Not implemented');
        await this.loadMarkets();
        let method = 'postApiV2FuturePositionMode';
        dualSidePosition = dualSidePosition.replace('-', '');
        dualSidePosition = dualSidePosition.toUpperCase();
        const positionMode = ['HEDGE', 'ONEWAY'];
        if (!positionMode.includes(dualSidePosition)) {
            throw new MalformedParameter(this.exchange + ' ' + 'setPositionMode() invalid dualSidePosition, must be HEDGE or ONEWAY');
        }
        dualSidePosition = dualSidePosition ? 1 : 0;
        const parameters = {};
        this.extendWithObj(parameters, { position_mode: dualSidePosition });
        const response = await this[method](parameters);
        const data = this.handleResponse(response);
        return data;
    }
    async setMarginMode(symbol, marginMode) {
        throw new Error('Not implemented');
    }
    async order(symbol, side, argQty, argPrice, params = {}) {
        await this.loadMarkets();
        let method = 'postApiV1SpotOrder';
        /**
         * @method
         * @name bitmusa#order
         * @description send a spot order
         * @param {string} symbol - the target symbol
         * @param {string} side - 'BUY' or 'SELL'
         * @param {float} argQty - how much of you want to trade in units of the base currency
         * @param {float} argPrice - the price that the order is to be fullfilled, in units of the quote currency.
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'MARKET' or 'LIMIT' or 'TP' or 'SL'
         * @param {boolean} [params.isStopOrder] - true if the order is a stop order
         * @param {boolean} [params.isTrailingorder] - true if the order is a trailing order
         * @param {number} [params.triggerPrice] - the price that a stop order is triggered at. For a trailing order, it is the activation price
         * @param {float} [params.deltaAmount] - the amount change that a trailing order is triggered at
         * @param {float} [params.deltaPercent] - the percent change that a trailing order is triggered at
         */
        const symbolUpper = this.safeSymbols(symbol.toUpperCase(), 'spot', false);
        const sideUpper = side.toUpperCase();
        const quantity = parseFloat(argQty) ? argQty : null;
        const price = parseFloat(argPrice) ? argPrice : null;
        let type = this.safeStringUpper(params, 'type', 'LIMIT');
        if (type === 'MARKET') {
            type = 'MARKET_PRICE';
        } else if (type === 'LIMIT') {
            type = 'LIMIT_PRICE';
        }
        const parameters = {};
        this.extendWithObj(parameters, {
            symbol: symbolUpper,
            direction: sideUpper,
            type: type,
            price: price,
            amount: quantity,
        });
        if (!this.hasProp(parameters, ['symbol'])) {
            throw new EmptyParameters(this.exchange + ' ' + 'order() requires symbol parameters');
        }
        if (!this.hasProp(parameters, ['direction'])) {
            throw new EmptyParameters(this.exchange + ' ' + 'order() requires side parameters');
        }
        if (type === 'LIMIT') {
            if (!this.hasProp(parameters, ['price'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'order() requires price parameter for LIMIT order');
            }
            if (!this.hasProp(parameters, ['amount'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'order() requires quantity parameter for LIMIT order');
            }
        } else if (type === 'MARKET') {
            if (!this.hasProp(parameters, ['quantity'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'order() requires quantity parameter for MARKET order');
            }
        }
        const response = await this[method](parameters);
        const orderId = this.handleResponse(response);
        const order = {}
        this.extendWithObj(order, {
            orderId: orderId,
            symbol: parameters.symbol,
            price: parameters.price,
            qty: parameters.amount,
            type: parameters.type,
            side: parameters.direction,
        });
        return this.parseOrder(order);
    }
    async futuresOrder(symbol, side, argQty, argPrice, params = {}) {
        await this.loadMarkets();
        let method = 'postApiV2FutureOrder';
        /**
         * @method
         * @name bitmusa#futuresOrder
         * @description send a futures order
         * @param {string} symbol - the target symbol
         * @param {string} side - 'BUY' or 'SELL'
         * @param {float} argQty - how much of you want to trade in units of the base currency
         * @param {float} argPrice - the price that the order is to be fullfilled, in units of the quote currency.
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'MARKET' or 'LIMIT' or 'TP' or 'SL'
         * @param {boolean} [params.isStopOrder] - true if the order is a stop order
         * @param {boolean} [params.isTrailingorder] - true if the order is a trailing order
         * @param {number} [params.triggerPrice] - the price that a stop order is triggered at. For a trailing order, it is the activation price
         * @param {float} [params.deltaAmount] - the amount change that a trailing order is triggered at
         * @param {float} [params.deltaPercent] - the percent change that a trailing order is triggered at
         */
        const symbolUpper = this.safeSymbols(symbol.toUpperCase(), 'futures', false);
        const sideUpper = side.toUpperCase();
        const quantity = parseFloat(argQty) ? argQty : null;
        const price = parseFloat(argPrice) ? argPrice : null;
        const isReduceOnly = this.define(params, ['reduceOnly']);
        const isPostOnly = this.safeStringUpper(params, 'tif') === 'GTX' ? true : false;
        let tif = this.define(params, ['tif']);
        let type = this.safeStringUpper(params, 'type', 'LIMIT');
        if (type === 'MARKET' || type === 'MARKET_PRICE') {
            type = 0;
        } else if (type === 'LIMIT' || type === 'LIMIT_PRICE') {
            type = 1;
        }
        if (tif === 'GTX') tif = 0;
        if (tif === 'IOC') tif = 1;
        if (tif === 'FOK') tif = 2;
        const parameters = {};
        this.extendWithObj(parameters, {
            ticker: symbolUpper,
            direction: 0,
            position: sideUpper == 'BUY' ? 0 : 1,
            order_type: type,
            order_price: price,
            order_qty: quantity,
            is_reduce_only: isReduceOnly,
            is_post_only: isPostOnly,
            margin_mode: 0,
        });
        if (!this.hasProp(parameters, ['ticker'])) {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresOrder() requires symbol parameters');
        }
        if (!this.hasProp(parameters, ['position'])) {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresOrder() requires side parameters');
        }
        if (type === 'LIMIT') {
            if (!this.hasProp(parameters, ['order_price'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() requires price parameter for LIMIT order');
            }
            if (!this.hasProp(parameters, ['order_qty'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() requires quantity parameter for LIMIT order');
            }
        } else if (type === 'MARKET') {
            if (!this.hasProp(parameters, ['order_qty'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() requires quantity parameter for MARKET order');
            }
        }
        const response = await this[method](parameters);
        const orderId = this.handleResponse(response);
        const order = {};
        this.extendWithObj(order, {
            orderId: orderId,
            symbol: parameters.ticker,
            price: parameters.order_price,
            qty: parameters.order_qty,
            tif: tif,
            type: type,
            side: sideUpper,
            reduceOnly: isReduceOnly ? true : false,
            closePosition: false,
        });
        return this.parseOrder(order);
    }

    // -- websocket methods -- //
    handleSocketOpen(channel, isPrivate = false) {
        return;
    }
    handleSocketClose(channel) {
        //console.log('socket close', channel);
    }
    handleSocketError(channel, error) {
        //console.log('socket error', channel);
    }
    methodName(method) {
        const subStringsToRemove = ['futures', 'delievery'];
        subStringsToRemove.forEach(subString => {
            if (method.includes(subString)) {
                method = method.replace(subString, '');
                method = method.charAt(0).toLowerCase() + method.slice(1);
            }
        });
        return method;
    }
    handleSocketMessage(method, event) {
        const data = JSON.parse(event.data);
        const methodName = this.methodName(method);
        const methods = {
            candle: this.handleCandleStream,
            orderBook: this.handleOrderBookStream,
            balance: this.handleBalanceStream,
            orderUpdate: this.handleOrderUpdateStream,
            execution: this.handleExecutionStream,
            exposure: this.handleExposureStream
        };
        const handler = methods[methodName];
        return handler.call(this, data);
    }

    handleStream(url, method, payload = {}) {
        const handleSocketOpen = this.handleSocketOpen.bind(this);
        const handleSocketClose = this.handleSocketClose.bind(this);
        const handleSocketMessage = this.handleSocketMessage.bind(this, method);
        const handleSocketError = this.handleSocketError.bind(this);
        return this.client(url, handleSocketOpen, handleSocketClose, handleSocketMessage, handleSocketError, payload);
    }
    async postListenKey() {
        let method = 'postApiV1SpotUserDataStream';
        const response = await this[method]();
        const data = this.handleResponse(response);
        const listenKey = data.listenKey;
        this.has().listenKeys['spot'] = listenKey;
        return listenKey;
    }
    async putListenKey() {
        let method = 'putApiV1SpotUserDataStream';
        const response = await this[method]();
        return this.handleResponse(response);
    }
    async postFuturesListenKey() {
        let method = 'postApiV2FutureUserDataStream';
        const data = await this[method]();
        const listenKey = data.data.data.listenKey;
        this.has().listenKeys['futures'] = listenKey;
        return listenKey;
    }
    async putFuturesListenKey() {
        let method = 'putApiV2FutureUserDataStream';
        const response = await this[method]();
        return this.handleResponse(response);
    }
    async keepAlive(method, listenKey) {
        const maxRetries = this.safeInteger(this.options, 'maxRetries', 5);
        const retryInterval = this.safeInteger(this.options, 'retryInterval', 1000);
        let count = 0;
        try {
            let response = undefined;
            if (method.includes('futures')) {
                response = await this.putFuturesListenKey(listenKey);
            } else if (method.includes('delivery')) {
                response = await this.putDeliveryListenKey(listenKey);
            } else {
                response = await this.putListenKey(listenKey);
            }
        } catch (error) {
            if (count < maxRetries) {
                count++;
                setTimeout(this.keepAlive, retryInterval, method, listenKey);
            }
        }
    }
    async authenticate(method, url) {
        const isPrivate = this.isValid(this.ws.private[method]) ? true : false;

        if (isPrivate) {
            try {
                let listenKey = undefined;
                if (method.includes('futures')) {
                    if (!this.has().listenKeys['futures']) {
                        listenKey = await this.postFuturesListenKey();
                    } else {
                        listenKey = this.has().listenKeys['futures'];
                    }
                } else {
                    if (!this.has().listenKeys['spot']) {
                        listenKey = await this.postListenKey();
                    } else {
                        listenKey = this.has().listenKeys['spot'];
                    }
                }
                url += `/${listenKey}`;
                if (this.options.reconnect) {
                    this.schedule(180000, this.keepAlive(), method, listenKey);
                }
            } catch (error) {
                // TODO
            }
        }
        return url;
    }
    handleCandleStream(data) {
        // {
        //     stream: 'BTCUSDT@kline_1min',
        //     data: {
        //       s: 'BTC/USDT',
        //       o: 66091.61,
        //       h: 66091.61,
        //       l: 66091.61,
        //       c: 66091.61,
        //       t: 1712222220000,
        //       T: 1712223059999,
        //       i: '1min',
        //       q: 0,
        //       v: 0,
        //       u: 1712221244994
        //     }
        // }
        const kline = data.data;
        const openTime = kline.t;
        const open = this.safeString(kline, 'o');
        const high = this.safeString(kline, 'h');
        const low = this.safeString(kline, 'l');
        const close = this.safeString(kline, 'c');
        const volume = this.safeString(kline, 'q');
        const closeTime = kline.T;
        const res = {};
        this.extendWithObj(res, { openTime: openTime, open: open, high: high, low: low, close: close, volume: volume, closeTime: closeTime });
        return res;
    }
    handleOrderBookStream(data) {
        // SPOT
        // {
        //     "stream": "BTCUSDT@depth",
        //     "data": {
        //         "updateTime": 1700549490882,
        //         "bids": [
        //             {
        //                 "price": 29985.00,
        //                 "amount": 0.00100
        //             },
        //             ...
        //         ],
        //         "asks": [
        //             {
        //                 "price": 29987.00,
        //                 "amount": 0.00100
        //             },
        //             ...
        //         ]
        //     }
        // }
        // FUTURES
        // {
        //     "stream": "BTCUSDT@depth",
        //     "data": {
        //         "updateTime": 1700549857658,
        //         "bids": [
        //             {
        //                 "price": 37415.8,
        //                 "amount": 0.006
        //             },
        //             ...
        //         ],
        //         "asks": [
        //             {
        //                 "price": 37450.7,
        //                 "amount": 0.070
        //             },
        //             ...
        //         ]
        //     }
        // }
        const symbol = data.stream.split('@')[0];
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false, true);
        const res = {
            symbol: parsedSymbol,
            asks: data.data.asks.map(ask => [String(ask.price), String(ask.amount)]),
            bids: data.data.bids.map(bid => [String(bid.price), String(bid.amount)]),
            timestamp: data.data.updateTime,
        }

        return res;
    }
    handleBalanceStream(data) {
        // SPOT
        // {
        //     "data": {
        //         "asset": "USDT",
        //         "free": "1132800.449",
        //         "locked": "80669.91"
        //     },
        //     "stream": "spot_wallet",
        //     "eventTime": 1700703548846
        // }
        // FUTURES
        // {
        //     "data": {
        //         "asset": "USDT",
        //         "free": "9981.51952661",
        //         "locked": "18.48047339"
        //     },
        //     "stream": "future_wallet",
        //     "eventTime": 1700703707123
        // }
        const stream = this.safeString(data, 'stream');
        if (stream === 'spot_wallet') {
            const item = this.safeValue(data, 'data');
            const asset = this.safeStringUpper(item, 'asset');
            const available = this.safeString(item, 'free');
            const frozen = this.safeString(item, 'locked');
            const wallet = Precise.stringAdd(available, frozen);
            const response = {};
            this.extendWithObj(response, {
                asset: asset,
                wallet: wallet,
                available: available,
                frozen: frozen
            });
            this.wallets['spot'][asset] = response;
            return response;
        } else if (stream === 'future_wallet') {
            const item = this.safeValue(data, 'data');
            const asset = this.safeStringUpper(item, 'asset');
            const available = this.safeString(item, 'free');
            const frozen = this.safeString(item, 'locked');
            const wallet = Precise.stringAdd(available, frozen);
            const response = {};
            this.extendWithObj(response, {
                asset: asset,
                wallet: wallet,
                available: available,
                frozen: frozen
            });
            this.wallets['futures'][asset] = response;
            return response;
        }
    }
    handleOrderUpdateStream(data) {
        // SPOT
        // {
        //     "data": {
        //         "orderId": "C171558199502193",
        //         "symbol": "XRP/USDT",
        //         "direction": "BUY",
        //         "type": "LIMIT_PRICE",
        //         "price": 0.5155,
        //         "amount": 2,
        //         "tradedAmount": 0,
        //         "value": 0,
        //         "status": "TRADING",
        //         "createdTime": 1715581995021,
        //         "canceledTime": null,
        //         "completedTime": null
        //     },
        //     "stream": "spot_order",
        //     "eventTime": 1700703548846
        // }
        // FUTURES
        // {
        //     "data": {
        //         "orderId": "C171558199502193",
        //         "ticker": "XRPUSDT",
        //         "direction": "OPEN",
        //         "type": "LIMIT",
        //         "price": 0.5155,
        //         "amount": 2,
        //         "tradedAmount": 0,
        //         "value": 0,
        //         "status": "TRADING",
        //         "createdTime": 1715581995021,
        //         "canceledTime": null,
        //         "completedTime": null
        //     },
        //     "stream": "future_order",
        //     "eventTime": 1700703548846
        // }
        const stream = this.safeString(data, 'stream');
        if (stream === 'spot_order') {
            const item = this.safeValue(data, 'data');
            const symbol = this.safeSymbols(this.safeString(item, 'symbol'), 'spot', false, true);
            const timestamp = this.safeTimestamp(data, 'createdTime');
            const id = this.safeString(item, 'orderId');
            const price = this.safeString(item, 'price');
            const qty = this.safeString(item, 'amount');
            const executedQty = this.safeString(item, 'tradedAmount');
            const side = this.safeStringUpper(item, 'direction');
            let type = this.safeStringUpper(item, 'type');
            if (type === 'LIMIT_PRICE') type = 'LIMIT';
            if (type === 'MARKET_PRICE') type = 'MARKET';
            const tif = 'GTX' // Bitmusa does not support tif for spot orders
            let status = this.safeString(item, 'status');
            if (status === 'COMPLETED') status = 'FILLED';
            if (status === 'OVERTIMED') status = 'CANCELED';
            const response = {};
            this.extendWithObj(response, {
                timestamp: timestamp,
                id: id,
                status: status,
                symbol: symbol,
                price: price,
                qty: qty,
                executedQty: executedQty,
                type: type,
                tif: tif,
                side: side
            })
            return response;
        } else if (stream === 'future_order') {
            const item = this.safeValue(data, 'data');
            const symbol = this.safeSymbols(this.safeString(item, 'ticker'), 'futures', false, true);
            const timestamp = this.safeTimestamp(data, 'createdTime');
            const id = this.safeString(item, 'orderId');
            const price = this.safeString(item, 'price');
            const qty = this.safeString(item, 'amount');
            const executedQty = this.safeString(item, 'tradedAmount');
            const side = this.safeStringUpper(item, 'direction');
            let type = this.safeStringUpper(item, 'type');
            if (type === '0') type = 'MARKET';
            if (type === '1') type = 'LIMIT';
            if (type === '2') type = 'TAKE_PROFIT';
            if (type === '3') type = 'STOP_LOSS';
            if (type === '4') type = 'LIQUIDATION';
            let tif = this.safeStringUpper(item, 'tif');
            if (tif === '0') tif = 'GTC';
            if (tif === '1') tif = 'IOC';
            if (tif === '2') tif = 'FOK';
            const response = {};
            let status = this.safeString(item, 'status');
            if (status === '1') status = 'FILLED';
            if (status === '2') status = 'CANCELED';
            if (status === '3') status = 'FILLED';
            if (status === '4') status = 'TRADING';
            this.extendWithObj(response, {
                timestamp: timestamp,
                id: id,
                status: status,
                symbol: symbol,
                price: price,
                qty: qty,
                executedQty: executedQty,
                type: type,
                tif: tif,
                side: side
            })
            return response;
        }
    }
    handleExposureStream(data) {
        // {
        //     "data": {
        //         "ticker" : "XRPUSDT",
        //         "marginMode" : "ISOLATED",
        //         "positionMode" : "ONEWAY",
        //         "position" : "BUY",
        //         "status" : "OPEN",
        //         "leverage" : "10",
        //         "price" : "0.5155",
        //         "amount" : "1",
        //         "value" : "0.5155",
        //         "liquidPrice" : "0.5155",
        //         "unpnl" : "0",
        //         "createdTime" : 1700703548846,
        //         "closeTime" : "null",
        //     },
        //     "stream": "future_position",
        //     "eventTime": 1700703548846
        // }
        const stream = this.safeValue(data, 'data');
        if (stream === 'future_position') {
            const item = this.safeValue(data, 'data');
            const symbol = this.safeSymbols(this.safeString(data, 'ticker'), 'futures', false, true);
            const qty = this.safeString(item, 'amount');
            const price = this.safeString(item, 'price');
            const leverage = this.safeString(item, 'leverage');
            const notional = this.safeString(item, 'value');
            const liquidPrice = this.safeString(item, 'liquidPrice');
            const marginType = this.safeStringLower(item, 'marginMode');
            const unRealizedPnL = this.safeString(item, 'unpnl');
            let side = this.safeStringUpper(item, 'position');
            if (side === 'BUY' || side === 'buy') side = 'LONG';
            if (side === 'SELL' || side === 'sell') side = 'SHORT';
            const response = {};
            this.extendWithObj(response, {
                symbol: symbol,
                qty: qty,
                entryPrice: price,
                positionSide: side,
                leverage: leverage,
                notional: notional,
                liquidPrice: liquidPrice,
                marginType: marginType,
                unRealizedPnL: unRealizedPnL,
            });
            return response;
        }
    }
    async candleStream(symbol, interval) {
        await this.loadMarkets();
        let method = 'candle';
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false).replace('/', '');
        const parsedTimeframe = this.safeTimeframe(interval, 'spot');
        const urls = this.urls['base']['ssV0'];
        const pathValue = `/public?stream=${parsedSymbol}@kline_${parsedTimeframe}`;
        const url = await this.authenticate(method, urls + pathValue);
        return this.handleStream(url, method);
    }
    async orderBookStream(symbol) {
        await this.loadMarkets();
        let method = 'orderBook';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false).replace('/', '');
        const urls = this.urls['base']['ssV0'];
        const pathValue = `/public?stream=${parsedSymbol}@depth${20}@100ms`;
        const url = await this.authenticate(method, urls + pathValue);
        return this.handleStream(url, method);
    }
    async futuresCandleStream(symbol, interval) {
        await this.loadMarkets();
        let method = 'futuresCandle';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        const parsedTimeframe = this.safeTimeframe(interval, 'futures');
        const urls = this.urls['base']['sfV0'];
        const pathValue = `/public?stream=${parsedSymbol}@kline_${parsedTimeframe}`;
        const url = await this.authenticate(method, urls + pathValue);
        return this.handleStream(url, method);
    }
    async futuresOrderBookStream(symbol) { // TODO Parse
        await this.loadMarkets();
        let method = 'futuresOrderBook';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        const urls = this.urls['base']['sfV0'];
        const pathValue = `/public?stream=${parsedSymbol}@depth${20}@1ms`;
        const url = await this.authenticate(method, urls + pathValue);
        return this.handleStream(url, method);
    }
    async balanceStream() {
        await this.loadMarkets();
        await this.loadWallets('spot');
        let method = 'balance';
        const urls = this.urls['base']['ssV0'];
        const url = await this.authenticate(method, urls);
        return this.handleStream(url, method);
    }
    async futuresBalanceStream() {
        await this.loadMarkets();
        await this.loadWallets('futures');
        let method = 'futuresBalance';
        const urls = this.urls['base']['sfV0'];
        const url = await this.authenticate(method, urls);
        return this.handleStream(url, method);
    }
    async orderUpdateStream() {
        await this.loadMarkets();
        let method = 'orderUpdate';
        const urls = this.urls['base']['ssV0'];
        const url = await this.authenticate(method, urls);
        return this.handleStream(url, method);
    }
    async futuresOrderUpdateStream() {
        await this.loadMarkets();
        let method = 'futuresOrderUpdate';
        const urls = this.urls['base']['sfV0'];
        const url = await this.authenticate(method, urls);
        return this.handleStream(url, method);
    }
    async futuresExposureStream() {
        await this.loadMarkets();
        let method = 'futuresExposure';
        const urls = this.urls['base']['sfV0'];
        const url = await this.authenticate(method, urls);
        return this.handleStream(url, method);
    }
}

module.exports = Bitmusa;