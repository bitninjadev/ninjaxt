import { BaseExchange } from './base/Exchange.js';
import { Unavailable, EmptyParameters, InvalidOrder, DataLost } from './base/errors.js';
import { hmacSha512, sha512Hex } from './base/functions/crypto.js';
import { Precise } from './base/functions/Precise.js';
import OrderBook from './base/orderBook.js';

export class Gateio extends BaseExchange {
    has() {
        return this.deepExtend(super.has(), {
            features: {
                ws: true,
                publicAPI: true,
                privateAPI: true,
                spot: true,
                futures: true,
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
                    sV4: 'https://api.gateio.ws/api/v4/',
                    fV4: 'https://fx-api.gateio.ws/api/v4/', // production
                    // fV4: 'https://fx-api-testnet.gateio.ws/api/v4/', // sandbox
                    ssV4: 'wss://api.gateio.ws/ws/v4/',
                    sfV4: 'wss://fx-ws.gateio.ws/v4/ws/usdt/',
                },
                sandbox: {
                    fV4: 'https://fx-api-testnet.gateio.ws/api/v4',
                },
            },
            endpoints: {
                public: {
                    get: {
                        'spot/trades': { versions: ['sV4'], cost: 0 },
                        'spot/tickers': { versions: ['sV4'], cost: 0 },
                        'spot/currencies': { versions: ['sV4'], cost: 0 },
                        'spot/currency_pairs': { versions: ['sV4'], cost: 0 },
                        'spot/order_book': { versions: ['sV4'], cost: 0 },
                        'spot/candlesticks': { versions: ['sV4'], cost: 0 },
                        'futures/{settle}/trades': { versions: ['fV4'], cost: 0 },
                        'futures/{settle}/order_book': { versions: ['fV4'], cost: 0 },
                        'futures/{settle}/contracts': { versions: ['fV4'], cost: 0 },
                        'futures/{settle}/tickers': { versions: ['fV4'], cost: 0 },
                        'futures/{settle}/candlesticks': { versions: ['fV4'], cost: 0 },
                    },
                    post: {},
                    put: {},
                    delete: {},
                },
                private: {
                    get: {
                        'wallet/fee': { versions: ['sV4'], cost: 0 },
                        'futures/{settle}/fee': { versions: ['fV4'], cost: 0 },
                        'spot/orders': { versions: ['sV4'], cost: 0 },
                        'spot/accounts': { versions: ['sV4'], cost: 0 },
                        'spot/my_trades': { versions: ['sV4'], cost: 0 },
                        'futures/{settle}/accounts': { versions: ['fV4'], cost: 0 },
                        'futures/{settle}/orders': { versions: ['fV4'], cost: 0 },
                        'futures/{settle}/my_trades': { versions: ['fV4'], cost: 0 },
                        'futures/{settle}/positions': { versions: ['fV4'], cost: 0 },
                    },
                    post: {
                        'spot/orders': { versions: ['sV4'], cost: 0 },
                        'futures/{settle}/positions/{contract}/leverage': { versions: ['fV4'], cost: 0 },
                        'futures/{settle}/orders': { versions: ['fV4'], cost: 0 },
                    },
                    put: {
                        'futures/{settle}/orders': { versions: ['fV4'], cost: 0 },
                    },
                    delete: {},
                },
            },
            ws: {
                public: {
                    candle: { base: ['ssV4'], weight: 1 },
                    futuresCandle: { base: ['sfV4'], weight: 1 },
                },
                private: {},
            },
            timeframes: {
                spot: {
                    '10s': '10s',
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1h',
                    '4h': '4h',
                    '8h': '8h',
                    '1d': '1d',
                    '7d': '7d',
                    '1M': '30d',
                },
                futures: {
                    '10s': '10s',
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1h',
                    '4h': '4h',
                    '8h': '8h',
                    '1d': '1d',
                    '7d': '7d',
                    '1M': '30d',
                },
            },
        });
    }
    sign(url, method = 'GET', body = undefined, isPrivate = false) {
        method = method.toUpperCase();
        let headers = {};
        let queryString = '';

        const data = this.define(body, ['body']);
        delete body.body;

        if (body !== undefined && this.isObject(body) && Object.keys(body).length > 0) {
            // filter body if contains settle property
            if (this.hasProp(body, ['settle'])) {
                url = url.replace('{settle}', this.safeStringLower(body, 'settle'));
                delete body.settle;
            }

            if (url.includes('{contract}')) {
                url = url.replace('{contract}', this.safeString(body, 'contract'));
                delete body.contract;
            }

            queryString = Object.entries(body)
                .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
                .join('&');
        }

        const timestamp = Math.floor(Date.now() / 1000).toString();

        if (isPrivate) {
            const bodyString = data ? JSON.stringify(data) : '';
            const bodyHash = sha512Hex(bodyString);
            const apiPath = `${url.split('gateio.ws')[1]}`;
            const signatureString = `${method}\n${apiPath}\n${queryString}\n${bodyHash}\n${timestamp}`;
            console.log(signatureString);
            headers['KEY'] = this.apiKey;
            headers['SIGN'] = hmacSha512(this.apiSecret, signatureString);
            headers['Timestamp'] = timestamp;
        }
        headers['Content-Type'] = 'application/json';

        if (queryString.length > 0) {
            url += `?${queryString}`;
        }

        const parameters = {
            url: url,
            method: method,
            headers: headers,
            body: data,
        };
        return parameters;
    }
    parseMarkets(instruments) {
        // SPOT
        // [
        //     {
        //       "id": "ETH_USDT",
        //       "base": "ETH",
        //       "quote": "USDT",
        //       "fee": "0.2",
        //       "min_base_amount": "0.001",
        //       "min_quote_amount": "1.0",
        //       "max_base_amount": "10000",
        //       "max_quote_amount": "10000000",
        //       "amount_precision": 3,
        //       "precision": 6,
        //       "trade_status": "tradable",
        //       "sell_start": 1516378650,
        //       "buy_start": 1516378650
        //     }
        //   ]
        // FUTURES
        // [
        //     {
        //       "name": "BTC_USDT",
        //       "type": "direct",
        //       "quanto_multiplier": "0.0001",
        //       "ref_discount_rate": "0",
        //       "order_price_deviate": "0.5",
        //       "maintenance_rate": "0.005",
        //       "mark_type": "index",
        //       "last_price": "38026",
        //       "mark_price": "37985.6",
        //       "index_price": "37954.92",
        //       "funding_rate_indicative": "0.000219",
        //       "mark_price_round": "0.01",
        //       "funding_offset": 0,
        //       "in_delisting": false,
        //       "risk_limit_base": "1000000",
        //       "interest_rate": "0.0003",
        //       "order_price_round": "0.1",
        //       "order_size_min": 1,
        //       "ref_rebate_rate": "0.2",
        //       "funding_interval": 28800,
        //       "risk_limit_step": "1000000",
        //       "leverage_min": "1",
        //       "leverage_max": "100",
        //       "risk_limit_max": "8000000",
        //       "maker_fee_rate": "-0.00025",
        //       "taker_fee_rate": "0.00075",
        //       "funding_rate": "0.002053",
        //       "order_size_max": 1000000,
        //       "funding_next_apply": 1610035200,
        //       "short_users": 977,
        //       "config_change_time": 1609899548,
        //       "trade_size": 28530850594,
        //       "position_size": 5223816,
        //       "long_users": 455,
        //       "funding_impact_value": "60000",
        //       "orders_limit": 50,
        //       "trade_id": 10851092,
        //       "orderbook_id": 2129638396,
        //       "enable_bonus": true,
        //       "enable_credit": true,
        //       "create_time": 1669688556,
        //       "funding_cap_ratio": "0.75"
        //     }
        //   ]
        for (let i = 0; i < instruments.length; i++) {
            const item = instruments[i];
            const id = this.safeString(item, 'id') || this.safeString(item, 'name');
            const socketId = this.safeString(item, 'id') || this.safeString(item, 'name');
            const assetType = this.hasProp(item, ['base', 'quote']) ? 'spot' : 'futures';
            const baseAsset = this.safeString(item, 'base') || this.safeString(item, 'name').split('_')[0];
            const quoteAsset = this.safeString(item, 'quote') || this.safeString(item, 'name').split('_')[1];
            const pricePrecision = this.safeString(item, 'precision') || this.decimalPlaces(this.safeString(item, 'mark_price_round'));
            const amountPrecision = this.safeString(item, 'amount_precision') || this.decimalPlaces(this.safeString(item, 'order_size_round'));
            const minBaseLotSize = String(this.define(item, ['min_base_amount', 'quanto_multiplier']));
            const maxBaseLotSize = String(this.define(item, ['max_base_amount', 'orders_limit']));
            const minQuoteLotSize = String(this.define(item, ['min_quote_amount', 'order_size_min']));
            const maxQuoteLotSize = String(this.define(item, ['max_quote_amount', 'order_size_max']));
            const input = `${baseAsset}/${quoteAsset}`;
            // Initialize the object
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
        if (Object.keys(this.instruments).length > 0) return; // already loaded
        const promisesAry = [];
        const settleAsset = ['BTC', 'USDT', 'USD']; // hardcoded settle assets
        // load Spot and Futures instruments
        promisesAry.push(this.getSpotCurrencyPairs());
        for (let i = 0; i < settleAsset.length; i++) {
            const parameters = { settle: settleAsset[i] };
            promisesAry.push(this.getFuturesSettleContracts(parameters));
        }
        const promises = await Promise.all(promisesAry);
        for (let i = 0; i < promises.length; i++) {
            const response = promises[i];
            if (this.isValid(response.data)) {
                this.parseMarkets(response.data);
            }
        }
    }
    parseCommissionRate(commission, symbol) {
        // SPOT
        // {
        //     user_id: 13476305,
        //     taker_fee: '0.001',
        //     maker_fee: '0.001',
        //     gt_discount: false,
        //     gt_taker_fee: '0',
        //     gt_maker_fee: '0',
        //     loan_fee: '0.18',
        //     point_type: '1',
        //     futures_taker_fee: '0.0005',
        //     futures_maker_fee: '0.00015',
        //     delivery_taker_fee: '0.00016',
        //     delivery_maker_fee: '-0.00015',
        //     debit_fee: 2
        //   }
        // FUTURES
        // { ETH_USDT: { taker_fee: '0.0005', maker_fee: '0.00015' } }
        return this.safeCommissionRate({
            symbol: symbol,
            maker: this.define(commission, ['maker_fee']),
            taker: this.define(commission, ['taker_fee']),
        });
    }
    parseTrade(trades) {
        // SPOT
        // [
        //     {
        //       "id": "1232893232",
        //       "create_time": "1548000000",
        //       "create_time_ms": "1548000000123.456",
        //       "order_id": "4128442423",
        //       "side": "buy",
        //       "role": "maker",
        //       "amount": "0.15",
        //       "price": "0.03",
        //       "fee": "0.0005",
        //       "fee_currency": "ETH",
        //       "point_fee": "0",
        //       "gt_fee": "0",
        //       "sequence_id": "588018",
        //       "text": "t-test"
        //     }
        // ]
        if (this.isObject(trades)) {
            return this.safeTrade({
                price: this.define(trades, ['price']),
                qty: this.define(trades, ['amount']),
                quoteQty: null,
                timestamp: this.parseToInt(this.define(trades, ['create_time_ms'])),
                side: this.define(trades, ['side']),
            });
        } else if (this.isArray(trades)) {
            return trades.map(t => this.parseTrade(t));
        }
    }
    parsePrice(prices) {
        if (this.isObject(prices)) {
            let symbol = this.define(prices, ['currency_pair', 'contract']);
            prices.symbol = this.safeSymbols(symbol, undefined, false, true);
            prices.price = this.define(prices, ['last']);
            return this.safePrice(prices);
        } else if (this.isArray(prices)) {
            return prices.map(p => this.parsePrice(p));
        }
    }
    parseOrderBook(orderBook, symbol) {
        // SPOT
        // {
        //     current: 1714118228019,
        //     update: 1714118228018,
        //     asks: [
        //       [ '64284.1', '0.04912' ],
        //       [ '64284.6', '0.0036' ],
        //       [ '64285.9', '0.03' ],
        //       [ '64286.4', '0.05347' ],
        //       [ '64287.4', '0.5' ]
        //     ],
        //     bids: [
        //       [ '64284', '0.90561' ],
        //       [ '64283.7', '0.15641' ],
        //       [ '64283.3', '0.27055' ],
        //       [ '64283', '0.002' ],
        //       [ '64280.8', '0.31872' ]
        //     ]
        // }
        // FUTURES
        // {
        //     "id": 123456,
        //     "current": 1623898993.123,
        //     "update": 1623898993.121,
        //     "asks": [
        //       {
        //         "p": "1.52",
        //         "s": 100
        //       },
        //       {
        //         "p": "1.53",
        //         "s": 40
        //       }
        //     ],
        //     "bids": [
        //       {
        //         "p": "1.17",
        //         "s": 150
        //       },
        //       {
        //         "p": "1.16",
        //         "s": 203
        //       }
        //     ]
        //   }
        const timestamp = this.define(orderBook, ['current']);
        const asks = this.define(orderBook, ['asks']);
        const bids = this.define(orderBook, ['bids']);
        if (this.isObject(asks[0]) || this.isObject(bids[0])) {
            let t = timestamp * 1000;
            return this.safeOrderBook({
                asks: asks.map(a => [a.p, a.s]),
                bids: bids.map(b => [b.p, b.s]),
            }, symbol, t);
        }
        return this.safeOrderBook(orderBook, symbol, timestamp);
    }
    parseCandle(candles, timeframe) {
        // SPOT
        // [
        //     [
        //       "1539852480", // unix timestamp with second precision
        //       "971519.677", // trading volume in quote currency
        //       "0.0021724", // close price
        //       "0.0021922", // highest price
        //       "0.0021724", // lowest price
        //       "0.0021737", // opening price
        //       "true" // // whether this candlestick is closed
        //     ]
        //   ]
        // FUTURES
        // [
        //     {
        //       "t": 1539852480, // timestamp
        //       "v": 97151, // volume size (contract size)
        //       "c": "1.032",
        //       "h": "1.032",
        //       "l": "1.032",
        //       "o": "1.032",
        //       "sum": "3580" // trading volume (unit: quote currency)
        //     }
        //   ]
        if (this.isArray(candles) && this.isArray(candles[0]) || this.isObject(candles[0])) {
            return candles.map(c => this.parseCandle(c, timeframe));
        }
        else if (Array.isArray(candles) && !this.isObject(candles[0])) {
            const time = this.timeframeConvert[timeframe];
            return this.safeCandle({
                openTime: this.toMilliseconds(candles[0]),
                closeTime: this.toMilliseconds(candles.t) + time - 1,
                open: candles[5],
                high: candles[3],
                low: candles[4],
                close: candles[2],
                volume: candles[1],
            });
        }
        else if (this.isObject(candles)) {
            const time = this.timeframeConvert[timeframe];
            return this.safeCandle({
                openTime: this.toMilliseconds(candles.t),
                closeTime: this.toMilliseconds(candles.t) + time - 1,
                open: candles.o,
                high: candles.h,
                low: candles.l,
                close: candles.c,
                volume: candles.v,
            });
        }
    }
    parseTradeHistory(trades) {
        // SPOT
        // [
        //     {
        //       id: '8828415007',
        //       create_time: '1714468821',
        //       create_time_ms: '1714468821297.177000',
        //       currency_pair: 'USDC_USDT',
        //       side: 'buy',
        //       role: 'taker',
        //       amount: '0.99',
        //       price: '1.0002',
        //       order_id: '573074938358',
        //       fee: '0.00099',
        //       fee_currency: 'USDC',
        //       point_fee: '0.0',
        //       gt_fee: '0.0',
        //       amend_text: '-',
        //       sequence_id: '1507162',
        //       text: '3'
        //     }
        //   ]
        if (this.isObject(trades)) {
            return this.safeTradeHistory({
                timestamp: this.parseToInt(this.define(trades, ['create_time_ms'])),
                orderId: this.define(trades, ['id']),
                symbol: this.safeSymbols(this.define(trades, ['currency_pair']), undefined, false, true),
                side: this.define(trades, ['side']),
                price: this.define(trades, ['price']),
                qty: this.define(trades, ['amount']),
                isMaker: this.define(trades, ['role']) === 'maker' ? 'true' : 'false',
                commission: this.define(trades, ['fee']),
            });
        } else if (this.isArray(trades)) {
            return trades.map(t => this.parseTradeHistory(t));
        }
    }
    parseTicker(ticker) {
        // SPOT
        // [
        //     {
        //       "currency_pair": "BTC3L_USDT",
        //       "last": "2.46140352",
        //       "lowest_ask": "2.477",
        //       "highest_bid": "2.4606821",
        //       "change_percentage": "-8.91",
        //       "change_utc0": "-8.91",
        //       "change_utc8": "-8.91",
        //       "base_volume": "656614.0845820589",
        //       "quote_volume": "1602221.66468375534639404191",
        //       "high_24h": "2.7431",
        //       "low_24h": "1.9863",
        //       "etf_net_value": "2.46316141",
        //       "etf_pre_net_value": "2.43201848",
        //       "etf_pre_timestamp": 1611244800,
        //       "etf_leverage": "2.2803019447281203"
        //     }
        //   ]
        // FUTURES
        // [
        //     {
        //       "contract": "BTC_USDT",
        //       "last": "6432",
        //       "low_24h": "6278",
        //       "high_24h": "6790",
        //       "change_percentage": "4.43",
        //       "total_size": "32323904",
        //       "volume_24h": "184040233284",
        //       "volume_24h_btc": "28613220",
        //       "volume_24h_usd": "184040233284",
        //       "volume_24h_base": "28613220",
        //       "volume_24h_quote": "184040233284",
        //       "volume_24h_settle": "28613220",
        //       "mark_price": "6534",
        //       "funding_rate": "0.0001",
        //       "funding_rate_indicative": "0.0001",
        //       "index_price": "6531",
        //       "highest_bid": "34089.7",
        //       "lowest_ask": "34217.9"
        //     }
        //   ]
        if (this.isObject(ticker)) {
            const symbol = this.safeSymbols(this.define(ticker, ['currency_pair', 'contract']), undefined, false, true);
            const high = this.define(ticker, ['high_24h']);
            const low = this.define(ticker, ['low_24h']);
            const close = this.define(ticker, ['last']);
            const volume = this.define(ticker, ['base_volume', 'volume_24h_base']);
            return this.safeTicker({
                symbol: symbol,
                open: undefined,
                high: high,
                low: low,
                close: close,
                volume: volume,
            });
        } else if (this.isArray(ticker) && ticker.length > 1) {
            return ticker.map(t => this.parseTicker(t));
        } else if (this.isArray(ticker) && ticker.length === 1) {
            // for single ticker return an object not an array
            return this.parseTicker(ticker[0]);
        }
    }
    parseOpenOrders(orders) {
        // SPOT
        // [
        //     {
        //       id: '573084101131',
        //       text: '3',
        //       amend_text: '-',
        //       create_time: '1714469698',
        //       update_time: '1714469698',
        //       create_time_ms: 1714469698660,
        //       update_time_ms: 1714469698660,
        //       status: 'open',
        //       currency_pair: 'USDC_USDT',
        //       type: 'limit',
        //       account: 'spot',
        //       side: 'sell',
        //       amount: '0.98',
        //       price: '1.03',
        //       time_in_force: 'gtc',
        //       iceberg: '0',
        //       left: '0.98',
        //       filled_amount: '0',
        //       fill_price: '0',
        //       filled_total: '0',
        //       fee: '0',
        //       fee_currency: 'USDT',
        //       point_fee: '0',
        //       gt_fee: '0',
        //       gt_maker_fee: '0',
        //       gt_taker_fee: '0',
        //       gt_discount: false,
        //       rebated_fee: '0',
        //       rebated_fee_currency: 'USDC',
        //       finish_as: 'open'
        //     }
        //   ]
        // FUTURES
        // [
        //     {
        //       status: 'open',
        //       size: 1,
        //       left: 1,
        //       id: 3650914663,
        //       is_liq: false,
        //       is_close: false,
        //       contract: 'BTC_USDT',
        //       text: 'web',
        //       fill_price: '0',
        //       iceberg: 0,
        //       tif: 'gtc',
        //       is_reduce_only: false,
        //       create_time: 1714462023.264,
        //       price: '60000',
        //       mkfr: '0.00015',
        //       tkfr: '0.0005',
        //       refr: '0',
        //       refu: 0,
        //       user: 13476305,
        //       biz_info: '-',
        //       amend_text: '-',
        //       stp_act: '-',
        //       stp_id: 0,
        //       update_id: 1,
        //       pnl: '0',
        //       pnl_margin: '0'
        //     }
        //   ]
        if (this.isObject(orders)) {
            let qty = this.define(orders, ['size', 'amount']);
            if (!this.define(orders, ['side'])) { // FUTURES
                if (qty < 0) {
                    qty = Math.abs(qty);
                    orders.side = 'SELL';
                } else {
                    orders.side = 'BUY';
                }
            }

            let executedQty = qty - this.define(orders, ['left']);
            return this.safeOrder({
                id: this.define(orders, ['id']),
                symbol: this.safeSymbols(this.define(orders, ['contract', 'currency_pair']), undefined, false, true),
                status: this.define(orders, ['status']),
                side: this.define(orders, ['side']),
                type: this.define(orders, ['type']),
                price: this.define(orders, ['price']),
                qty: qty,
                executedQty: executedQty,
                tif: this.define(orders, ['time_in_force', 'tif']),
                timestamp: this.parseToInt(this.define(orders, ['create_time_ms', 'create_time'])), // DO NOT MODIFY ORDER
                closePosition: this.define(orders, ['is_close']),
            });
        } else if (this.isArray(orders)) {
            return orders.map(o => this.parseOpenOrders(o));
        }
    }
    parseBalance(balances) {
        // SPOT
        // { currency: 'BTC', available: '0', locked: '0', update_id: 0 }
        // FUTURES
        // {
        //     order_margin: '113.187942',
        //     point: '0',
        //     bonus: '0',
        //     history: {
        //       dnw: '1500',
        //       pnl: '0',
        //       refr: '0',
        //       point_fee: '0',
        //       fund: '0',
        //       bonus_dnw: '0',
        //       point_refr: '0',
        //       bonus_offset: '0',
        //       fee: '0',
        //       point_dnw: '0',
        //       cross_settle: '0'
        //     },
        //     unrealised_pnl: '0',
        //     total: '1500',
        //     available: '1386.812058',
        //     enable_credit: false,
        //     in_dual_mode: false,
        //     currency: 'USDT',
        //     position_margin: '0',
        //     user: 13476305,
        //     update_time: 1714454036,
        //     update_id: 1,
        //     position_initial_margin: '0',
        //     maintenance_margin: '0',
        //     margin_mode: 0,
        //     enable_evolved_classic: false,
        //     cross_initial_margin: '0',
        //     cross_maintenance_margin: '0',
        //     cross_order_margin: '0',
        //     cross_unrealised_pnl: '0',
        //     isolated_position_margin: '0'
        // }
        if (this.isObject(balances)) {
            return this.safeBalance({
                symbol: this.define(balances, ['currency']),
                wallet: this.define(balances, ['total']),
                available: this.define(balances, ['available']),
                frozen: this.define(balances, ['locked']),
            });
        } else if (this.isArray(balances)) {
            return balances.map(b => this.parseBalance(b));
        }
    }
    parseExposure(exposures, symbol) {
        // {
        //     "user": 10000,
        //     "contract": "BTC_USDT",
        //     "size": -9440,
        //     "leverage": "0",
        //     "risk_limit": "100",
        //     "leverage_max": "100",
        //     "maintenance_rate": "0.005",
        //     "value": "3568.62",
        //     "margin": "4.431548146258",
        //     "entry_price": "3779.55",
        //     "liq_price": "99999999",
        //     "mark_price": "3780.32",
        //     "unrealised_pnl": "-0.000507486844",
        //     "realised_pnl": "0.045543982432",
        //     "pnl_pnl": "0.045543982432",
        //     "pnl_fund": "0",
        //     "pnl_fee": "0",
        //     "history_pnl": "0",
        //     "last_close_pnl": "0",
        //     "realised_point": "0",
        //     "history_point": "0",
        //     "adl_ranking": 5,
        //     "pending_orders": 16,
        //     "close_order": {
        //       "id": 232323,
        //       "price": "3779",
        //       "is_liq": false
        //     },
        //     "mode": "single",
        //     "update_time": 1684994406,
        //     "cross_leverage_limit": "0"
        // }
        // interface RESPONSE {
        //     symbol: string;
        //     qty: string;
        //     entryPrice: string;
        //     positionSide: 'LONG' | 'SHORT';
        //     leverage: string;
        //     notional: string;
        //     liquidPrice: string;
        //     marginType: 'cross' | 'isolated';
        //     unRealizedPnL: string;
        // }
        if (this.isObject(exposures)) {
            return this.safeExposure({
                symbol: symbol,
                qty: this.define(exposures, ['size']),
                entryPrice: this.define(exposures, ['entry_price']),
                positionSide: this.define(exposures, ['size']) > 0 ? 'LONG' : 'SHORT',
                leverage: this.define(exposures, ['leverage']),
                notional: this.define(exposures, ['value']),
                liquidPrice: this.define(exposures, ['liq_price']),
                marginType: this.define(exposures, ['mode']),
                unRealizedPnL: this.define(exposures, ['unrealised_pnl']),
            })
        } else if (this.isArray(exposures)) {
            return exposures.map(e => this.parseExposure(e, symbol));
        }
    }
    async commissionRate(symbol) {
        await this.loadMarkets();
        let method = 'getWalletFee';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { currency_pair: parsedSymbol });
        const response = await this[method](parameters);
        return this.parseCommissionRate(response.data, symbol);
    }
    async recentTrades(symbol, limit) {
        await this.loadMarkets();
        let method = 'getSpotTrades';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { currency_pair: parsedSymbol, limit: limit });
        const response = await this[method](parameters);
        return this.parseTrade(response.data, symbol);
    }
    async balance(symbol) {
        await this.loadMarkets();
        let method = 'getSpotAccounts';
        const parameters = {};
        this.extendWithObj(parameters, { currency_pair: symbol });
        const response = await this[method](parameters);
        return this.parseBalance(response.data);
    }
    async balances() {
        await this.loadMarkets();
        let method = 'getSpotAccounts';
        const response = await this[method]();
        return this.parseBalance(response.data);
    }
    async orderBook(symbol, limit) {
        await this.loadMarkets();
        let method = 'getSpotOrderBook';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { currency_pair: parsedSymbol, limit: limit });
        const response = await this[method](parameters);
        return this.parseOrderBook(response.data, symbol);
    }
    async ticker(symbol) {
        await this.loadMarkets();
        let method = 'getSpotTickers';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { currency_pair: parsedSymbol });
        const response = await this[method](parameters);
        return this.parseTicker(response.data);
    }
    async tickers(symbols) {
        await this.loadMarkets();
        let method = 'getSpotTickers';
        const parsedSymbols = this.safeSymbols(symbols, 'spot', false);
        const response = await this[method]();
        let data = response.data;
        if (this.isArray(symbols)) {
            data = data.filter(t => parsedSymbols.includes(t.currency_pair));
        }
        return this.parseTicker(data);
    }
    async price(symbol) {
        await this.loadMarkets();
        let method = 'getSpotTickers';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { currency_pair: parsedSymbol });
        const response = await this[method](parameters);
        return this.parsePrice(response.data[0]);
    }
    async prices() {
        await this.loadMarkets();
        let method = 'getSpotTickers';
        const response = await this[method]();
        return this.parsePrice(response.data);
    }
    async candles(symbol, timeframe, limit = 100, params = {}) {
        await this.loadMarkets();
        let method = 'getSpotCandlesticks';
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        const parsedTimeframe = this.safeTimeframe(timeframe, 'spot', false);
        const parameter = {};
        this.extendWithObj(parameter, {
            currency_pair: parsedSymbol,
            interval: parsedTimeframe,
            limit: limit,
            from: this.define(params, ['startTime']),
            to: this.define(params, ['endTime']),
        });
        const response = await this[method](parameter);
        return this.parseCandle(response.data, timeframe);
    }
    async tradeHistory(symbol, limit) {
        await this.loadMarkets();
        let method = 'getSpotMyTrades';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { currency_pair: parsedSymbol, limit: limit });
        const response = await this[method](parameters);
        return this.parseTradeHistory(response.data, symbol);
    }
    async openOrders(symbol) {
        await this.loadMarkets();
        let method = 'getSpotOrders';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, { currency_pair: parsedSymbol, status: 'open' });
        const response = await this[method](parameters);
        return this.parseOpenOrders(response.data);
    }
    async futuresCommissionRate(symbol) {
        await this.loadMarkets();
        let method = 'getFuturesSettleFee';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { settle: symbol.split('/')[1], contract: parsedSymbol });
        const response = await this[method](parameters);
        return this.parseCommissionRate(response.data[parsedSymbol], symbol);
    }
    async futuresRecentTrades(symbol, limit) {
        throw new Error('Not implemented')
        await this.loadMarkets();
        let method = 'getFuturesSettleTrades';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { settle: symbol.split('/')[1], contract: parsedSymbol, limit: limit });
        const response = await this[method](parameters);
        console.log(response.data);
        return this.parseTrade(response.data, symbol);
    }
    async futuresBalance(symbol) {
        await this.loadMarkets();
        let method = 'getFuturesSettleAccounts';
        const parameters = {};
        this.extendWithObj(parameters, { settle: symbol });
        const response = await this[method](parameters);
        return this.parseBalance(response.data);
    }
    async futuresBalances() {
        throw new Error('Not implemented');
        await this.loadMarkets();
        let method = 'getFuturesSettleAccounts';
        const settles = ['BTC', 'USDT', 'USD'];
        const promises = settles.map(settle => {
            const parameters = {};
            this.extendWithObj(parameters, { settle: settle });
            return this[method](parameters);
        });
        const response = await Promise.all(promises);
    }
    async futuresExposure(symbol) {
        await this.loadMarkets();
        let method = 'getFuturesSettlePositions';
        const parameters = {};
        this.extendWithObj(parameters, { contract: symbol.split('/')[0], settle: symbol.split('/')[1] });
        const response = await this[method](parameters);
        const exposure = this.parseExposure(response.data, symbol);
        return exposure.filter(e => e.qty != 0);
    }
    async futuresExposures() {
        throw new Error('Not implemented');
        await this.loadMarkets();
        let method = 'getFuturesSettlePositions';
        const settles = ['BTC', 'USDT', 'USD'];
        const promises = settles.map(settle => {
            const parameters = {};
            this.extendWithObj(parameters, { settle: settle });
            return this[method](parameters);
        });
        const response = await Promise.all(promises);
        const exposures = [];
        for (let i = 0; i < response.length; i++) {
            const data = response[i].data;
            for (let j = 0; j < data.length; j++) {
                exposures.push(data[j]);
            }
        }
        return this.parseExposure(exposures);
    }
    async futuresOrderBook(symbol, limit) { // TODO : Fix this
        await this.loadMarkets();
        let method = 'getFuturesSettleOrderBook';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        const parameters = {};
        this.extendWithObj(parameters, { settle: symbol.split('/')[1], contract: parsedSymbol, limit: limit });
        const response = await this[method](parameters);
        console.log(response.data);
        return this.parseOrderBook(response.data, symbol);
    }
    async futuresPrice(symbol) {
        await this.loadMarkets();
        let method = 'getFuturesSettleTickers';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        const parameters = {};
        this.extendWithObj(parameters, { settle: symbol.split('/')[1], contract: parsedSymbol });
        const response = await this[method](parameters);
        return this.parsePrice(response.data[0]);
    }
    async futuresPrices() {
        await this.loadMarkets();
        let method = 'getFuturesSettleTickers';
        const settles = ['BTC', 'USDT', 'USD'];
        const promises = settles.map(settle => {
            const parameters = {};
            this.extendWithObj(parameters, { settle: settle });
            return this[method](parameters);
        });
        let prices = [];
        for (let i = 0; i < promises.length; i++) {
            const response = await promises[i];
            prices.push(...response.data);
        }
        return this.parsePrice(prices);
    }
    async futuresCandles(symbol, timeframe, limit = 100, params = {}) {
        await this.loadMarkets();
        let method = 'getFuturesSettleCandlesticks';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        const parsedTimeframe = this.safeTimeframe(timeframe, 'futures', false);
        const parameter = {};
        this.extendWithObj(parameter, {
            settle: symbol.split('/')[1],
            contract: parsedSymbol,
            interval: parsedTimeframe,
            limit: limit,
            from: this.define(params, ['startTime']),
            to: this.define(params, ['endTime']),
        });
        const response = await this[method](parameter);
        return this.parseCandle(response.data, timeframe);
    }
    async futuresTradeHistory(symbol, limit) {
        await this.loadMarkets();
        let method = 'getFuturesSettleMyTrades';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { settle: symbol.split('/')[1], contract: parsedSymbol, limit: limit });
        const response = await this[method](parameters);
        return this.parseTradeHistory(response.data, symbol);
    }
    async futuresOpenOrders(symbol) {
        await this.loadMarkets();
        let method = 'getFuturesSettleOrders';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { settle: symbol.split('/')[1], contract: parsedSymbol, status: 'open' });
        const response = await this[method](parameters);
        return this.parseOpenOrders(response.data)
    }
    async setLeverage(symbol, leverage) {
        await this.loadMarkets();
        let method = 'postFuturesSettlePositionsContractLeverage';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, { settle: symbol.split('/')[1], contract: parsedSymbol, leverage: leverage });
        const response = await this[method](parameters);
        return response.data;
    }
    async order(symbol, side, argQty, argPrice, params = {}) {
        await this.loadMarkets();
        let method = 'postSpotOrders';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        this.extendWithObj(parameters, {
            body: { currency_pair: parsedSymbol, side: side, amount: argQty, price: argPrice }
        });
        const response = await this[method](parameters);
        return response.data;
    }
    async futuresOrder(symbol, side, argQty, argPrice, params = {}) {
        await this.loadMarkets();
        let method = 'postFuturesSettleOrders';
        const parameters = {};
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        this.extendWithObj(parameters, {
            settle: symbol.split('/')[1],
            body: { contract: parsedSymbol, side: side, size: argQty, price: argPrice }
        });
        const response = await this[method](parameters);
        return response.data;
    }
    // -- websocket methods -- //
    handleSocketOpen(channel, payload = {}, isPrivate = false) {
        console.log('socket open', channel);
    }
    handleSocketClose(channel) {
        console.log('socket close', channel);
    }
    handleSocketError(channel, error) {
        console.log('socket error', channel, error);
    }
    handleSocketMessage(method, event) {
        const data = JSON.parse(event.data);
        if (data.error) {
            throw new Error(JSON.stringify(data.error));
        }
        const methods = {
            trade: this.handleTradeStream,
            candle: this.handleCandleStream,
            orderBook: this.handleOrderBookStream,
            balance: this.handleBalanceStream,
            order: this.handleOrderStream,
            orderUpdate: this.handleOrderUpdateStream,
            execution: this.handleExecutionStream,
            futuresCandle: this.handleCandleStream,
        };
        const handler = methods[method];
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
        throw new Error('Not implemented');
        let method = 'postApiV3UserDataStream';
        const response = await this[method]();
        return response.data.listenKey;
    }
    async putListenKey(listenKey) {
        throw new Error('Not implemented');
        let method = 'putApiV3UserDataStream';
        const parameters = { listenKey: listenKey };
        const response = await this[method](parameters);
        return response.data;
    }
    async postFuturesListenKey() { }
    async putFuturesListenKey() { }
    async postDeliveryListenKey() { }
    async putDeliveryListenKey() { }
    async keepAlive(method, listenKey) {
        throw new Error('Not implemented');
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
        // const isPrivate = this.isValid(this.ws.private[method]) ? true : false;
        // if (isPrivate) {
        //     try {
        //         let listenKey = undefined;
        //         if (method.includes('futures')) {
        //             listenKey = await this.postFuturesListenKey();
        //         } else if (method.includes('delivery')) {
        //             listenKey = await this.postDeliveryListenKey();
        //         } else {
        //             listenKey = await this.postListenKey();
        //         }
        //         url += `?listenKey=${listenKey}`;
        //         if (this.options.reconnect) {
        //             this.schedule(180000, this.keepAlive(), method, listenKey);
        //         }
        //     } catch (error) {
        //         // TODO
        //     }
        // }
        // let url = baseUrl + market + '/public?stream=' + pathValue;
        return url;
    }
    handleTradeStream(data) {
        if (data.result && data.result.status === 'success') {
            return;
        }
        // SPOT
        // {
        //     time: 1715049060,
        //     time_ms: 1715049060416,
        //     channel: 'spot.trades',
        //     event: 'update',
        //     result: {
        //       id: 8979302382,
        //       create_time: 1715049060,
        //       create_time_ms: '1715049060408.0',
        //       side: 'buy',
        //       currency_pair: 'BTC_USDT',
        //       amount: '0.2421',
        //       price: '63795.8',
        //       range: '37842068-37842068'
        //     }
        //   }
        // FUTURES
        // {
        //     channel: 'futures.trades',
        //     event: 'update',
        //     result: [
        //       {
        //         id: 309103170,
        //         size: -496,
        //         create_time: 1715049378,
        //         create_time_ms: 1715049378140,
        //         price: '63710',
        //         contract: 'BTC_USDT'
        //       }
        //     ],
        //     time: 1715049378,
        //     time_ms: 1715049378150
        //   }
        if (this.isArray(data.result)) {
            if (data.result.length > 1) {
                throw new Error('Multiple trades not supported');
            }
            data.result = data.result[0];
        }
        const symbol = this.define(data.result, ['currency_pair', 'contract']);
        const price = this.define(data.result, ['price']);
        const qty = this.define(data.result, ['amount', 'size']);
        let side = this.define(data.result, ['side']);
        if (!side) {
            side = qty < 0 ? 'SELL' : 'BUY';
        }
        const timestamp = data.time_ms;
        return this.safeTrade({
            symbol: symbol,
            price: price,
            qty: qty,
            side: side,
            timestamp: timestamp,
        });
    }
    handleCandleStream(data) {
        if (data.result && data.result.status === 'success') {
            return;
        }
        // SPOT
        // {
        //     "time": 1606292600,
        //     "time_ms": 1606292600376,
        //     "channel": "spot.candlesticks",
        //     "event": "update",
        //     "result": {
        //       "t": "1606292580",
        //       "v": "2362.32035",
        //       "c": "19128.1",
        //       "h": "19128.1",
        //       "l": "19128.1",
        //       "o": "19128.1",
        //       "n": "1m_BTC_USDT",
        //       "a": "3.8283",
        //       "w": true
        //     }
        //  }
        // FUTURES
        // {
        //     time: 1712226407,
        //     time_ms: 1712226407505,
        //     channel: 'futures.candlesticks',
        //     event: 'update',
        //     result: [
        //       {
        //         t: 1712226360,
        //         v: 26481,
        //         c: '66418.6',
        //         h: '66456.9',
        //         l: '66418.6',
        //         o: '66456.9',
        //         n: '1m_BTC_USDT'
        //       }
        //     ]
        // }

        // Note: SPOT results are directly in an object, while FUTURES results are wrapped in an array.
        let kline;
        if (this.isArray(data.result)) {
            // For FUTURES, the result is an array
            kline = data.result[0];
        } else {
            // For SPOT, the result is directly an object
            kline = data.result;
        }
        const timeframe = this.safeString(kline, 'n').split('_')[0];
        const openTime = this.toMilliseconds(kline.t);
        const closeTime = Precise.stringAdd(String(this.timeframeConvert[timeframe]), String(openTime)) - 1
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
        if (data.result && data.result.status === 'success') {
            return;
        }
        // SPOT
        // {
        //     {
        //       time: 1715051079,
        //       time_ms: 1715051079637,
        //       channel: 'spot.order_book_update',
        //       event: 'update',
        //       result: {
        //         t: 1715051079615,
        //         e: 'depthUpdate',
        //         E: 1715051079,
        //         s: 'BTC_USDT',
        //         U: 17368812808,
        //         u: 17368812839,
        //         b: [Array],
        //         a: [Array]
        //       }
        //     }
        // }
        // FUTURES
        // {
        //     "time": 1615366381,
        //     "time_ms": 1615366381123,
        //     "channel": "futures.order_book_update",
        //     "event": "update",
        //     "result": {
        //       "t": 1615366381417,
        //       "s": "BTC_USD",
        //       "U": 2517661101,
        //       "u": 2517661113,
        //       "b": [
        //         {
        //           "p": "54672.1",
        //           "s": 0
        //         },
        //         {
        //           "p": "54664.5",
        //           "s": 58794
        //         }
        //       ],
        //       "a": [
        //         {
        //           "p": "54743.6",
        //           "s": 0
        //         },
        //         {
        //           "p": "54742",
        //           "s": 95
        //         }
        //       ]
        //     }
        //   }
        // How to maintain local order book:

        // 1. Subscribe spot.order_book_update, e.g. ["BTC_USDT", "1000ms"] pushes update in BTC_USDT order book every 1s
        // 2. Cache WebSocket notifications. Every notification use U and u to tell the first and last update ID since last notification.
        // 3. Retrieve base order book using REST API, and make sure the order book ID is recorded(referred as baseID below) e.g. https://api.gateio.ws/api/v4/spot/order_book?currency_pair=BTC_USDT&limit=100&with_id=true retrieves the full base order book of BTC_USDT
        // 4. Iterate the cached WebSocket notifications, and find the first one which the baseID falls into, i.e. U <= baseId+1 and u >= baseId+1, then start consuming from it. Note that amount in notifications are all absolute values. Use them to replace original value in corresponding price. 
        //    If amount equals to 0, delete the price from the order book.
        // 5. Dump all notifications which satisfy u < baseID+1. If baseID+1 < first notification U, it means current base order book falls behind notifications. Start from step 3 to retrieve newer base order book.
        // If any subsequent notification which satisfy U > baseID+1 is found, it means some updates are lost. Reconstruct local order book from step 3.

        const symbol = this.define(data.result, ['s']);
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false, true);
        const market = data.channel.split('.')[0];
        const timestamp = data.time_ms;
        const id = `${symbol}-${market}`;
        if (!this[`${id}OrderBook`]) {
            this[`${id}OrderBook`] = new OrderBook(parsedSymbol);
        }

        if (market === 'futures') {
            data.result.a = data.result.a.map(e => [e.p, e.s]);
            data.result.b = data.result.b.map(e => [e.p, e.s]);
        }
        this[`${id}OrderBook`].buffer.push(data);
        this.processOrderBookUpdates(id, symbol, timestamp, market).catch(e => {
            // if (e instanceof DataLost) {
            //     this[`${id}OrderBook`].firstCall = true;
            // } else {
            throw e;
            // }
        });
        if (this[`${id}OrderBook`].isProcessed === true) {
            return this[`${id}OrderBook`];
        }
        return; // At this point the order book is not initialized yet
    }
    async processOrderBookUpdates(id, symbol, timestamp, market) {
        async function initializeOrderBook() {
            if (this[`${id}OrderBook`].firstCall === true) {
                this[`${id}OrderBook`].firstCall = false;

                setTimeout(async () => { // Fetch order book after 10 seconds
                    const response = await (market === 'spot'
                        ? this.getSpotOrderBook({ currency_pair: symbol, limit: 300, with_id: true })
                        : this.getFuturesSettleOrderBook({ settle: symbol.split('_')[1], contract: symbol, limit: 300, with_id: true }));
                    const depthSnapshot = response.data;

                    if (market === 'futures') {
                        depthSnapshot.asks = depthSnapshot.asks.map(e => [e.p, String(e.s)]);
                        depthSnapshot.bids = depthSnapshot.bids.map(e => [e.p, String(e.s)]);
                    }
                    this[`${id}OrderBook`]._data.asks = depthSnapshot.asks;
                    this[`${id}OrderBook`]._data.bids = depthSnapshot.bids;
                    this[`${id}OrderBook`].lastUpdateId = depthSnapshot.id;
                }, 10000);

                return;
            }
        }
        initializeOrderBook.bind(this)();

        if (this[`${id}OrderBook`].lastUpdateId && this[`${id}OrderBook`].isFindFirstEvent === false) {
            const firstEventIndex = this[`${id}OrderBook`].buffer.findIndex(
                e => e.result.U <= this[`${id}OrderBook`].lastUpdateId + 1 && e.result.u >= this[`${id}OrderBook`].lastUpdateId + 1
            );
            if (firstEventIndex !== -1) {
                this[`${id}OrderBook`].isFindFirstEvent = true;
                this[`${id}OrderBook`].buffer = this[`${id}OrderBook`].buffer.slice(
                    firstEventIndex,
                    this[`${id}OrderBook`].buffer.length,
                );
                const firstEvent = this[`${id}OrderBook`].buffer[0];
                this[`${id}OrderBook`].lastUpdateId = firstEvent.result.U - 1;
            } else {
                this[`${id}OrderBook`].lastUpdateId = null;
                this[`${id}OrderBook`].firstCall = true;
                initializeOrderBook.bind(this)();
            }
        }

        while (this[`${id}OrderBook`].isFindFirstEvent === true && this[`${id}OrderBook`].buffer.length > 0) {
            let event = this[`${id}OrderBook`].buffer.shift();
            event = event.result;
            if (event.U === this[`${id}OrderBook`].lastUpdateId + 1) {
                this[`${id}OrderBook`].lastUpdateId = event.u;
            } else {
                throw new DataLost('Data lost')
            }

            const updateOrderBook = (currentBook, updates) => {
                const currentOrderBook = new Map(currentBook.map(([price, qty]) => [price, qty]));
                updates.forEach(([price, qty]) => {
                    if (Precise.stringEquals(String(qty), '0')) {
                        currentOrderBook.delete(price);
                    } else {
                        currentOrderBook.set(price, qty);
                    }
                });
                return Array.from(currentOrderBook);
            }
            let asks = updateOrderBook(this[`${id}OrderBook`]._data.asks, event.a);
            let bids = updateOrderBook(this[`${id}OrderBook`]._data.bids, event.b);
            this[`${id}OrderBook`]._data.asks = asks.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
            this[`${id}OrderBook`]._data.bids = bids.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
            this[`${id}OrderBook`]._data.timestamp = timestamp;

            this[`${id}OrderBook`].isProcessed = true;
        }
    }
    async tradeStream(symbol) {
        await this.loadMarkets();
        let method = 'trade';
        let channel = 'spot.trades';
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        const urls = this.urls['base']['ssV4'];
        const url = await this.authenticate(method, urls);
        const payload = {
            time: this.now(),
            channel: channel,
            event: 'subscribe',
            payload: [parsedSymbol],
        };
        return this.handleStream(url, method, payload);
    }
    async candleStream(symbol, timeframe) {
        await this.loadMarkets();
        let method = 'candle';
        let channel = 'spot.candlesticks';
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        const urls = this.urls['base']['ssV4'];
        const url = await this.authenticate(method, urls);
        const payload = {
            time: this.now(),
            channel: channel,
            event: 'subscribe',
            payload: [timeframe, parsedSymbol],
        };
        return this.handleStream(url, method, payload);
    }
    async orderBookStream(symbol) {
        await this.loadMarkets();
        let method = 'orderBook';
        let channel = 'spot.order_book_update'
        const parsedSymbol = this.safeSymbols(symbol, 'spot', false);
        const urls = this.urls['base']['ssV4'];
        const url = await this.authenticate(method, urls);
        const payload = {
            time: this.now(),
            channel: channel,
            event: 'subscribe',
            payload: [parsedSymbol, '100ms'],
        };
        return this.handleStream(url, method, payload);
    }
    async futuresTradeStream(symbol) {
        await this.loadMarkets();
        let method = 'trade';
        let channel = 'futures.trades';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        const urls = this.urls['base']['sfV4'];
        const url = await this.authenticate(method, urls);
        const payload = {
            time: this.now(),
            channel: channel,
            event: 'subscribe',
            payload: [parsedSymbol],
        };
        return this.handleStream(url, method, payload);
    }
    async futuresCandleStream(symbol, timeframe) {
        await this.loadMarkets();
        let method = 'futuresCandle';
        let channel = 'futures.candlesticks';
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        const urls = this.urls['base']['sfV4'];
        const url = await this.authenticate(method, urls);
        const payload = {
            time: this.now(),
            channel: channel,
            event: 'subscribe',
            payload: [timeframe, parsedSymbol],
        };
        return this.handleStream(url, method, payload);
    }
    async futuresOrderBookStream(symbol) {
        await this.loadMarkets();
        let method = 'orderBook';
        let channel = 'futures.order_book_update'
        const parsedSymbol = this.safeSymbols(symbol, 'futures', false);
        const urls = this.urls['base']['sfV4'];
        const url = await this.authenticate(method, urls);
        const payload = {
            time: this.now(),
            channel: channel,
            event: 'subscribe',
            payload: [parsedSymbol, '100ms'],
        };
        return this.handleStream(url, method, payload);
    }
}
