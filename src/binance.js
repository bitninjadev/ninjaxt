import { BaseExchange } from './base/Exchange.js';
import { Unavailable, EmptyParameters, InvalidOrder, DataLost, MalformedParameter, InvalidParameters } from './base/errors.js';
import { hmacSha256 } from './base/functions/crypto.js';
import { Precise } from './base/functions/Precise.js';
import OrderBook from './base/orderBook.js';

export class Binance extends BaseExchange {
    has() {
        return this.deepExtend(super.has(), {
            features: {
                ws: true,
                publicAPI: true,
                privateAPI: true,
                spot: true,
                futures: true,
                delievery: true,
                options: true,
                //  --- spot trading --- //
                limitOrder: true,
                marketOrder: true,
                stopLimitOrder: false,
                stopMarketOrder: true,
                trailingLimitOrder: false,
                trailingMarketOrder: true,
                cancelOrder: true,
                cancelAllOrders: true,
                // --- spot wallet && market --- //
                recentTrades: true,
                balance: true,
                balances: true,
                orderBook: true,
                orderBooks: true,
                ticker: true,
                tickers: true,
                price: true,
                prices: true,
                candles: true,
                openOrders: true,
                tradeHistory: true,
                openOrderHistory: true,
                // --- futures trading --- //
                futuresLimitOrder: true,
                futuresMarketOrder: true,
                futuresStopLimitOrder: true,
                futuresStopMarketOrder: true,
                futuresTrailingLimitOrder: false,
                futuresTrailingMarketOrder: true,
                futuresCancelOrder: true,
                futuresCancelAllOrders: true,
                futuresCloseAll: true,
                // --- futures wallet && market --- //
                fundingFee: true,
                fundingFees: true,
                futuresRecentTrades: true,
                futuresBalance: true,
                futuresBalances: true,
                futuresExposure: true,
                futuresExposures: true,
                futuresOrderBook: true,
                futuresOrderBooks: true,
                futuresTicker: true,
                futuresTickers: true,
                futuresPrice: true,
                futuresPrices: true,
                futuresCandles: true,
                futuresTradeHistory: true,
                futuresOpenOrders: true,
                futuresOpenOrdersHistory: true,
                setLeverage: true,
                setPositionMode: true,
                setMarginMode: true,
                // --- websocket spot --- //
                tradeStream: undefined,
                klineStream: undefined,
                orderBookStream: undefined,
                balanceStream: undefined,
                orderStream: undefined,
                orderUpdateStream: undefined,
                executionStream: undefined,
                // --- websocket futures --- //
                futuresTradeStream: undefined,
                futuresKlineStream: undefined,
                futuresOrderBookStream: undefined,
                futuresBalanceStream: undefined,
                futuresPositionStream: undefined,
                futuresOrderStream: undefined,
                futuresOrderUpdateStream: undefined,
                futuresExecutionStream: undefined,
            },
            urls: {
                base: {
                    sV0: 'https://api.binance.com/',
                    sV1: 'https://api1.binance.com/',
                    sV2: 'https://api2.binance.com/',
                    sV3: 'https://api3.binance.com/',
                    sV4: 'https://api4.binance.com/',
                    fV0: 'https://fapi.binance.com/',
                    ssV0: 'wss://stream.binance.com:9443/ws/',
                    ssv1: 'wss://stream1.binance.com:443/ws/',
                    sfV0: 'wss://fstream.binance.com/ws/',
                },
                sandbox: {
                    sV0: 'https://testnet.binance.vision/api/',
                    fV0: 'https://testnet.binancefuture.com/',
                    sfV0: 'wss://stream.binancefuture.com/',
                },
            },
            endpoints: {
                public: {
                    get: {
                        'sapi/v1/system/status': { versions: ['sV0'], cost: 1 },
                        'api/v3/exchangeInfo': { versions: ['sV0'], cost: 20 },
                        'api/v3/time': { versions: ['sV0'], cost: 1 },
                        'fapi/v1/exchangeInfo': { versions: ['fV0'], cost: 1 },
                        'api/v3/trades': { versions: ['sV0'], cost: 10 },
                        'api/v3/ticker/tradingDay': { versions: ['sV4'], cost: 4 },
                        'api/v3/ticker/price': { versions: ['sV4'], cost: 1 },
                        'api/v3/depth': {
                            versions: ['sV0'],
                            cost: {
                                '1-100': 5,
                                '101-500': 25,
                                '501-1000': 50,
                                '1001-5000': 250,
                            },
                        },
                        'api/v3/ticker/bookTicker': { versions: ['sV0'], cost: 4 },
                        'api/v3/klines': { versions: ['sV0'], cost: 2 },
                        'fapi/v1/klines': {
                            versions: ['fV0'],
                            cost: {
                                '1-100': 1,
                                '101-500': 2,
                                '501-1000': 5,
                                '>1000': 10,
                            },
                        },
                        'fapi/v1/ticker/24hr': { versions: ['fV0'], cost: 1 },
                        'fapi/v2/ticker/price': { versions: ['fV0'], cost: 1 },
                        'fapi/v1/ticker/bookTicker': { versions: ['fV0'], cost: 0 },
                        'fapi/v1/depth': {
                            versions: ['fV0'],
                            cost: {
                                '1-100': 2,
                                '101-500': 10,
                                '501-1000': 20,
                            },
                        },
                        'fapi/v1/trades': { versions: ['fV0'], cost: 5 },
                        'fapi/v1/fundingInfo': { versions: ['fV0'], cost: 0 },
                    },
                    post: {},
                    put: {},
                    delete: {},
                },
                private: {
                    get: {
                        'api/v3/account/commission': { versions: ['sV0'], cost: 20 },
                        'api/v3/openOrders': { versions: ['sV0'], cost: [6, 80] }, // 6 for a single symbol; 80 when the symbol parameter is omitted;
                        'api/v3/account': { versions: ['sV0'], cost: 20 },
                        'fapi/v1/commissionRate': { versions: ['fV0'], cost: 20 },
                        'fapi/v2/balance': { versions: ['fV0'], cost: 5 },
                        'fapi/v2/positionRisk': { versions: ['fV0'], cost: 5 },
                        'fapi/v1/openOrders': { versions: ['fV0'], cost: [1, 40] },
                        'api/v3/myTrades': { versions: ['sV0'], cost: 20 },
                        'fapi/v1/userTrades': { versions: ['fV0'], cost: 5 },
                        'fapi/v1/positionSide/dual': { versions: ['fV0'], cost: 30 },
                        'sapi/v1/capital/config/getall': { versions: ['sV0'], cost: 10 },
                    },
                    post: {
                        'sapi/v3/asset/getUserAsset': { versions: ['sV0'], cost: 5 },
                        'api/v3/order': { versions: ['sV0'], cost: 0 },
                        'api/v3/userDataStream': { versions: ['sV0'], cost: 2 },
                        'fapi/v1/listenKey': { versions: ['fV0'], cost: 1 },
                        'fapi/v1/order': { versions: ['fV0'], cost: 0 },
                        'fapi/v1/leverage': { versions: ['fV0'], cost: 1 },
                        'fapi/v1/marginType': { versions: ['fV0'], cost: 1 },
                        'fapi/v1/positionSide/dual': { versions: ['fV0'], cost: 1 },
                    },
                    put: {
                        'api/v3/userDataStream': { versions: ['sV0'], cost: 2 },
                        'fapi/v1/listenKey': { versions: ['fV0'], cost: 1 },
                    },
                    delete: {
                        'api/v3/order': { versions: ['sV0'], cost: 1 },
                        'api/v3/openOrders': { versions: ['sV0'], cost: 1 },
                        'api/v3/userDataStream': { versions: ['sV0'], cost: 2 },
                        'fapi/v1/order': { versions: ['fV0'], cost: 1 },
                        'fapi/v1/allOpenOrders': { versions: ['fV0'], cost: 20 },
                    },
                },
            },
            ws: {
                public: {
                    trade: { base: ['ssV0'], weight: 1 },
                    candle: { base: ['ssV0'], weight: 1 },
                    orderBook: { base: ['ssV0'], weight: 1 },
                    futuresTrade: { base: ['sfV0'], weight: 1 },
                    futuresCandle: { base: ['sfV0'], weight: 1 },
                    futuresOrderBook: { base: ['sfV0'], weight: 1 },
                },
                private: {
                    balance: { base: ['ssV0'], weight: 1 },
                    order: { base: ['ssV0'], weight: 1 },
                    orderUpdate: { base: ['ssV0'], weight: 1 },
                    execution: { base: ['ssV0'], weight: 1 },
                    futuresExposure: { base: ['sfV0'], weight: 1 },
                    futuresBalance: { base: ['sfV0'], weight: 1 },
                    futuresOrder: { base: ['sfV0'], weight: 1 },
                    futuresOrderUpdate: { base: ['sfV0'], weight: 1 },
                    futuresExecution: { base: ['sfV0'], weight: 1 },
                },
            },
            timeframes: {
                spot: {
                    '1s': '1s',
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1h',
                    '2h': '2h',
                    '4h': '4h',
                    '6h': '6h',
                    '8h': '8h',
                    '12h': '12h',
                    '1d': '1d',
                    '3d': '3d',
                    '1w': '1w',
                    '1M': '1M',
                },
                futures: {
                    '1m': '1m',
                    '3m': '3m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1h',
                    '2h': '2h',
                    '4h': '4h',
                    '6h': '6h',
                    '8h': '8h',
                    '12h': '12h',
                    '1d': '1d',
                    '3d': '3d',
                    '1w': '1w',
                    '1M': '1M',
                },
            },
            listenKeys: {
                spot: undefined,
                futures: undefined,
                delievery: undefined,
            },
        });
    }
    sign(url, method = 'GET', body = undefined, isPrivate = false) {
        method = method.toUpperCase();
        let headers = {};
        let queryString = '';
        if (body !== undefined && typeof body !== 'string') {
            queryString = Object.entries(body)
                .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
                .join('&');
        }
        const isUserDataStream = url.includes('userDataStream') ? true : false;
        if (isPrivate) {
            headers['X-MBX-APIKEY'] = this.apiKey;
            if (!isUserDataStream) {
                const signature = hmacSha256(this.apiSecret, queryString);
                queryString += `&signature=${signature}`;
            }
        }
        if (method.toUpperCase() === 'POST') {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            body = queryString;
        } else if (method.toUpperCase() === 'GET' || (method.toUpperCase() === 'DELETE' && queryString.length > 0)) {
            url += url.includes('?') ? `&${queryString}` : `?${queryString}`;
            body = undefined;
        } else if (method.toUpperCase() === 'PUT') {
            url += url.includes('?') ? `&${queryString}` : `?${queryString}`;
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
    parseMarkets(exchangeInfo) {
        // SPOT
        // {
        //     "timezone": "UTC",
        //     "serverTime": 1565246363776,
        //     "rateLimits": [
        //       {
        //         //These are defined in the `ENUM definitions` section under `Rate Limiters (rateLimitType)`.
        //         //All limits are optional
        //       }
        //     ],
        //     "exchangeFilters": [
        //       //These are the defined filters in the `Filters` section.
        //       //All filters are optional.
        //     ],
        //     "symbols": [
        //       {
        //         "symbol": "ETHBTC",
        //         "status": "TRADING",
        //         "baseAsset": "ETH",
        //         "baseAssetPrecision": 8,
        //         "quoteAsset": "BTC",
        //         "quotePrecision": 8,
        //         "quoteAssetPrecision": 8,
        //         "orderTypes": [
        //           "LIMIT",
        //           "LIMIT_MAKER",
        //           "MARKET",
        //           "STOP_LOSS",
        //           "STOP_LOSS_LIMIT",
        //           "TAKE_PROFIT",
        //           "TAKE_PROFIT_LIMIT"
        //         ],
        //         "icebergAllowed": true,
        //         "ocoAllowed": true,
        //         "quoteOrderQtyMarketAllowed": true,
        //         "allowTrailingStop": false,
        //         "cancelReplaceAllowed": false,
        //         "isSpotTradingAllowed": true,
        //         "isMarginTradingAllowed": true,
        //         "filters": [
        //     {
        //         "filterType": "PRICE_FILTER",
        //         "minPrice": "0.00001000",
        //         "maxPrice": "922327.00000000",
        //         "tickSize": "0.00001000"
        //     },
        //     {
        //         "filterType": "LOT_SIZE",
        //         "minQty": "0.00010000",
        //         "maxQty": "100000.00000000",
        //         "stepSize": "0.00010000"
        //     },
        //     {
        //         "filterType": "ICEBERG_PARTS",
        //         "limit": 10
        //     },
        //     {
        //         "filterType": "MARKET_LOT_SIZE",
        //         "minQty": "0.00000000",
        //         "maxQty": "3056.29545439",
        //         "stepSize": "0.00000000"
        //     },
        //     {
        //         "filterType": "TRAILING_DELTA",
        //         "minTrailingAboveDelta": 10,
        //         "maxTrailingAboveDelta": 2000,
        //         "minTrailingBelowDelta": 10,
        //         "maxTrailingBelowDelta": 2000
        //     },
        //     {
        //         "filterType": "PERCENT_PRICE_BY_SIDE",
        //         "bidMultiplierUp": "5",
        //         "bidMultiplierDown": "0.2",
        //         "askMultiplierUp": "5",
        //         "askMultiplierDown": "0.2",
        //         "avgPriceMins": 5
        //     },
        //     {
        //         "filterType": "NOTIONAL",
        //         "minNotional": "0.00010000",
        //         "applyMinToMarket": true,
        //         "maxNotional": "9000000.00000000",
        //         "applyMaxToMarket": false,
        //         "avgPriceMins": 5
        //     },
        //     {
        //         "filterType": "MAX_NUM_ORDERS",
        //         "maxNumOrders": 200
        //     },
        //     {
        //         "filterType": "MAX_NUM_ALGO_ORDERS",
        //         "maxNumAlgoOrders": 5
        //     }
        // ],
        //         "permissions": [],
        //         "permissionSets": [
        //           [
        //             "SPOT",
        //             "MARGIN"
        //           ]
        //         ],
        //         "defaultSelfTradePreventionMode": "NONE",
        //         "allowedSelfTradePreventionModes": [
        //           "NONE"
        //         ]
        //       }
        //     ]
        //   }
        // FUTURES
        // {
        //     "exchangeFilters": [],
        //     "rateLimits": [
        //         {
        //             "interval": "MINUTE",
        //             "intervalNum": 1,
        //             "limit": 2400,
        //             "rateLimitType": "REQUEST_WEIGHT"
        //         },
        //         {
        //             "interval": "MINUTE",
        //             "intervalNum": 1,
        //             "limit": 1200,
        //             "rateLimitType": "ORDERS"
        //         }
        //     ],
        //     "serverTime": 1565613908500,    // Ignore please. If you want to check current server time, please check via "GET /fapi/v1/time"
        //     "assets": [ // assets information
        //         {
        //             "asset": "BUSD",
        //             "marginAvailable": true, // whether the asset can be used as margin in Multi-Assets mode
        //             "autoAssetExchange": 0 // auto-exchange threshold in Multi-Assets margin mode
        //         },
        //         {
        //             "asset": "USDT",
        //             "marginAvailable": true,
        //             "autoAssetExchange": 0
        //         },
        //         {
        //             "asset": "BNB",
        //             "marginAvailable": false,
        //             "autoAssetExchange": null
        //         }
        //     ],
        //     "symbols": [
        //         {
        //             "symbol": "BLZUSDT",
        //             "pair": "BLZUSDT",
        //             "contractType": "PERPETUAL",
        //             "deliveryDate": 4133404800000,
        //             "onboardDate": 1598252400000,
        //             "status": "TRADING",
        //             "maintMarginPercent": "2.5000",   // ignore
        //             "requiredMarginPercent": "5.0000",  // ignore
        //             "baseAsset": "BLZ",
        //             "quoteAsset": "USDT",
        //             "marginAsset": "USDT",
        //             "pricePrecision": 5,    // please do not use it as tickSize
        //             "quantityPrecision": 0, // please do not use it as stepSize
        //             "baseAssetPrecision": 8,
        //             "quotePrecision": 8,
        //             "underlyingType": "COIN",
        //             "underlyingSubType": ["STORAGE"],
        //             "settlePlan": 0,
        //             "triggerProtect": "0.15", // threshold for algo order with "priceProtect"
        //             "filters": [
        //                 {
        //                     "filterType": "PRICE_FILTER",
        //                     "maxPrice": "300",
        //                     "minPrice": "0.0001",
        //                     "tickSize": "0.0001"
        //                 },
        //                 {
        //                     "filterType": "LOT_SIZE",
        //                     "maxQty": "10000000",
        //                     "minQty": "1",
        //                     "stepSize": "1"
        //                 },
        //                 {
        //                     "filterType": "MARKET_LOT_SIZE",
        //                     "maxQty": "590119",
        //                     "minQty": "1",
        //                     "stepSize": "1"
        //                 },
        //                 {
        //                     "filterType": "MAX_NUM_ORDERS",
        //                     "limit": 200
        //                 },
        //                 {
        //                     "filterType": "MAX_NUM_ALGO_ORDERS",
        //                     "limit": 100
        //                 },
        //                 {
        //                     "filterType": "MIN_NOTIONAL",
        //                     "notional": "5.0",
        //                 },
        //                 {
        //                     "filterType": "PERCENT_PRICE",
        //                     "multiplierUp": "1.1500",
        //                     "multiplierDown": "0.8500",
        //                     "multiplierDecimal": 4
        //                 }
        //             ],
        //             "OrderType": [
        //                 "LIMIT",
        //                 "MARKET",
        //                 "STOP",
        //                 "STOP_MARKET",
        //                 "TAKE_PROFIT",
        //                 "TAKE_PROFIT_MARKET",
        //                 "TRAILING_STOP_MARKET"
        //             ],
        //             "timeInForce": [
        //                 "GTC",
        //                 "IOC",
        //                 "FOK",
        //                 "GTX"
        //             ],
        //             "liquidationFee": "0.010000",   // liquidation fee rate
        //             "marketTakeBound": "0.30",  // the max price difference rate( from mark price) a market order can make
        //         }
        //     ],
        //     "timezone": "UTC"
        // }
        const symbols = this.safeValue(exchangeInfo, 'symbols');
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const id = this.safeString(symbol, 'symbol');
            const socketId = id.toLowerCase();
            const assetType = this.hasProp(symbol, ['contractType']) ? 'futures' : 'spot';
            const baseAsset = this.safeString(symbol, 'baseAsset');
            const quoteAsset = this.safeString(symbol, 'quoteAsset');
            const filter = this.safeValue(symbol, 'filters');
            const priceFilter = filter.find(f => this.safeString(f, 'filterType') === 'PRICE_FILTER');
            const lotSize = filter.find(f => this.safeString(f, 'filterType') === 'LOT_SIZE');
            const notional = filter.find(f => this.safeString(f, 'filterType') === 'NOTIONAL');
            const minNotional = filter.find(f => this.safeString(f, 'filterType') === 'MIN_NOTIONAL')
            const pricePrecision = this.decimalPlaces(this.safeString(priceFilter, 'tickSize'));
            const amountPrecision = this.decimalPlaces(this.safeString(lotSize, 'stepSize'));
            const minBaseLotSize = this.safeString(lotSize,  'minQty', null);
            const maxBaseLotSize = this.safeString(lotSize, 'maxQty', null);
            let minQuoteLotSize = undefined;
            let maxQuoteLotSize = undefined;
            if(notional){ // SPOT
                minQuoteLotSize = this.safeString(notional, 'minNotional', null);
                maxQuoteLotSize = this.safeString(notional, 'maxNotional', null);
            }else{
                minQuoteLotSize = this.safeString(minNotional, 'notional', null);
                maxQuoteLotSize = null // not available for futures
            }
            const input = `${baseAsset}/${quoteAsset}`;
            // Initialize instruments
            if (!this.markets[assetType]) {
                this.markets[assetType] = {};
            }
            if(!this.markets['parsed']) {
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
        await this.loadTimeDifference();
        if (Object.keys(this.markets).length > 0) return; // already loaded
        const promisesAry = [];
        promisesAry.push(this.getApiV3ExchangeInfo());
        promisesAry.push(this.getFapiV1ExchangeInfo());
        const promises = await Promise.all(promisesAry);
        for (let i = 0; i < promises.length; i++) {
            const response = promises[i];
            if (this.isValid(response.data)) {
                this.parseMarkets(response.data);
            }
        }
    }
    async loadTimeDifference() {
        const serverTime = await this.getApiV3Time();
        this.timeDifference = Date.now() - serverTime;
    }
    parseCommissionRate(commission, symbol) {
        // SPOT
        // {
        //     symbol: 'BTCUSDT',
        //     standardCommission: {
        //       maker: '0.00100000',
        //       taker: '0.00100000',
        //       buyer: '0.00000000',
        //       seller: '0.00000000'
        //     },
        //     taxCommission: {
        //       maker: '0.00000000',
        //       taker: '0.00000000',
        //       buyer: '0.00000000',
        //       seller: '0.00000000'
        //     },
        //     discount: {
        //       enabledForAccount: true,
        //       enabledForSymbol: true,
        //       discountAsset: 'BNB',
        //       discount: '0.75000000'
        //     }
        //   }
        // FUTURES
        // {
        //     symbol: 'BTCUSDT',
        //     makerCommissionRate: '0.000200',
        //     takerCommissionRate: '0.000500'
        //   }
        if (this.isObject(commission)) {
            const standardCommission = this.define(commission, ['standardCommission']);
            if (standardCommission) {
                return this.safeCommissionRate({
                    symbol: symbol,
                    maker: this.define(standardCommission, ['maker']),
                    taker: this.define(standardCommission, ['taker']),
                });
            }
            return {
                symbol: symbol,
                maker: this.safeString(commission, ['makerCommissionRate']),
                taker: this.safeString(commission, ['takerCommissionRate']),
            };
        } else if (this.isArray(commission)) {
            return commission.map(c => this.parseCommissionRate(c));
        }
    }
    parseSetLeverage(response, leverage) {
        if (this.isObject(response) && this.hasProp(response, ['symbol'])) {
            const symbol = this.safeSymbols(this.safeString(response, ['symbol']), undefined, false, true);
            return { symbol: symbol, leverage: leverage };
        }
    }
    parseTrade(trades) {
        // SPOT
        // [
        //     {
        //       "id": 28457,
        //       "price": "4.00000100",
        //       "qty": "12.00000000",
        //       "quoteQty": "48.000012",
        //       "time": 1499865549590,
        //       "isBuyerMaker": true,
        //       "isBestMatch": true
        //     }
        //   ]
        // FUTURES
        // [
        //     {
        //       "id": 28457,
        //       "price": "4.00000100",
        //       "qty": "12.00000000",
        //       "quoteQty": "48.00",
        //       "time": 1499865549590,
        //       "isBuyerMaker": true,
        //     }
        //   ]
        if (this.isObject(trades)) {
            return this.safeTrade({
                price: this.define(trades, ['price']),
                qty: this.define(trades, ['qty']),
                quoteQty: this.define(trades, ['quoteQty']),
                timestamp: this.define(trades, ['time']),
                side: this.define(trades, ['isBuyerMaker']) ? 'SELL' : 'BUY',
            });
        } else if (this.isArray(trades)) {
            return trades.map(t => this.parseTrade(t));
        }
    }
    parseTradeHistory(myTrades) {
        // SPOT
        // [
        //     {
        //       "symbol": "BNBBTC",
        //       "id": 28457,
        //       "orderId": 100234,
        //       "orderListId": -1, //Unless OCO, the value will always be -1
        //       "price": "4.00000100",
        //       "qty": "12.00000000",
        //       "quoteQty": "48.000012",
        //       "commission": "10.10000000",
        //       "commissionAsset": "BNB",
        //       "time": 1499865549590,
        //       "isBuyer": true,
        //       "isMaker": false,
        //       "isBestMatch": true
        //     }
        //   ]
        // FUTURES
        // [
        //     {
        //       "buyer": false,
        //       "commission": "-0.07819010",
        //       "commissionAsset": "USDT",
        //       "id": 698759,
        //       "maker": false,
        //       "orderId": 25851813,
        //       "price": "7819.01",
        //       "qty": "0.002",
        //       "quoteQty": "15.63802",
        //       "realizedPnl": "-0.91539999",
        //       "side": "SELL",
        //       "positionSide": "SHORT",
        //       "symbol": "BTCUSDT",
        //       "time": 1569514978020
        //     }
        //   ]
        if (this.isObject(myTrades)) {
            const timestamp = this.define(myTrades, ['time']);
            const symbol = this.safeSymbols(this.define(myTrades, ['symbol']), undefined, false, true);
            const orderId = this.define(myTrades, ['orderId']);
            const side = this.define(myTrades, ['side']) || this.define(myTrades, ['isBuyer']) ? 'BUY' : 'SELL';
            const isMaker = this.define(myTrades, ['isMaker', 'maker']);
            const price = this.define(myTrades, ['price']);
            const qty = this.define(myTrades, ['qty']);
            const commission = this.define(myTrades, ['commission']);
            const realizedPnl = this.define(myTrades, ['realizedPnl']) || undefined;
            return this.safeTradeHistory({
                timestamp: timestamp,
                orderId: orderId,
                symbol: symbol,
                side: side,
                price: price,
                qty: qty,
                isMaker: isMaker,
                commission: commission,
                realizedPnl: realizedPnl,
            });
        } else if (this.isArray(myTrades)) {
            return myTrades.map(t => this.parseTradeHistory(t));
        }
    }
    parseBalance(balance) {
        // SPOT
        // {
        //     "makerCommission": 15,
        //     "takerCommission": 15,
        //     "buyerCommission": 0,
        //     "sellerCommission": 0,
        //     "commissionRates": {
        //       "maker": "0.00150000",
        //       "taker": "0.00150000",
        //       "buyer": "0.00000000",
        //       "seller": "0.00000000"
        //     },
        //     "canTrade": true,
        //     "canWithdraw": true,
        //     "canDeposit": true,
        //     "brokered": false,
        //     "requireSelfTradePrevention": false,
        //     "preventSor": false,
        //     "updateTime": 123456789,
        //     "accountType": "SPOT",
        //     "balances": [
        //       {
        //         "asset": "BTC",
        //         "free": "4723846.89208129",
        //         "locked": "0.00000000"
        //       },
        //       {
        //         "asset": "LTC",
        //         "free": "4763368.68006011",
        //         "locked": "0.00000000"
        //       }
        //     ],
        //     "permissions": [
        //       "SPOT"
        //     ],
        //     "uid": 354937868
        //   }
        // FUTURES
        // [
        //     {
        //         "accountAlias": "SgsR",    // unique account code
        //         "asset": "USDT",    // asset name
        //         "balance": "122607.35137903", // wallet balance
        //         "crossWalletBalance": "23.72469206", // crossed wallet balance
        //         "crossUnPnl": "0.00000000"  // unrealized profit of crossed positions
        //         "availableBalance": "23.72469206",       // available balance
        //         "maxWithdrawAmount": "23.72469206",     // maximum amount for transfer out
        //         "marginAvailable": true,    // whether the asset can be used as margin in Multi-Assets mode
        //         "updateTime": 1617939110373
        //     }
        // ]
        if (this.isObject(balance)) {
            return this.safeBalance({
                symbol: this.define(balance, ['asset']),
                wallet: this.define(balance, ['balance']),
                available: this.define(balance, ['free', 'availableBalance']),
                frozen: this.define(balance, ['locked']),
            });
        } else if (this.isArray(balance)) {
            return balance.map(b => this.parseBalance(b));
        }
    }
    parseTicker(ticker) {
        // SPOT
        // [
        //     {
        //       "symbol": "BNBBTC",
        //       "priceChange": "-94.99999800",
        //       "priceChangePercent": "-95.960",
        //       "weightedAvgPrice": "0.29628482",
        //       "prevClosePrice": "0.10002000",
        //       "lastPrice": "4.00000200",
        //       "lastQty": "200.00000000",
        //       "bidPrice": "4.00000000",
        //       "bidQty": "100.00000000",
        //       "askPrice": "4.00000200",
        //       "askQty": "100.00000000",
        //       "openPrice": "99.00000000",
        //       "highPrice": "100.00000000",
        //       "lowPrice": "0.10000000",
        //       "volume": "8913.30000000",
        //       "quoteVolume": "15.30000000",
        //       "openTime": 1499783499040,
        //       "closeTime": 1499869899040,
        //       "firstId": 28385,   // First tradeId
        //       "lastId": 28460,    // Last tradeId
        //       "count": 76         // Trade count
        //     }
        //   ]
        // FUTURES
        // [
        //     {
        //         "symbol": "BTCUSDT",
        //         "priceChange": "-94.99999800",
        //         "priceChangePercent": "-95.960",
        //         "weightedAvgPrice": "0.29628482",
        //         "lastPrice": "4.00000200",
        //         "lastQty": "200.00000000",
        //         "openPrice": "99.00000000",
        //         "highPrice": "100.00000000",
        //         "lowPrice": "0.10000000",
        //         "volume": "8913.30000000",
        //         "quoteVolume": "15.30000000",
        //         "openTime": 1499783499040,
        //         "closeTime": 1499869899040,
        //         "firstId": 28385,   // First tradeId
        //         "lastId": 28460,    // Last tradeId
        //         "count": 76         // Trade count
        //     }
        // ]
        if (this.isObject(ticker)) {
            const symbol = this.safeSymbols(this.define(ticker, ['symbol']), undefined, false, true);
            const open = this.define(ticker, ['openPrice']);
            const high = this.define(ticker, ['highPrice']);
            const low = this.define(ticker, ['lowPrice']);
            const close = this.define(ticker, ['lastPrice']);
            const volume = this.define(ticker, ['volume']);
            return this.safeTicker({
                symbol: symbol,
                open: open,
                high: high,
                low: low,
                close: close,
                volume: volume,
            });
        } else if (this.isArray(ticker)) {
            return ticker.map(t => this.parseTicker(t));
        }
    }
    parseOrderBook(orderBook, symbol) {
        // SPOT
        // {
        //     "lastUpdateId": 1027024,
        //     "bids": [
        //       [
        //         "4.00000000",     // PRICE
        //         "431.00000000"    // QTY
        //       ]
        //     ],
        //     "asks": [
        //       [
        //         "4.00000200",
        //         "12.00000000"
        //       ]
        //     ]
        //   }
        // FUTURES
        // {
        //     "lastUpdateId": 1027024,
        //     "E": 1589436922972,   // Message output time
        //     "T": 1589436922959,   // Transaction time
        //     "bids": [
        //       [
        //         "4.00000000",     // PRICE
        //         "431.00000000"    // QTY
        //       ]
        //     ],
        //     "asks": [
        //       [
        //         "4.00000200",
        //         "12.00000000"
        //       ]
        //     ]
        //   }
        const timestamp = this.define(orderBook, ['T']) ? orderBook.T : this.now();
        return this.safeOrderBook(orderBook, symbol, timestamp);
    }
    parseOrderBooks(orderBooks, symbols = []) {
        // SPOT
        // [
        //   {
        //     "symbol": "LTCBTC",
        //     "bidPrice": "4.00000000",
        //     "bidQty": "431.00000000",
        //     "askPrice": "4.00000200",
        //     "askQty": "9.00000000"
        //   },
        //   {
        //     "symbol": "ETHBTC",
        //     "bidPrice": "0.07946700",
        //     "bidQty": "9.00000000",
        //     "askPrice": "100000.00000000",
        //     "askQty": "1000.00000000"
        //   }
        // ]
        // FUTURES
        // [
        //     {
        //         "lastUpdateId": 1027024,
        //         "symbol": "BTCUSDT",
        //         "bidPrice": "4.00000000",
        //         "bidQty": "431.00000000",
        //         "askPrice": "4.00000200",
        //         "askQty": "9.00000000",
        //         "time": 1589437530011
        //     }
        // ]
        if (this.isObject(orderBooks)) {
            const symbol = this.safeSymbols(this.define(orderBooks, ['symbol']), undefined, false, true);
            const bestBidPrice = this.define(orderBooks, ['bidPrice']);
            const bestBidQty = this.define(orderBooks, ['bidQty']);
            const bestAskPrice = this.define(orderBooks, ['askPrice']);
            const bestAskQty = this.define(orderBooks, ['askQty']);
            const timestamp = this.hasProp(orderBooks, ['time']) ? orderBooks.time : this.now();
            const tickerOrderBook = {
                symbol: symbol,
                bestBidPrice: bestBidPrice,
                bestBidQty: bestBidQty,
                bestAskPrice: bestAskPrice,
                bestAskQty: bestAskQty,
                timestamp: timestamp,
            };
            return this.safeOrderBooks(tickerOrderBook);
        } else if (this.isArray(orderBooks)) {
            return orderBooks.map(ob => this.parseOrderBooks(ob));
        }
    }
    parsePrice(prices) {
        if (this.isObject(prices)) {
            return this.safePrice({
                symbol: this.safeSymbols(this.define(prices, ['symbol']), undefined, false, true),
                price: this.define(prices, ['price']),
            });
        } else if (this.isArray(prices)) {
            return prices.map(p => this.parsePrice(p));
        }
    }
    parseCandle(candles) {
        if (this.isArray(candles)) {
            return candles.map(candle => {
                return this.safeCandle({
                    openTime: candle[0],
                    open: candle[1],
                    high: candle[2],
                    low: candle[3],
                    close: candle[4],
                    volume: candle[5],
                    closeTime: candle[6],
                });
            });
        } else if (this.isObject(candles)) {
            return this.safeCandle({
                openTime: candles[0],
                open: candles[1],
                high: candles[2],
                low: candles[3],
                close: candles[4],
                volume: candles[5],
                closeTime: candles[6],
            });
        }
    }
    parseCancelOrder(response) {
        if (this.isObject(response) && this.hasProp(response, ['orderId'])) {
            // cancel response
            const orderId = this.safeString(response, 'orderId');
            return { id: orderId, status: 'success' };
        } else {
            // cancelAll response
            return { msg: 'cancel all success' };
        }
    }
    parseOpenOrders(openOrders) {
        // SPOT
        // [
        //     {
        //       "symbol": "LTCBTC",
        //       "orderId": 1,
        //       "orderListId": -1, //Unless OCO, the value will always be -1
        //       "clientOrderId": "myOrder1",
        //       "price": "0.1",
        //       "origQty": "1.0",
        //       "executedQty": "0.0",
        //       "cummulativeQuoteQty": "0.0",
        //       "status": "NEW",
        //       "timeInForce": "GTC",
        //       "type": "LIMIT",
        //       "side": "BUY",
        //       "stopPrice": "0.0",
        //       "icebergQty": "0.0",
        //       "time": 1499827319559,
        //       "updateTime": 1499827319559,
        //       "isWorking": true,
        //       "workingTime": 1499827319559,
        //       "origQuoteOrderQty": "0.000000",
        //       "selfTradePreventionMode": "NONE"
        //     }
        //   ]
        // FUTURES
        // [
        //     {
        //       "avgPrice": "0.00000",
        //       "clientOrderId": "abc",
        //       "cumQuote": "0",
        //       "executedQty": "0",
        //       "orderId": 1917641,
        //       "origQty": "0.40",
        //       "origType": "TRAILING_STOP_MARKET",
        //       "price": "0",
        //       "reduceOnly": false,
        //       "side": "BUY",
        //       "positionSide": "SHORT",
        //       "status": "NEW",
        //       "stopPrice": "9300",                // please ignore when order type is TRAILING_STOP_MARKET
        //       "closePosition": false,   // if Close-All
        //       "symbol": "BTCUSDT",
        //       "time": 1579276756075,              // order time
        //       "timeInForce": "GTC",
        //       "type": "TRAILING_STOP_MARKET",
        //       "activatePrice": "9020",            // activation price, only return with TRAILING_STOP_MARKET order
        //       "priceRate": "0.3",                 // callback rate, only return with TRAILING_STOP_MARKET order
        //       "updateTime": 1579276756075,        // update time
        //       "workingType": "CONTRACT_PRICE",
        //       "priceProtect": false,            // if conditional order trigger is protected
        //       "priceMatch": "NONE",              //price match mode
        //       "selfTradePreventionMode": "NONE", //self trading preventation mode
        //       "goodTillDate": 0      //order pre-set auot cancel time for TIF GTD order
        //     }
        //   ]
        if (this.isArray(openOrders)) {
            return openOrders.map(order => this.parseOpenOrders(order));
        } else if (this.isObject(openOrders)) {
            let type = this.define(openOrders, ['type']);
            if (type === 'TAKE_PROFIT_LIMIT' || type === 'TAKE_PROFIT') {
                type = 'TP';
            } else if (type === 'STOP_LOSS_LIMIT' || type === 'STOP_LOSS') {
                type = 'SL';
            } else if (type === 'TRAILING_STOP_MARKET') {
                type = 'TRAILING';
            }
            const timestamp = this.define(openOrders, ['time']);
            const id = this.define(openOrders, ['orderId']);
            const symbol = this.safeSymbols(this.define(openOrders, ['symbol']), undefined, false, true);
            const price = this.define(openOrders, ['price']);
            const qty = this.define(openOrders, ['origQty']);
            const executedQty = this.define(openOrders, ['executedQty']);
            const tif = this.define(openOrders, ['timeInForce']);
            const side = this.define(openOrders, ['side']);
            const closePosition = this.define(openOrders, ['closePosition']);
            const reduceOnly = this.define(openOrders, ['reduceOnly']);
            const order = {
                timestamp: timestamp,
                id: id,
                symbol: symbol,
                price: price,
                qty: qty,
                executedQty: executedQty,
                type: type,
                tif: tif,
                side: side,
                timestamp: timestamp,
                closePosition: closePosition,
                reduceOnly: reduceOnly,
            };
            return this.safeOrder(order);
        }
    }
    parseExposure(exposures) {
        // [
        //     {
        //         "symbol": "BTCUSDT",
        //         "positionAmt": "0.001",
        //         "entryPrice": "22185.2",
        //         "breakEvenPrice": "0.0",
        //         "markPrice": "21123.05052574",
        //         "unRealizedProfit": "-1.06214947",
        //         "liquidationPrice": "19731.45529116",
        //         "leverage": "4",
        //         "maxNotionalValue": "100000000",
        //         "marginType": "cross",
        //         "isolatedMargin": "0.00000000",
        //         "isAutoAddMargin": "false",
        //         "positionSide": "LONG",
        //         "notional": "21.12305052",
        //         "isolatedWallet": "0",
        //         "updateTime": 1655217461579
        //     },
        //     {
        //         "symbol": "BTCUSDT",
        //         "positionAmt": "0.000",
        //         "entryPrice": "0.0",
        //         "breakEvenPrice": "0.0",
        //         "markPrice": "21123.05052574",
        //         "unRealizedProfit": "0.00000000",
        //         "liquidationPrice": "0",
        //         "leverage": "4",
        //         "maxNotionalValue": "100000000",
        //         "marginType": "cross",
        //         "isolatedMargin": "0.00000000",
        //         "isAutoAddMargin": "false",
        //         "positionSide": "SHORT",
        //         "notional": "0",
        //         "isolatedWallet": "0",
        //         "updateTime": 0
        //     }
        // ]
        if (this.isArray(exposures)) {
            return exposures.map(exposure => this.parseExposure(exposure));
        } else if (this.isObject(exposures)) {
            let positionSide = this.define(exposures, ['positionSide']);
            if (positionSide === 'BOTH') {
                if (this.define(exposures, ['entryPrice']) < this.define(exposures, ['breakEvenPrice'])) {
                    positionSide = 'LONG';
                } else {
                    positionSide = 'SHORT';
                }
            }
            return this.safeExposure({
                symbol: this.safeSymbols(this.define(exposures, ['symbol']), undefined, false, true),
                qty: this.define(exposures, ['positionAmt']),
                entryPrice: this.define(exposures, ['entryPrice']),
                positionSide: positionSide,
                leverage: this.define(exposures, ['leverage']),
                notional: this.define(exposures, ['notional']),
                liquidPrice: this.define(exposures, ['liquidationPrice']),
                marginType: this.define(exposures, ['marginType']),
                unRealizedPnL: this.define(exposures, ['unRealizedProfit']),
            });
        }
    }
    parseOrder(order) {
        // SPOT
        // {
        //     "symbol": "BTCUSDT",
        //     "orderId": 28,
        //     "orderListId": -1, //Unless OCO, value will be -1
        //     "clientOrderId": "6gCrw2kRUAF9CvJDGP16IP",
        //     "transactTime": 1507725176595,
        //     "price": "0.00000000",
        //     "origQty": "10.00000000",
        //     "executedQty": "10.00000000",
        //     "cummulativeQuoteQty": "10.00000000",
        //     "status": "FILLED",
        //     "timeInForce": "GTC",
        //     "type": "MARKET",
        //     "side": "SELL",
        //     "workingTime": 1507725176595,
        //     "selfTradePreventionMode": "NONE"
        //   }
        // FUTURES
        // {
        //     "clientOrderId": "testOrder",
        //     "cumQty": "0",
        //     "cumQuote": "0",
        //     "executedQty": "0",
        //     "orderId": 22542179,
        //     "avgPrice": "0.00000",
        //     "origQty": "10",
        //     "price": "0",
        //     "reduceOnly": false,
        //     "side": "BUY",
        //     "positionSide": "SHORT",
        //     "status": "NEW",
        //     "stopPrice": "9300",        // please ignore when order type is TRAILING_STOP_MARKET
        //     "closePosition": false,   // if Close-All
        //     "symbol": "BTCUSDT",
        //     "timeInForce": "GTD",
        //     "type": "TRAILING_STOP_MARKET",
        //     "origType": "TRAILING_STOP_MARKET",
        //     "activatePrice": "9020",    // activation price, only return with TRAILING_STOP_MARKET order
        //     "priceRate": "0.3",         // callback rate, only return with TRAILING_STOP_MARKET order
        //     "updateTime": 1566818724722,
        //     "workingType": "CONTRACT_PRICE",
        //     "priceProtect": false,      // if conditional order trigger is protected
        //     "priceMatch": "NONE",              //price match mode
        //     "selfTradePreventionMode": "NONE", //self trading preventation mode
        //     "goodTillDate": 1693207680000      //order pre-set auot cancel time for TIF GTD order
        // }
        const orderId = this.define(order, ['orderId']);
        const symbol = this.safeSymbols(this.define(order, ['symbol']), undefined, false, true);
        const price = this.define(order, ['price']);
        const quantity = this.define(order, ['origQty']);
        const tif = this.define(order, ['timeInForce']);
        const side = this.define(order, ['side']);
        const status = this.define(order, ['status']);
        const reduceOnly = this.define(order, ['reduceOnly']);
        const closePosition = this.define(order, ['closePosition']);
        let type = this.define(order, ['type']);
        if (type === 'TAKE_PROFIT_LIMIT' || type === 'TAKE_PROFIT') {
            type = 'TP';
        } else if (type === 'STOP_LOSS_LIMIT' || type === 'STOP_LOSS') {
            type = 'SL';
        } else if (type === 'TRAILING_STOP_MARKET') {
            type = 'TRAILING';
        }
        return this.safeOrder({
            timestamp: this.now(),
            id: orderId,
            symbol: symbol,
            price: price,
            qty: quantity,
            type: type,
            tif: tif,
            side: side,
            status: status,
            reduceOnly: reduceOnly,
            closePosition: closePosition,
        });
    }
    async checkSystemStatus() {
        let method = 'getSapiV1SystemStatus';
        const response = await this[method]();
        return response.data;
    }
    async capital() {
        // It is used to withdrawal
        let method = 'getSapiV1CapitalConfigGetall';
        const parameters = { timestamp: this.now() };
        const response = await this[method](parameters);
        return response.data;
    }
    async commissionRate(symbol) {
        await this.loadMarkets();
        let method = 'getApiV3AccountCommission';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol, timestamp: this.now() });
        const response = await this[method](parameters);
        return this.parseCommissionRate(response.data, symbol);
    }
    async recentTrades(symbol, limit) {
        await this.loadMarkets();
        let method = 'getApiV3Trades';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol, limit: limit });
        const response = await this[method](parameters);
        return this.parseTrade(response.data);
    }
    async balance(symbol) {
        await this.loadMarkets();
        let method = 'getApiV3Account';
        const parameters = { timestamp: this.now() };
        const response = await this[method](parameters);
        const allBalances = this.parseBalance(response.data.balances);
        const balance = allBalances.find(b => b.symbol === symbol && b.wallet > 0);
        return balance || {};
    }
    async balances() {
        await this.loadMarkets();
        let method = 'postSapiV3AssetGetUserAsset';
        const parameters = { timestamp: this.now() };
        const response = await this[method](parameters);
        return this.parseBalance(response.data);
    }
    async orderBook(symbol, limit) {
        await this.loadMarkets();
        let method = 'getApiV3Depth';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol, limit: limit });
        const response = await this[method](parameters);
        return this.parseOrderBook(response.data, symbol);
    }
    async orderBooks(symbols) {
        await this.loadMarkets();
        let method = 'getApiV3TickerBookTicker';
        if (this.isArray(symbols)) {
            const parameters = {};
            const parsedSymbols = this.safeSymbols(symbols, 'spot', false);
            this.extendWithObj(parameters, { symbols: JSON.stringify(parsedSymbols) });
            const response = await this[method](parameters);
            return this.parseOrderBooks(response.data);
        } else {
            throw new TypeError(this.exchange + ' ' + 'orderBooks() requires an array of symbols');
        }
    }
    async ticker(symbol) {
        await this.loadMarkets();
        let method = 'getApiV3TickerTradingDay';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol });
        const response = await this[method](parameters);
        return this.parseTicker(response.data);
    }
    async tickers(symbols) {
        await this.loadMarkets();
        let method = 'getApiV3TickerTradingDay';
        if (this.isArray(symbols)) {
            const parameters = {};
            const parsedSymbols = this.safeSymbols(symbols, 'spot', false);
            this.extendWithObj(parameters, { symbols: JSON.stringify(parsedSymbols) });
            const response = await this[method](parameters);
            return this.parseTicker(response.data);
        } else {
            throw new TypeError(this.exchange + ' ' + 'tickers() requires an array of symbols');
        }
    }
    async price(symbol) {
        await this.loadMarkets();
        let method = 'getApiV3TickerPrice';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol });
        const response = await this[method](parameters);
        return this.parsePrice(response.data);
    }
    async prices(symbols) {
        await this.loadMarkets();
        let method = 'getApiV3TickerPrice';
        const parameters = {};
        if (this.isArray(symbols)) {
            const parsedSymbols = this.safeSymbols(symbols, 'spot', true);
            this.extendWithObj(parameters, { symbols: JSON.stringify(parsedSymbols) });
        } else {
            throw new TypeError(this.exchange + ' ' + 'prices() requires an array of symbols');
        }
        const response = await this[method](parameters);
        return this.parsePrice(response.data);
    }
    async candles(symbol, timeframe, limit = 100, params = {}) {
        await this.loadMarkets();
        let method = 'getApiV3Klines';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        const parsedTimeframe = this.safeTimeframe(timeframe, 'spot', false);
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            interval: parsedTimeframe,
            limit: limit,
            startTime: this.define(params, ['startTime']),
            endTime: this.define(params, ['endTime']),
        });
        const response = await this[method](parameters);
        return this.parseCandle(response.data, timeframe);
    }
    async tradeHistory(symbol, limit, params = {}) {
        await this.loadMarkets();
        let method = 'getApiV3MyTrades';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            limit: limit,
            startTime: this.define(params, ['startTime']),
            endTime: this.define(params, ['endTime']),
            timestamp: this.now(),
        });
        const response = await this[method](parameters);
        return this.parseTradeHistory(response.data);
    }
    async openOrders(symbol) {
        await this.loadMarkets();
        let method = 'getApiV3OpenOrders';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            timestamp: this.now(),
        });
        const response = await this[method](parameters);
        return this.parseOpenOrders(response.data);
    }
    async cancelOrder(symbol, orderId) {
        await this.loadMarkets();
        let method = 'deleteApiV3Order';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            orderId: orderId,
            timestamp: this.now(),
        });
        const response = await this[method](parameters);
        return this.parseCancelOrder(response.data);
    }
    async cancelAllOrders(symbol) {
        await this.loadMarkets();
        let method = 'deleteApiV3OpenOrders';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            timestamp: this.now(),
        });
        const response = await this[method](parameters);
        return this.parseCancelOrder(response.data);
    }
    async futuresCommissionRate(symbol) {
        await this.loadMarkets();
        let method = 'getFapiV1CommissionRate';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol, timestamp: this.now() });
        const response = await this[method](parameters);
        return this.parseCommissionRate(response.data, symbol);
    }
    async futuresRecentTrades(symbol, limit) {
        await this.loadMarkets();
        let method = 'getFapiV1Trades';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol, limit: limit });
        const response = await this[method](parameters);
        return this.parseTrade(response.data);
    }
    async futuresBalance(symbol) {
        await this.loadMarkets();
        let method = 'getFapiV2Balance';
        const parameters = { timestamp: this.now() };
        const response = await this[method](parameters);
        const allBalances = this.parseBalance(response.data);
        const balance = allBalances.find(b => b.symbol === symbol);
        if (!balance) {
            throw new InvalidParameters('Balance not found for symbol: ' + symbol);
        }
        return balance;
    }
    async futuresBalances() {
        await this.loadMarkets();
        let method = 'getFapiV2Balance';
        const parameters = { timestamp: this.now() };
        const response = await this[method](parameters);
        const balances = response.data.filter(b => parseFloat(b.balance) > 0);
        return this.parseBalance(balances);
    }
    async futuresExposure(symbol) {
        await this.loadMarkets();
        let method = 'getFapiV2PositionRisk';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol, timestamp: this.now() });
        const response = await this[method](parameters);
        const exposure = this.parseExposure(response.data);
        return exposure.filter(e => e.qty != 0);
    }
    async futuresExposures() {
        await this.loadMarkets();
        let method = 'getFapiV2PositionRisk';
        const parameters = {};
        this.extendWithObj(parameters, { timestamp: this.now() });
        const response = await this[method](parameters);
        const targetExposures = response.data.filter(e => parseFloat(e.positionAmt) !== 0);
        return this.parseExposure(targetExposures);
    }
    async futuresOrderBook(symbol, limit) {
        await this.loadMarkets();
        let method = 'getFapiV1Depth';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol, limit: limit });
        const response = await this[method](parameters);
        return this.parseOrderBook(response.data, symbol);
    }
    async futuresOrderBooks(symbols) {
        await this.loadMarkets();
        let method = 'getFapiV1TickerBookTicker';
        if (this.isArray(symbols)) {
            const parsedSymbols = this.safeSymbols(symbols, 'futures', false);
            const response = await this[method]();
            const targetOrderBooks = response.data.filter(ob => parsedSymbols.includes(ob.symbol));
            return this.parseOrderBooks(targetOrderBooks);
        } else {
            throw new TypeError(this.exchange + ' ' + 'futuresOrderBooks() requires an array of symbols');
        }
    }
    async futuresTicker(symbol) {
        await this.loadMarkets();
        let method = 'getFapiV1Ticker24hr';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol });
        const response = await this[method](parameters);
        return this.parseTicker(response.data);
    }
    async futuresTickers(symbols = []) {
        await this.loadMarkets();
        let method = 'getFapiV1Ticker24hr';
        if (this.isArray(symbols)) {
            const parsedSymbols = this.safeSymbols(symbols, 'futures', false);
            const parameters = { symbols: JSON.stringify(parsedSymbols) };
            const response = await this[method](parameters);
            const targetTickers = response.data.filter(t => parsedSymbols.includes(t.symbol));
            return this.parseTicker(targetTickers);
        } else {
            throw new TypeError(this.exchange + ' ' + 'futuresTickers() requires an array of symbols');
        }
    }
    async futuresPrice(symbol) {
        await this.loadMarkets();
        let method = 'getFapiV2TickerPrice';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { symbol: parsedSymbol });
        const response = await this[method](parameters);
        return this.parsePrice(response.data);
    }
    async futuresPrices(symbols = []) {
        await this.loadMarkets();
        let method = 'getFapiV2TickerPrice';
        const parsedSymbol = this.safeSymbols(symbols, 'futures', false);
        const response = await this[method]();
        if (this.isArray(symbols)) {
            const targetSymbols = response.data.filter(s => parsedSymbol.length > 0 && parsedSymbol.some(symbol => s.symbol === symbol));
            return this.parsePrice(targetSymbols);
        }
        return this.parsePrice(response.data);
    }
    async futuresCandles(symbol, timeframe, limit = 100, params = {}) {
        await this.loadMarkets();
        let method = 'getFapiV1Klines';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        const parsedTimeframe = this.safeTimeframe(timeframe, 'spot', false);
        const parameters = {};
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            interval: parsedTimeframe,
            limit: limit,
            startTime: this.define(params, ['startTime']),
            endTime: this.define(params, ['endTime']),
        });
        const response = await this[method](parameters);
        return this.parseCandle(response.data, timeframe);
    }
    async futuresTradeHistory(symbol, limit, params = {}) {
        await this.loadMarkets();
        let method = 'getFapiV1UserTrades';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            limit: limit,
            startTime: this.define(params, ['startTime']),
            endTime: this.define(params, ['endTime']),
            timestamp: this.now(),
        });
        const response = await this[method](parameters);
        return this.parseTradeHistory(response.data);
    }
    async futuresOpenOrders(symbol, limit) {
        await this.loadMarkets();
        let method = 'getFapiV1OpenOrders';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            limit: limit,
            timestamp: this.now(),
        });
        const response = await this[method](parameters);
        return this.parseOpenOrders(response.data);
    }
    async futuresCancelorder(symbol, orderId) {
        await this.loadMarkets();
        let method = 'deleteFapiV1Order';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            orderId: orderId,
            timestamp: this.now(),
        });
        const response = await this[method](parameters);
        return this.parseCancelOrder(response.data);
    }
    async futuresCancelAllOrders(symbol) {
        await this.loadMarkets();
        let method = 'deleteFapiV1AllOpenOrders';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            timestamp: this.now(),
        });
        const response = await this[method](parameters);
        return this.parseCancelOrder(response.data);
    }
    async setLeverage(symbol, leverage) {
        await this.loadMarkets();
        let method = 'postFapiV1Leverage';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            leverage: leverage,
            timestamp: this.now(),
        });
        const response = await this[method](parameters);
        return this.parseSetLeverage(response.data, leverage);
    }
    async getPositionMode() {
        await this.loadMarkets();
        let method = 'getFapiV1PositionSideDual';
        const parameters = {};
        this.extendWithObj(parameters, { timestamp: this.now() });
        const response = await this[method](parameters);
        return response.data;
    }
    async setPositionMode(dualSidePosition) {
        await this.loadMarkets();
        let method = 'postFapiV1PositionSideDual';
        dualSidePosition = dualSidePosition.replace('-', '');
        dualSidePosition = dualSidePosition.toUpperCase();
        const positionMode = ['HEDGE', 'ONEWAY'];
        if (!positionMode.includes(dualSidePosition)) {
            throw new MalformedParameter(this.exchange + ' ' + 'setPositionMode() invalid dualSidePosition, must be HEDGE or ONEWAY');
        }
        dualSidePosition = dualSidePosition === 'HEDGE' ? true : false;
        const parameters = {};
        this.extendWithObj(parameters, {
            dualSidePosition: dualSidePosition,
            timestamp: this.now(),
        });
        const response = await this[method](parameters);
        return response.data;
    }
    async setMarginMode(symbol, marginType) {
        await this.loadMarkets();
        let method = 'postFapiV1MarginType';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        marginType = marginType.toUpperCase();
        const marginModes = ['ISOLATED', 'CROSSED'];
        if (!marginModes.includes(marginType)) {
            throw new MalformedParameter(this.exchange + ' ' + 'setMarginMode() invalid marginType, must be ISOLATED or CROSSED');
        }
        const parameters = {};
        this.extendWithObj(parameters, {
            symbol: parsedSymbol,
            marginType: marginType,
            timestamp: this.now(),
        });
        const response = await this[method](parameters);
        return response.data;
    }
    async order(symbol, side, argQty, argPrice, params = {}) {
        await this.loadMarkets();
        let method = 'postApiV3Order';
        /**
         * @method
         * @name binance#order
         * @description send a spot order
         * @see https://binance-docs.github.io/apidocs/spot/en/#new-order-trade
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
        const symbolUpper = this.safeSymbols(symbol, 'spot', false).toUpperCase();
        const sideUpper = side.toUpperCase();
        const quantity = parseFloat(argQty) ? argQty : null;
        const price = parseFloat(argPrice) ? argPrice : null;
        const tifUpper = this.hasProp(params, ['tif']) ? params.tif.toUpperCase() : null;
        const isStopOrder = this.define(params, ['isStopOrder']);
        const isTrailingOrder = this.define(params, ['isTrailingOrder']);
        const isStopLimit = this.isValid(argPrice) && this.isValid(isStopOrder);
        const isStopMarket = !this.isValid(argPrice) && this.isValid(isStopOrder);
        const isTrailingLimitOrder = this.isValid(argPrice) && this.isValid(isTrailingOrder);
        const isTrailingMarketOrder = !this.isValid(argPrice) && this.isValid(isTrailingOrder);
        const stopPrice = this.define(params, ['triggerPrice']);
        const trailingDelta = this.define(params, ['deltaPercent']);
        let type = this.define(params, ['type']) || 'LIMIT';
        if (isStopOrder) {
            if (isStopLimit) {
                type = type === 'TP' ? 'TAKE_PROFIT_LIMIT' : 'STOP_LOSS_LIMIT';
            } else if (isStopMarket) {
                type = type === 'TP' ? 'TAKE_PROFIT' : 'STOP_LOSS';
            }
        } else if (isTrailingOrder) {
            if (isTrailingLimitOrder) {
                type = type === 'TP' ? 'TAKE_PROFIT_LIMIT' : 'STOP_LOSS_LIMIT';
            } else if (isTrailingMarketOrder) {
                type = type === 'TP' ? 'TAKE_PROFIT' : 'STOP_LOSS';
            }
        }
        const parameters = {};
        this.extendWithObj(parameters, {
            symbol: symbolUpper,
            side: sideUpper,
            type: type,
            price: price,
            timeInForce: tifUpper,
            stopPrice: stopPrice,
            trailingDelta: trailingDelta,
            quantity: quantity,
            timestamp: this.now(),
        });
        //     ORDER_TYPE           Fields
        //     ---------------------------------------------------
        //     LIMIT                timeInForce, quantity, price
        //     MARKET               quantity or quoteOrderQty
        //     STOP_LOSS            quantity, stopPrice or trailingDelta
        //     STOP_LOSS_LIMIT      timeInForce, quantity, price, stopPrice or trailingDelta
        //     TAKE_PROFIT          quantity, stopPrice or trailingDelta
        //     TAKE_PROFIT_LIMIT    timeInForce, quantity, price, stopPrice or trailingDelta

        if (this.hasProp(params, ['deltaAmount'])) {
            throw new InvalidOrder(this.exchange + ' ' + 'order() deltaAmount is not supported');
        }
        if (!this.hasProp(parameters, ['symbol'])) {
            throw new EmptyParameters(this.exchange + ' ' + 'order() requires symbol parameters');
        }
        if (!this.hasProp(parameters, ['side'])) {
            throw new EmptyParameters(this.exchange + ' ' + 'order() requires side parameters');
        }
        if (type === 'LIMIT') {
            if (!this.hasProp(parameters, ['price'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'order() requires price parameter for LIMIT order');
            }
            if (!this.hasProp(parameters, ['quantity'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'order() requires quantity parameter for LIMIT order');
            }
            if (!this.hasProp(parameters, ['timeInForce'])) {
                this.extendWithKey(parameters, 'timeInForce', 'GTC'); // Set the timeInforce to default value 'GTC'
            }
        } else if (type === 'MARKET') {
            if (!this.hasProp(parameters, ['quantity', 'quoteOrderQty'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'order() requires quantity / quoteOrderQty paramter for MARKET order');
            }
        } else if (type === 'STOP_LOSS' || type === 'TAKE_PROFIT') {
            if (!this.hasProp(parameters, ['quantity'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'order() requires quantity for TP / SL order');
            }
            if (!this.hasProp(parameters, ['stopPrice'] && !this.hasProp(parameters, ['trailingDelta']))) {
                throw new InvalidOrder(this.exchange + ' ' + 'order() requires stopPrice or trailingDelta for TP / SL order');
            }
        } else if (type === 'TAKE_PROFIT_LIMIT' || type === 'STOP_LOSS_LIMIT') {
            if (!this.hasProp(parameters, ['price'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'order() requires price parameter for LIMIT order');
            }
            if (!this.hasProp(parameters, ['quantity'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'order() requires quantity parameter for LIMIT order');
            }
            if (!this.hasProp(parameters, ['timeInForce'])) {
                this.extendWithKey(parameters, 'timeInForce', 'GTC'); // Set the timeInforce to default value 'GTC'
            }
            if (!this.hasProp(parameters, ['stopPrice'] && !this.hasProp(parameters, ['trailingDelta']))) {
                throw new InvalidOrder(this.exchange + ' ' + 'order() requires stopPrice or trailingDelta for TP / SL order');
            }
        }
        const response = await this[method](parameters);
        return this.parseOrder(response.data);
    }
    async futuresOrder(symbol, side, argQty, argPrice, params = {}) {
        await this.loadMarkets();
        let method = 'postFapiV1Order';
        /**
         * @method
         * @name binance#futuresOrder
         * @description send a futures order
         * @see https://binance-docs.github.io/apidocs/futures/en/#new-order-trade
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
        const symbolUpper = this.safeSymbols(symbol, 'futures', false).toUpperCase();
        const sideUpper = side.toUpperCase();
        const quantity = parseFloat(argQty) ? argQty : null;
        const price = parseFloat(argPrice) ? argPrice : null;
        const tifUpper = this.hasProp(params, ['tif']) ? params.tif.toUpperCase() : null;
        const isStopOrder = this.define(params, ['isStopOrder']);
        const isTrailingOrder = this.define(params, ['isTrailingOrder']);
        const isStopLimit = this.isValid(argPrice) && this.isValid(isStopOrder);
        const isStopMarket = !this.isValid(argPrice) && this.isValid(isStopOrder);
        const activationPrice = this.define(params, ['triggerPrice']) ? this.isValid(isTrailingOrder) : null;
        const workingType = this.upperCase(this.define(params, ['triggerType'])) == 'MARK' ? 'MARK_PRICE' : 'CONTRACT_PRICE';
        const stopPrice = this.define(params, ['triggerPrice']);
        const callbackRate = this.define(params, ['deltaPercent', 'deltaAmount']);
        const isReduceOnly = this.define(params, ['reduceOnly']);
        const isClosePosition = this.define(params, ['closePosition']);
        const goodTillDate = this.define(params, ['goodTillDate']);
        let type = this.define(params, ['type']) || 'LIMIT';
        if (isStopOrder) {
            if (isStopLimit) {
                type = type === 'TP' ? 'TAKE_PROFIT' : 'STOP';
            } else if (isStopMarket) {
                type = type === 'TP' ? 'TAKE_PROFIT_MARKET' : 'STOP_MARKET';
            }
        } else if (isTrailingOrder) {
            type = 'TRAILING_STOP_MARKET';
        } else {
            if (this.isValid(quantity) && this.isValid(price)) {
                type = 'LIMIT';
            } else if (this.isValid(quantity) && !this.isValid(price)) {
                type = 'MARKET';
            }
        }
        const parameters = {};
        this.extendWithObj(parameters, {
            symbol: symbolUpper,
            side: sideUpper,
            type: type,
            price: price,
            timeInForce: tifUpper,
            stopPrice: stopPrice,
            quantity: quantity,
            callbackRate: callbackRate,
            workingType: workingType,
            reduceOnly: isReduceOnly,
            closePosition: isClosePosition,
            activationPrice: activationPrice,
            goodTillDate: goodTillDate,
            timestamp: this.now(),
        });
        //     ORDER_TYPE           Fields
        //     ---------------------------------------------------
        //     LIMIT                timeInForce, quantity, price
        //     MARKET               quantity
        //     STOP_LOSS            stopPrice, price, quantity
        //     STOP_LOSS_MARKET     stopPrice,
        //     TAKE_PROFIT          stopPrice, price, quantity
        //     TAKE_PROFIT_MARKET   stopPrice,
        //     TRAILING_STOP_MARKET quantity, callbackRate

        if (this.hasProp(parameters, ['closePosition', 'reduceOnly'])) {
            throw new InvalidOrder(this.exchange + ' ' + 'futuresStopLimitOrder() closePosition and reduceOnly cannot be specified at the same time');
        }
        if (this.hasProp(params, ['deltaAmount'])) {
            throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() deltaAmount is not supported');
        }
        if (!this.hasProp(parameters, ['symbol'])) {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresOrder() requires symbol parameters');
        }
        if (!this.hasProp(parameters, ['side'])) {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresOrder() requires side parameters');
        }
        if (type === 'LIMIT') {
            if (!this.hasProp(parameters, ['price'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() requires price parameter for LIMIT order');
            }
            if (!this.hasProp(parameters, ['quantity'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() requires quantity parameter for LIMIT order');
            }
            if (!this.hasProp(parameters, ['timeInForce'])) {
                this.extendWithKey(parameters, 'timeInForce', 'GTC'); // Set the timeInforce to default value 'GTC'
            }
        } else if (type === 'MARKET') {
            if (!this.hasProp(parameters, ['quantity'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() requires quantity parameter for MARKET order');
            }
        } else if (type === 'STOP_LOSS' || type === 'TAKE_PROFIT') {
            if (!this.hasProp(parameters, ['stopPrice'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() requires stopPrice parameter for STOP_LOSS or TAKE_PROFIT order');
            }
            if (!this.hasProp(parameters, ['price'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() requires price parameter for STOP_LOSS or TAKE_PROFIT order');
            }
            if (!this.hasProp(parameters, ['quantity'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() requires quantity parameter for STOP_LOSS or TAKE_PROFIT order');
            }
        } else if (type === 'STOP_LOSS_MARKET' || type === 'STOP_LOSS_MARKET') {
            if (!this.hasProp(parameters, ['quantity'])) {
                throw new InvalidOrder(
                    this.exchange + ' ' + 'futuresOrder() requires quantity parameter for STOP_LOSS_MARKET or TAKE_PROFIT_MARKET order',
                );
            }
        } else if (type === 'TRAILING_STOP_MARKET') {
            if (!this.hasProp(parameters, ['quantity'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() requires quantity parameter for TRAILING_STOP_MARKET order');
            }
            if (!this.hasProp(parameters, ['callbackRate'])) {
                throw new InvalidOrder(this.exchange + ' ' + 'futuresOrder() requires deltaPercent parameter for TRAILING_STOP_MARKET order');
            }
        }
        const response = await this[method](parameters);
        return this.parseOrder(response.data);
    }

    // -- websocket methods -- //
    async handleSocketOpen(channel, method = undefined) {
        return;
    }
    async handleSocketClose(channel, method = undefined) {
        if (this.reconnect && method.includes('balance')) {
            await this.loadWallets(assetType);
            if (this.verbose) {
                console.log('Wallets reintializing');
            }
        }
    }
    async handleSocketError(channel, method, error) {
        if (this.reconnect && method.includes('balance')) {
            await this.loadWallets(assetType);
            if (this.verbose) {
                console.log('Wallets reintializing');
            }
        }
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
            trade: this.handleTradeStream,
            candle: this.handleCandleStream,
            orderBook: this.handleOrderBookStream,
            balance: this.handleBalanceStream,
            exposure: this.handleExposureStream,
            order: this.handleOrderStream,
            orderUpdate: this.handleOrderUpdateStream,
            execution: this.handleExecutionStream,
        };
        const handler = methods[methodName];
        return handler.call(this, data);
    }
    handleStream(url, method, payload = {}) {
        const handleSocketOpen = this.handleSocketOpen.bind(this);
        const handleSocketClose = this.handleSocketClose.bind(this);
        const handleSocketMessage = this.handleSocketMessage.bind(this, method);
        const handleSocketError = this.handleSocketError.bind(this);
        return this.client(url, handleSocketOpen, handleSocketClose, handleSocketMessage, handleSocketError, payload, method);
    }
    async postListenKey() {
        let method = 'postApiV3UserDataStream';
        const response = await this[method]();
        const listenKey = response.data.listenKey;
        this.has().listenKeys['spot'] = listenKey;
        return listenKey;
    }
    async putListenKey(listenKey) {
        let method = 'putApiV3UserDataStream';
        const parameters = { listenKey: listenKey };
        const response = await this[method](parameters);
        return response.data;
    }
    async postFuturesListenKey() {
        let method = 'postFapiV1ListenKey';
        const response = await this[method]();
        const listenKey = response.data.listenKey;
        this.has().listenKeys['futures'] = listenKey;
        return listenKey;
    }
    async putFuturesListenKey() {
        let method = 'putFapiV1ListenKey';
        const response = await this[method]();
        return response.data;
    }
    async postDeliveryListenKey() {}
    async putDeliveryListenKey() {}
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
                } else if (method.includes('delivery')) {
                    if (!this.has().listenKeys['delivery']) {
                        listenKey = await this.postFuturesListenKey();
                    } else {
                        listenKey = this.has().listenKeys['delivery'];
                    }
                } else {
                    if (!this.has().listenKeys['spot']) {
                        listenKey = await this.postListenKey();
                    } else {
                        listenKey = this.has().listenKeys['spot'];
                    }
                }
                url += listenKey;
                if (this.options.reconnect) {
                    this.schedule(180000, this.keepAlive(), method, listenKey);
                }
            } catch (error) {
                // TODO
            }
        }
        return url;
    }
    handleTradeStream(data) {
        // {
        //     e: 'trade',
        //     E: 1711613756422,
        //     s: 'BTCUSDT',
        //     t: 3518889844,
        //     p: '70320.42000000',
        //     q: '0.00008000',
        //     b: 26091310263,
        //     a: 26091310077,
        //     T: 1711613756421,
        //     m: false,
        //     M: true
        //  }
        const symbol = this.safeSymbols(this.safeString(data, 's'), 'spot', false, true);
        const price = this.safeString(data, 'p');
        const qty = this.safeString(data, 'q');
        const timestamp = this.safeTimestamp(data, 'T');
        const side = this.define(data, 'm') ? 'SELL' : 'BUY';
        const res = {};
        this.extendWithObj(res, { symbol: symbol, price: price, qty: qty, side: side, timestamp: timestamp });
        return res;
    }
    handleCandleStream(data) {
        // {
        //   "e": "kline",     // Event type
        //   "E": 1672515782136,   // Event time
        //   "s": "BNBBTC",    // Symbol
        //   "k": {
        //     "t": 123400000, // Kline start time
        //     "T": 123460000, // Kline close time
        //     "s": "BNBBTC",  // Symbol
        //     "i": "1m",      // Interval
        //     "f": 100,       // First trade ID
        //     "L": 200,       // Last trade ID
        //     "o": "0.0010",  // Open price
        //     "c": "0.0020",  // Close price
        //     "h": "0.0025",  // High price
        //     "l": "0.0015",  // Low price
        //     "v": "1000",    // Base asset volume
        //     "n": 100,       // Number of trades
        //     "x": false,     // Is this kline closed?
        //     "q": "1.0000",  // Quote asset volume
        //     "V": "500",     // Taker buy base asset volume
        //     "Q": "0.500",   // Taker buy quote asset volume
        //     "B": "123456"   // Ignore
        //   }
        // }
        const kline = data.k;
        const openTime = kline.t;
        const closeTime = kline.T;
        const open = this.safeString(kline, 'o');
        const high = this.safeString(kline, 'h');
        const low = this.safeString(kline, 'l');
        const close = this.safeString(kline, 'c');
        const volume = this.safeString(kline, 'v');
        const res = {};
        this.extendWithObj(res, { openTime: openTime, closeTime: closeTime, open: open, high: high, low: low, close: close, volume: volume });
        return res;
    }
    handleOrderBookStream(data) {
        // DOCS : https://binance-docs.github.io/apidocs/spot/en/#diff-depth-stream
        // DOCS:  https://binance-docs.github.io/apidocs/futures/en/#diff-book-depth-streams

        // How to manage a local order book correctly
        // SPOT
        // 1. Open a stream to wss://stream.binance.com:9443/ws/bnbbtc@depth.
        // 2. Buffer the events you receive from the stream.
        // 3. Get a depth snapshot from https://api.binance.com/api/v3/depth?symbol=BNBBTC&limit=1000.
        // 4. Drop any event where u is <= lastUpdateId in the snapshot.
        // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1.
        // 6. While listening to the stream, each new event's U should be equal to the previous event's u+1.
        // 7. The data in each event is the absolute quantity for a price level.
        // 8. If the quantity is 0, remove the price level.
        // 9. Receiving an event that removes a price level that is not in your local order book can happen and is normal.
        // {
        //     e: 'depthUpdate',
        //     E: 1711957318157,
        //     s: 'BTCUSDT',
        //     U: 45230481952,
        //     u: 45230481955,
        //     b: [
        //       [ '69529.99000000', '12.02951000' ],
        //       [ '69420.56000000', '0.05853000' ]
        //     ],
        //     a: [
        //       [ '69531.99000000', '0.08174000' ],
        //       [ '69574.99000000', '9.71462000' ]
        //     ]
        // }
        // FUTURES
        // 1. Open a stream to wss://fstream.binance.com/stream?streams=btcusdt@depth.
        // 2. Buffer the events you receive from the stream. For same price, latest received update covers the previous one.
        // 3. Get a depth snapshot from https://fapi.binance.com/fapi/v1/depth?symbol=BTCUSDT&limit=1000 .
        // 4. Drop any event where u is < lastUpdateId in the snapshot.
        // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
        // 6. While listening to the stream, each new event's pu should be equal to the previous event's u, otherwise initialize the process from step 3.
        // 7. The data in each event is the absolute quantity for a price level.
        // 8. If the quantity is 0, remove the price level.
        // 9. Receiving an event that removes a price level that is not in your local order book can happen and is normal.
        // {
        //     "e": "depthUpdate", // Event type
        //     "E": 123456789,     // Event time
        //     "T": 123456788,     // Transaction time
        //     "s": "BTCUSDT",     // Symbol
        //     "U": 157,           // First update ID in event
        //     "u": 160,           // Final update ID in event
        //     "pu": 149,          // Final update Id in last stream(ie `u` in last stream)
        //     "b": [              // Bids to be updated
        //       [
        //         "0.0024",       // Price level to be updated
        //         "10"            // Quantity
        //       ]
        //     ],
        //     "a": [              // Asks to be updated
        //       [
        //         "0.0026",       // Price level to be updated
        //         "100"          // Quantity
        //       ]
        //     ]
        //   }
        const symbol = this.safeStringUpper(data, 's');
        const parsedSymbol = this.safeSymbols(symbol, undefined, false, true);
        const market = this.hasProp(data, ['pu']) ? 'futures' : 'spot';
        const timestamp = this.define(data, ['E']);
        const id = `${symbol}-${market}`;
        if (!this[`${id}OrderBook`]) {
            this[`${id}OrderBook`] = new OrderBook(parsedSymbol);
        }
        // 2. Buffer the events you receive from the stream.
        this[`${id}OrderBook`].buffer.push(data);
        this.processOrderBookUpdates(id, symbol, timestamp, market);

        if (this[`${id}OrderBook`].isProcessed === true) {
            return this[`${id}OrderBook`];
        }
        return; // At this point the order book is not initialized yet
    }
    async processOrderBookUpdates(id, symbol, timestamp, market) {
        if (this[`${id}OrderBook`].lastUpdateId === null && this[`${id}OrderBook`].firstCall === true) {
            this[`${id}OrderBook`].firstCall = false;
            // 3. Get a depth snapshot
            const response = await (market === 'spot'
                ? this.getApiV3Depth({ symbol: symbol, limit: 1000 })
                : this.getFapiV1Depth({ symbol: symbol, limit: 1000 }));
            const depthSnapshot = response.data;
            // {
            //     lastUpdateId: 45230632503,
            //     bids: [
            //       [ '69654.00000000', '1.72843000' ],
            //       [ '69653.70000000', '0.27340000' ],
            //       [ '69653.59000000', '0.00139000' ],
            //       [ '69653.58000000', '0.00009000' ],
            //       [ '69653.16000000', '0.00009000' ],
            //     ],
            //     asks: [
            //       [ '69654.01000000', '7.61583000' ],
            //       [ '69654.03000000', '0.02280000' ],
            //       [ '69654.04000000', '0.02250000' ],
            //       [ '69654.05000000', '0.04500000' ],
            //       [ '69654.25000000', '0.14654000' ],
            //       [ '69654.42000000', '0.00009000' ],
            //     ]
            // }
            this[`${id}OrderBook`]._data.asks = depthSnapshot.asks;
            this[`${id}OrderBook`]._data.bids = depthSnapshot.bids;
            this[`${id}OrderBook`].lastUpdateId = depthSnapshot.lastUpdateId;
            return;
        }
        if (this[`${id}OrderBook`].lastUpdateId && this[`${id}OrderBook`].isFindFirstEvent === false) {
            if (market === 'spot') {
                // 4. Drop any event where u is <= lastUpdateId in the snapshot.
                // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1.
                const firstEventIndex = this[`${id}OrderBook`].buffer.findIndex(
                    event => event.U <= this[`${id}OrderBook`].lastUpdateId + 1 && event.u >= this[`${id}OrderBook`].lastUpdateId + 1,
                );

                if (firstEventIndex !== -1) {
                    this[`${id}OrderBook`].isFindFirstEvent = true;
                    this[`${id}OrderBook`].buffer = this[`${id}OrderBook`].buffer.slice(firstEventIndex, this[`${id}OrderBook`].buffer.length);
                    const firstEvent = this[`${id}OrderBook`].buffer[0];
                    this[`${id}OrderBook`].lastUpdateId = firstEvent.U - 1;
                } else {
                    throw new DataLost('Data lost');
                }
            } else if (market === 'futures') {
                // 4. Drop any event where u is < lastUpdateId in the snapshot.
                // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
                const firstEventIndex = this[`${id}OrderBook`].buffer.findIndex(
                    event => event.U <= this[`${id}OrderBook`].lastUpdateId && event.u >= this[`${id}OrderBook`].lastUpdateId,
                );

                if (firstEventIndex !== -1) {
                    this[`${id}OrderBook`].isFindFirstEvent = true;
                    this[`${id}OrderBook`].buffer = this[`${id}OrderBook`].buffer.slice(firstEventIndex, this[`${id}OrderBook`].buffer.length);
                    const firstEvent = this[`${id}OrderBook`].buffer[0];
                    this[`${id}OrderBook`].lastUpdateId = firstEvent.pu;
                } else {
                    throw new DataLost('Data lost');
                }
            }
        }

        while (this[`${id}OrderBook`].isFindFirstEvent === true && this[`${id}OrderBook`].buffer.length > 0) {
            const event = this[`${id}OrderBook`].buffer.shift();
            // 6. While listening to the stream, each new event's U should be equal to the previous event's u+1.
            // 6. While listening to the stream, each new event's pu should be equal to the previous event's u, otherwise initialize the process from step 3.
            if (market === 'spot' && event.U === this[`${id}OrderBook`].lastUpdateId + 1) {
                this[`${id}OrderBook`].lastUpdateId = event.u;
            } else if (market === 'futures' && event.pu === this[`${id}OrderBook`].lastUpdateId) {
                this[`${id}OrderBook`].lastUpdateId = event.u;
            } else {
                throw new DataLost('Data lost');
            }
            // 7. The data in each event is the absolute quantity for a price level.
            const updateOrderBook = (currentBook, updates) => {
                const currentOrderBook = new Map(currentBook.map(([price, qty]) => [price, qty]));
                updates.forEach(([price, qty]) => {
                    // 8. If the quantity is 0, remove the price level.
                    if (Precise.stringEquals(qty, '0')) {
                        currentOrderBook.delete(price);
                    } else {
                        currentOrderBook.set(price, qty);
                    }
                });
                return Array.from(currentOrderBook);
            };
            let asks = updateOrderBook(this[`${id}OrderBook`]._data.asks, event.a);
            let bids = updateOrderBook(this[`${id}OrderBook`]._data.bids, event.b);
            this[`${id}OrderBook`]._data.asks = asks.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
            this[`${id}OrderBook`]._data.bids = bids.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
            this[`${id}OrderBook`]._data.timestamp = timestamp;

            this[`${id}OrderBook`].isProcessed = true;
        }
        // 9. Receiving an event that removes a price level that is not in your local order book can happen and is normal.
        // Note: Due to depth snapshots having a limit on the number of price levels,
        // a price level outside of the initial snapshot that doesn't have a quantity change won't have an update in the Diff. Depth Stream.
        // Consequently, those price levels will not be visible in the local order book even when applying all updates from the Diff.
        // Depth Stream correctly and cause the local order book to have some slight differences with the real order book.
        // However, for most use cases the depth limit of 5000 is enough to understand the market and trade effectively.
    }
    handleBalanceStream(data) {
        // SPOT
        // {
        //     "e": "outboundAccountPosition", //Event type
        //     "E": 1564034571105,             //Event Time
        //     "u": 1564034571073,             //Time of last account update
        //     "B": [                          //Balances Array
        //       {
        //         "a": "ETH",                 //Asset
        //         "f": "10000.000000",        //Free
        //         "l": "0.000000"             //Locked
        //       }
        //     ]
        // }
        // {
        //     "e": "balanceUpdate",         //Event Type
        //     "E": 1573200697110,           //Event Time
        //     "a": "BTC",                   //Asset
        //     "d": "100.00000000",          //Balance Delta
        //     "T": 1573200697068            //Clear Time
        //  }
        // FUTURES
        // {
        //     "e": "ACCOUNT_UPDATE",                // Event Type
        //     "E": 1564745798939,                   // Event Time
        //     "T": 1564745798938 ,                  // Transaction
        //     "a":                                  // Update Data
        //       {
        //         "m":"ORDER",                      // Event reason type
        //         "B":[                             // Balances
        //           {
        //             "a":"USDT",                   // Asset
        //             "wb":"122624.12345678",       // Wallet Balance
        //             "cw":"100.12345678",          // Cross Wallet Balance
        //             "bc":"50.12345678"            // Balance Change except PnL and Commission
        //           },
        //           {
        //             "a":"BUSD",
        //             "wb":"1.00000000",
        //             "cw":"0.00000000",
        //             "bc":"-49.12345678"
        //           }
        //         ],
        //         "P":[
        //           {
        //             "s":"BTCUSDT",            // Symbol
        //             "pa":"0",                 // Position Amount
        //             "ep":"0.00000",           // Entry Price
        //             "bep":"0",                // breakeven price
        //             "cr":"200",               // (Pre-fee) Accumulated Realized
        //             "up":"0",                 // Unrealized PnL
        //             "mt":"isolated",          // Margin Type
        //             "iw":"0.00000000",        // Isolated Wallet (if isolated position)
        //             "ps":"BOTH"               // Position Side
        //           }，
        //           {
        //             "s":"BTCUSDT",
        //             "pa":"20",
        //             "ep":"6563.66500",
        //             "bep":"6563.6",
        //             "cr":"0",
        //             "up":"2850.21200",
        //             "mt":"isolated",
        //             "iw":"13200.70726908",
        //             "ps":"LONG"
        //           },
        //           {
        //             "s":"BTCUSDT",
        //             "pa":"-10",
        //             "ep":"6563.86000",
        //             "bep":"6563.6",
        //             "cr":"-45.04000000",
        //             "up":"-1423.15600",
        //             "mt":"isolated",
        //             "iw":"6570.42511771",
        //             "ps":"SHORT"
        //           }
        //         ]
        //       }
        //   }
        // ResponseFormat
        // {
        //     asset: 'BTC',
        //     total: '0.00000000',
        //     available: '0.00000000',
        //     locked: '0.00000000'
        // }
        const event = this.safeString(data, 'e');
        if (event === 'outboundAccountPosition') {
            // Process the balances array from the event
            const balances = this.safeValue(data, 'B');
            const parseWallets = balance => {
                const item = balance;
                const asset = this.safeString(item, 'a');
                const available = this.safeString(item, 'f');
                const frozen = this.safeString(item, 'l');
                const total = Precise.stringAdd(available, frozen);
                const response = {};
                this.extendWithObj(response, {
                    asset: asset,
                    wallet: total,
                    available: available,
                    frozen: frozen,
                });
                this.wallets['spot'][asset] = response;
                return response;
            };
            // Return an iterator so that the balances can be processed one by one
            return {
                [Symbol.iterator]() {
                    let index = 0;
                    return {
                        next: () => {
                            if (index < balances.length) {
                                const response = parseWallets(balances[index++]);
                                return { value: response, done: false };
                            } else {
                                return { done: true };
                            }
                        },
                    };
                },
            };
        } else if (event === 'ACCOUNT_UPDATE') {
            const balances = this.safeValue(this.safeValue(data, 'a'), 'B');
            const parseWallets = balance => {
                const item = balance;
                const wallets = this.getWallets('futures');
                const asset = this.safeString(item, 'a');
                const wallet = this.safeString(item, 'wb');
                const available = this.safeString(item, 'cw');
                const delta = this.safeString(item, 'bc');
                const response = {};
                if (wallets[asset]) {
                    this.extendWithObj(response, {
                        asset: asset,
                        wallet: wallet,
                        available: available,
                        frozen: Precise.stringSub(wallet, available),
                    });
                } else {
                    this.extendWithObj(response, {
                        asset: asset,
                        wallet: delta,
                        available: delta,
                        frozen: '0.00000000',
                    });
                }
                this.wallets['futures'][asset] = response;
                return response;
            };
            return {
                [Symbol.iterator]() {
                    let index = 0;
                    return {
                        next: () => {
                            if (index < balances.length) {
                                const response = parseWallets(balances[index++]);
                                return { value: response, done: false };
                            } else {
                                return { done: true };
                            }
                        },
                    };
                },
            };
        }
    }
    handleExposureStream(data) {
        // {
        //     "e": "ACCOUNT_UPDATE",                // Event Type
        //     "E": 1564745798939,                   // Event Time
        //     "T": 1564745798938 ,                  // Transaction
        //     "a":                                  // Update Data
        //       {
        //         "m":"ORDER",                      // Event reason type
        //         "B":[                             // Balances
        //           {
        //             "a":"USDT",                   // Asset
        //             "wb":"122624.12345678",       // Wallet Balance
        //             "cw":"100.12345678",          // Cross Wallet Balance
        //             "bc":"50.12345678"            // Balance Change except PnL and Commission
        //           },
        //           {
        //             "a":"BUSD",
        //             "wb":"1.00000000",
        //             "cw":"0.00000000",
        //             "bc":"-49.12345678"
        //           }
        //         ],
        //         "P":[
        //           {
        //             "s":"BTCUSDT",            // Symbol
        //             "pa":"0",                 // Position Amount
        //             "ep":"0.00000",           // Entry Price
        //             "bep":"0",                // breakeven price
        //             "cr":"200",               // (Pre-fee) Accumulated Realized
        //             "up":"0",                 // Unrealized PnL
        //             "mt":"isolated",          // Margin Type
        //             "iw":"0.00000000",        // Isolated Wallet (if isolated position)
        //             "ps":"BOTH"               // Position Side
        //           }，
        //           {
        //             "s":"BTCUSDT",
        //             "pa":"20",
        //             "ep":"6563.66500",
        //             "bep":"6563.6",
        //             "cr":"0",
        //             "up":"2850.21200",
        //             "mt":"isolated",
        //             "iw":"13200.70726908",
        //             "ps":"LONG"
        //           },
        //           {
        //             "s":"BTCUSDT",
        //             "pa":"-10",
        //             "ep":"6563.86000",
        //             "bep":"6563.6",
        //             "cr":"-45.04000000",
        //             "up":"-1423.15600",
        //             "mt":"isolated",
        //             "iw":"6570.42511771",
        //             "ps":"SHORT"
        //           }
        //         ]
        //       }
        //   }
        const event = this.safeString(data, 'e');
        if (event === 'ACCOUNT_UPDATE') {
            const parsePosition = position => {
                const symbol = this.safeSymbols(this.safeString(position, 's'), 'futures', false, true);
                const qty = this.safeString(position, 'pa');
                const entryPrice = this.safeString(position, 'ep');
                const marginType = this.safeString(position, 'mt');
                const unrealizedPnL = this.safeString(position, 'up');
                const notional = Precise.stringMul(qty, entryPrice);
                let side = this.safeString(position, 'ps');
                if (side === 'BOTH') {
                    if (qty > 0) side = 'LONG';
                    else if (qty < 0) side = 'SHORT';
                    else side = '';
                }
                return {
                    symbol: symbol,
                    qty: qty,
                    entryPrice: entryPrice,
                    positionSide: side,
                    leverage: undefined,
                    notional: notional,
                    liquidPrice: undefined,
                    marginType: marginType,
                    unRealizedPnl: unrealizedPnL,
                };
            };
            const position = this.safeValue(this.safeValue(data, 'a'), 'P');
            if (position.length > 0) {
                return position.map(p => parsePosition(p));
            }
            return;
        }
    }
    async handleOrderUpdateStream(data) {
        // SPOT
        // {
        //     "e": "executionReport",        // Event type
        //     "E": 1499405658658,            // Event time
        //     "s": "ETHBTC",                 // Symbol
        //     "c": "mUvoqJxFIILMdfAW5iGSOW", // Client order ID
        //     "S": "BUY",                    // Side
        //     "o": "LIMIT",                  // Order type
        //     "f": "GTC",                    // Time in force
        //     "q": "1.00000000",             // Order quantity
        //     "p": "0.10264410",             // Order price
        //     "P": "0.00000000",             // Stop price
        //     "F": "0.00000000",             // Iceberg quantity
        //     "g": -1,                       // OrderListId
        //     "C": "",                       // Original client order ID; This is the ID of the order being canceled
        //     "x": "NEW",                    // Current execution type
        //     "X": "NEW",                    // Current order status
        //     "r": "NONE",                   // Order reject reason; will be an error code.
        //     "i": 4293153,                  // Order ID
        //     "l": "0.00000000",             // Last executed quantity
        //     "z": "0.00000000",             // Cumulative filled quantity
        //     "L": "0.00000000",             // Last executed price
        //     "n": "0",                      // Commission amount
        //     "N": null,                     // Commission asset
        //     "T": 1499405658657,            // Transaction time
        //     "t": -1,                       // Trade ID
        //     "I": 8641984,                  // Ignore
        //     "w": true,                     // Is the order on the book?
        //     "m": false,                    // Is this trade the maker side?
        //     "M": false,                    // Ignore
        //     "O": 1499405658657,            // Order creation time
        //     "Z": "0.00000000",             // Cumulative quote asset transacted quantity
        //     "Y": "0.00000000",             // Last quote asset transacted quantity (i.e. lastPrice * lastQty)
        //     "Q": "0.00000000",             // Quote Order Quantity
        //     "W": 1499405658657,            // Working Time; This is only visible if the order has been placed on the book.
        //     "V": "NONE"                    // selfTradePreventionMode
        //   }
        // FUTURES
        // {
        //     "e":"ORDER_TRADE_UPDATE",     // Event Type
        //     "E":1568879465651,            // Event Time
        //     "T":1568879465650,            // Transaction Time
        //     "o":{
        //       "s":"BTCUSDT",              // Symbol
        //       "c":"TEST",                 // Client Order Id
        //         // special client order id:
        //         // starts with "autoclose-": liquidation order
        //         // "adl_autoclose": ADL auto close order
        //         // "settlement_autoclose-": settlement order for delisting or delivery
        //       "S":"SELL",                 // Side
        //       "o":"TRAILING_STOP_MARKET", // Order Type
        //       "f":"GTC",                  // Time in Force
        //       "q":"0.001",                // Original Quantity
        //       "p":"0",                    // Original Price
        //       "ap":"0",                   // Average Price
        //       "sp":"7103.04",             // Stop Price. Please ignore with TRAILING_STOP_MARKET order
        //       "x":"NEW",                  // Execution Type
        //       "X":"NEW",                  // Order Status
        //       "i":8886774,                // Order Id
        //       "l":"0",                    // Order Last Filled Quantity
        //       "z":"0",                    // Order Filled Accumulated Quantity
        //       "L":"0",                    // Last Filled Price
        //       "N":"USDT",                 // Commission Asset, will not push if no commission
        //       "n":"0",                    // Commission, will not push if no commission
        //       "T":1568879465650,          // Order Trade Time
        //       "t":0,                      // Trade Id
        //       "b":"0",                    // Bids Notional
        //       "a":"9.91",                 // Ask Notional
        //       "m":false,                  // Is this trade the maker side?
        //       "R":false,                  // Is this reduce only
        //       "wt":"CONTRACT_PRICE",      // Stop Price Working Type
        //       "ot":"TRAILING_STOP_MARKET",// Original Order Type
        //       "ps":"LONG",                // Position Side
        //       "cp":false,                 // If Close-All, pushed with conditional order
        //       "AP":"7476.89",             // Activation Price, only puhed with TRAILING_STOP_MARKET order
        //       "cr":"5.0",                 // Callback Rate, only puhed with TRAILING_STOP_MARKET order
        //       "pP": false,                // If price protection is turned on
        //       "si": 0,                    // ignore
        //       "ss": 0,                    // ignore
        //       "rp":"0",                   // Realized Profit of the trade
        //       "V":"EXPIRE_TAKER",         // STP mode
        //       "pm":"OPPONENT",            // Price match mode
        //       "gtd":0                     // TIF GTD order auto cancel time
        //     }
        //   }

        const event = this.safeString(data, 'e');
        if (event === 'executionReport') {
            const symbol = this.safeSymbols(this.safeString(data, 's'), 'spot', false, true);
            const timestamp = this.safeTimestamp(data, 'E');
            const id = this.safeString(data, 'i');
            const price = this.safeString(data, 'p');
            const qty = this.safeString(data, 'q');
            const executedQty = this.safeString(data, 'z');
            const type = this.safeStringUpper(data, 'o');
            const tif = this.safeString(data, 'f');
            const side = this.safeString(data, 'S');
            let status = this.safeStringUpper(data, 'X');
            if (status === 'REJECTED') status = 'CANCELED';
            if (status === 'TRADE') status = 'FILLED';
            if (status === 'EXPIRED') status = 'CANCELED';
            if (status === 'TRADE_PREVENTION') status = 'CANCELED';
            const res = {};
            this.extendWithObj(res, {
                timestamp: timestamp,
                id: id,
                status: status,
                symbol: symbol,
                price: price,
                qty: qty,
                executedQty: executedQty,
                type: type,
                tif: tif,
                side: side,
            });
            return res;
        } else if (event === 'ORDER_TRADE_UPDATE') {
            const item = this.safeValue(data, 'o');
            const symbol = this.safeSymbols(this.safeString(item, 's'), 'futures', false, true);
            const timestamp = this.safeTimestamp(item, 'E');
            const id = this.safeString(item, 'i');
            const price = this.safeString(item, 'p');
            const qty = this.safeString(item, 'q');
            const executedQty = this.safeString(item, 'z');
            const type = this.safeStringUpper(item, 'o');
            const tif = this.safeString(item, 'f');
            const side = this.safeString(item, 'S');
            const reduceOnly = this.safeValue(item, 'R');
            const closePosition = this.safeValue(item, 'cp');
            let status = this.safeStringUpper(item, 'X');
            if (status === 'PARTIALLY_FILLED') status = 'FILLED';
            if (status === 'EXPIRED_IN_MATCH') status = 'CANCELLED';
            if (status === 'EXPIRED') status = 'CANCELED';
            const res = {};
            this.extendWithObj(res, {
                timestamp: timestamp,
                id: id,
                status: status,
                symbol: symbol,
                price: price,
                qty: qty,
                executedQty: executedQty,
                type: type,
                tif: tif,
                side: side,
                reduceOnly: reduceOnly,
                closePosition: closePosition,
            });
            return res;
        }
    }
    async tradeStream(symbol) {
        await this.loadMarkets();
        let method = 'trade';
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false).toLowerCase();
        const url = await this.authenticate(method, this.urls['base']['ssV0'] + `${parsedSymbol}@trade`);
        return this.handleStream(url, method);
    }
    async candleStream(symbol, timeframe) {
        await this.loadMarkets();
        let method = 'candle';
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false).toLowerCase();
        const parsedTimeframe = this.safeTimeframe(timeframe, 'spot');
        const url = await this.authenticate(method, this.urls['base']['ssV0'] + `${parsedSymbol}@kline_${parsedTimeframe}`);
        return this.handleStream(url, method);
    }
    async orderBookStream(symbol) {
        await this.loadMarkets();
        let method = 'orderBook';
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false).toLowerCase();
        const url = await this.authenticate(method, this.urls['base']['ssV0'] + `${parsedSymbol}@depth@100ms`);
        return this.handleStream(url, method);
    }
    async futuresCandleStream(symbol, timeframe) {
        await this.loadMarkets();
        let method = 'futuresCandle';
        const parsedTimeframe = this.safeTimeframe(timeframe, 'futures');
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false).toLowerCase();
        const url = await this.authenticate(method, this.urls['base']['sfV0'] + `${parsedSymbol}@kline_${parsedTimeframe}`);
        return this.handleStream(url, method);
    }
    async futuresOrderBookStream(symbol) {
        await this.loadMarkets();
        let method = 'futuresOrderBook';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false).toLowerCase();
        const url = await this.authenticate(method, this.urls['base']['sfV0'] + `${parsedSymbol}@depth@100ms`);
        return this.handleStream(url, method);
    }
    async balanceStream() {
        await this.loadMarkets();
        await this.loadWallets('spot');
        let method = 'balance';
        const url = await this.authenticate(method, this.urls['base']['ssV0']);
        return this.handleStream(url, method);
    }
    async futuresBalanceStream() {
        await this.loadMarkets();
        await this.loadWallets('futures');
        let method = 'futuresBalance';
        const url = await this.authenticate(method, this.urls['base']['sfV0']);
        return this.handleStream(url, method);
    }
    async futuresExposureStream() {
        await this.loadMarkets();
        await this.loadWallets('futures');
        let method = 'futuresExposure';
        const url = await this.authenticate(method, this.urls['base']['sfV0']);
        return this.handleStream(url, method);
    }
    async orderUpdateStream() {
        await this.loadMarkets();
        let method = 'orderUpdate';
        const url = await this.authenticate(method, this.urls['base']['ssV0']);
        return this.handleStream(url, method);
    }
    async futuresOrderUpdateStream() {
        await this.loadMarkets();
        let method = 'futuresOrderUpdate';
        const url = await this.authenticate(method, this.urls['base']['sfV0']);
        return this.handleStream(url, method);
    }
}
