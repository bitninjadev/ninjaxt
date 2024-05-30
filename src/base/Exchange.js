import axios from 'axios';
import {
    Unavailable,
    EmptyParameters,
    AuthenticationError,
    NetworkError,
    InvalidOrder,
    InvalidParameters,
    Timeout,
    InternalServerError,
    DDoSProtection,
    ExchangeError,
    TooManyRequests,
} from './errors.js';
import {
    hasProp,
    isValid,
    isObject,
    isArray,
    define,
    numberToString,
    safeFloat,
    safeInteger,
    safeValue,
    safeTimestamp,
    safeString,
    safeStringLower,
    safeStringUpper,
    extend,
    extendWithKey,
    extendWithObj,
    deepExtend,
    upperCase,
    lowerCase,
    sortBy,
    isEmpty,
    schedule,
    toMilliseconds,
    decimalPlaces,
    parseToInt,
} from './functions/utils.js';
import { BaseClient } from './ws/baseClient.js';
import { Precise } from './functions/Precise.js';
import { timeframeConvert } from './functions/constants.js';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

export class BaseExchange {
    constructor(userConfig = {}) {
        this.exchange = this.constructor.name;
        this.apiKey = undefined;
        this.apiSecret = undefined;
        this.verbose = undefined;
        this.timeDifference = undefined;
        this.hasProp = hasProp;
        this.define = define;
        this.extend = extend;
        this.deepExtend = deepExtend;
        this.extendWithKey = extendWithKey;
        this.extendWithObj = extendWithObj;
        this.numberToString = numberToString;
        this.upperCase = upperCase;
        this.lowerCase = lowerCase;
        this.sortBy = sortBy;
        this.isEmpty = isEmpty;
        this.isValid = isValid;
        this.isArray = isArray;
        this.isObject = isObject;
        this.safeFloat = safeFloat;
        this.safeInteger = safeInteger;
        this.safeString = safeString;
        this.safeValue = safeValue;
        this.safeTimestamp = safeTimestamp;
        this.safeStringLower = safeStringLower;
        this.safeStringUpper = safeStringUpper;
        this.schedule = schedule;
        this.decimalPlaces = decimalPlaces;
        this.toMilliseconds = toMilliseconds;
        this.timeframeConvert = timeframeConvert;
        this.parseToInt = parseToInt;
        const api = this.has();
        this.defineRestApi(api.endpoints);
        this.initializeEntry(userConfig);
        this.instruments = {};
        this.markets = {};
        this.proxyUrl = undefined;
        this.proxyProtocol = undefined;
        this.proxyHostname = undefined;
        this.proxyPort = undefined;
        this.proxyAgent = undefined;
        this.wallets = {};
        this.exposures = {};
    }
    has() {
        return {
            features: {
                ws: true,
                publicAPI: true,
                privateAPI: true,
                spot: undefined,
                futures: undefined,
                delievery: undefined,
                options: undefined,
                //  --- spot trading --- //
                limitOrder: true,
                marketOrder: true,
                stopLimitOrder: true,
                stopMarketOrder: true,
                trailingLimitOrder: true,
                trailingMarketOrder: true,
                cancelOrder: true,
                cancelAllOrders: true,
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
                futuresLimitOrder: undefined,
                futuresMarketOrder: undefined,
                futuresStopLimitOrder: undefined,
                futuresStopMarketOrder: undefined,
                futuresTrailingLimitOrder: undefined,
                futuresTrailingMarketOrder: undefined,
                futuresCancelOrder: undefined,
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
                base: undefined,
                sandbox: undefined,
            },
            endpoints: {
                public: {
                    get: undefined,
                    post: undefined,
                    put: undefined,
                    delete: undefined,
                },
                private: {
                    get: undefined,
                    post: undefined,
                    put: undefined,
                    delete: undefined,
                },
            },
            ws: {
                public: undefined,
                private: undefined,
            },
        };
    }
    getDefaultOptions() {
        return {
            apiKey: undefined,
            apiSecret: undefined,
            useTestNet: false,
            timeout: 1000,
            reconnect: true,
            verbose: true,
        };
    }
    checkCredentials() {
        if (!this.apiKey || !this.apiSecret) {
            throw new AuthenticationError(this.exchange + ' ' + 'apiKey and apiSecret must be specified');
        }
    }
    updateCredentials(userConfig = {}) {
        this.apiKey = userConfig.apiKey;
        this.apiSecret = userConfig.apiSecret;
    }
    initializeEntry(userConfig = {}) {
        const configEntries = Object.entries(this.has()).concat(Object.entries(userConfig));
        for (let i = 0; i < configEntries.length; i++) {
            const [property, value] = configEntries[i];
            if (value && Object.getPrototypeOf(value) === Object.prototype) {
                this[property] = this.deepExtend(this[property], value);
            } else {
                this[property] = value;
            }
        }
    }
    async handleResponse(response, callback = console.log()) {
        // This is a stub function. Please override it in a subclass if needed.
        throw new Unavailable(this.exchange + ' ' + 'handleResponse() not supported');
    }
    now() {
        const timeDiff = this.timeDifference || 0;
        return Date.now() - timeDiff;
    }
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    defineRestApi(api, paths = []) {
        const keys = Object.keys(api);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = api[key];
            const subPaths = paths.concat(key);
            const methods = Object.keys(value);
            for (let j = 0; j < methods.length; j++) {
                const method = methods[j];
                Object.keys(value[method]).forEach(endpoint => {
                    this.defineRestApiEndpoint(method, endpoint, value[method][endpoint], subPaths);
                });
            }
        }
    }
    defineRestApiEndpoint(method, endpoint, config, paths = []) {
        const isPrivate = paths.includes('private');
        const functionName = this.generateFunctionName(method, endpoint);
        this[functionName] = async (params = {}, context = {}) => {
            const version = config.versions[0];
            const base = this.urls['base'][version];
            const url = base + endpoint;
            return this.request(url, method, params, context, isPrivate);
        };
    }
    generateFunctionName(method, path) {
        const methodName = method.toLowerCase();
        // Split path by '/', '?', and '_' and remove empty parts
        const pathParts = path
            .split(/[\/\?_]/)
            .filter(Boolean)
            .map(part => part.replace(/[{}]/g, '')); // Remove curly braces
        const functionName = pathParts.map((part, index) => (index === 0 ? part : this.capitalize(part))).join('');
        return `${methodName}${this.capitalize(functionName)}`;
    }
    async checkProxySettings() {
        if (this.proxyUrl) {
            const url = new URL(this.proxyUrl);
            this.proxyProtocol = url.protocol;
            this.proxyHostname = url.hostname;
            this.proxyPort = url.port || (this.proxyProtocol === 'http:' ? '80' : '443');

            if (this.proxyProtocol === 'http:') {
                const proxyAgent = new HttpProxyAgent(this.proxyUrl);
                proxyAgent.keepAlive = true;
                this.proxyAgent = proxyAgent;
            } else if (this.proxyProtocol === 'https:') {
                const proxyAgent = new HttpsProxyAgent(this.proxyUrl);
                proxyAgent.keepAlive = true;
                this.proxyAgent = proxyAgent;
            } else {
                throw new Unavailable('Unsupported proxy protocol');
            }
        }
    }
    async request(url, method = 'GET', body = undefined, config = {}, isPrivate = false) {
        await this.checkProxySettings();
        if (isPrivate) {
            this.checkCredentials();
        }
        const requestOptions = this.sign(url, method, body, isPrivate);
        return await this.requestAPI(requestOptions);
    }
    sign(url, method = 'GET', body = undefined, isPrivate = false) {
        // This is a stub function. Please override it in a subclass.
        throw new Unavailable(this.exchange + ' ' + 'sign() not supported');
    }
    /**
     * @param {string} url - api endpoint
     * @param {string} method - request method
     * @param {object} header - header (optional)
     * @param {object} data - other datas (optional)
     */
    async requestAPI(requestOptions) {
        const { url, method, headers, body } = requestOptions;

        const options = {};
        this.extendWithObj(options, {
            url: url,
            method: method,
            headers: headers,
            data: body,
            timeout: this.timeout,
            validateStatus: function (status) {
                return true; // Treat all HTTP status codes as 'success'
            },
        });
        if (this.proxyUrl) {
            this.extendWithObj(options, { proxy: { protocol: this.proxyProtocol, host: this.proxyHostname, port: this.proxyPort } });
        }
        let response = undefined;
        try {
            response = await axios.request(options);
        } catch (error) {
            throw new NetworkError(this.exchange + ' ' + options.url + ' ' + '{' + error.message + '}');
        }
        return this.handleRestResponse(response, options.url, options.method, options.headers, options.data);
    }
    handleRestResponse(response, url, method = 'GET', requestHeaders = undefined, requestBody = undefined) {
        const skipFurtherErrorHandling = this.handleErrors(
            response.status,
            response.statusText,
            url,
            method,
            response.headers,
            response.data,
            response,
            requestHeaders,
            requestBody,
        );
        if (!skipFurtherErrorHandling) {
            this.handleHttpStatusCode(response.status, response.statusText, url, method, response.data);
        }
        return response;
    }
    handleErrors(statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        // it is a stub method that must be overrided in the derived exchange classes
        return undefined;
    }
    handleHttpStatusCode(statusCode, statusText, url, method, responseBody) {
        if (statusCode >= 400) {
            throw new ExchangeError(this.exchange + ' ' + url + ' ' + JSON.stringify(responseBody));
        }
    }
    safeSymbols(symbols = undefined, assetType = undefined, allowEmpty = undefined, isParsing = undefined) {
        let market = this.markets[assetType] || {};
        if ((allowEmpty === false && !symbols) || (this.isArray(symbols) && symbols.length === 0)) {
            throw new EmptyParameters(this.exchange + ' ' + 'symbol must be specified');
        }
        const isInputArray = this.isArray(symbols);
        const symbolsArray = isInputArray ? symbols : [symbols];
        if (isParsing && assetType) {
            market = this.markets['parsed'][assetType];
        } else if (isParsing && !assetType) {
            Object.keys(this.markets['parsed']).forEach(assetType => {
                if (this.hasProp(this.markets['parsed'][assetType], symbolsArray)) {
                    market = this.markets['parsed'][assetType];
                }
            });
        }
        const missingSymbols = symbolsArray.filter(symbol => !this.hasProp(market, [symbol]));
        if (missingSymbols.length > 0) {
            throw new InvalidParameters(`${this.exchange} ${missingSymbols.join(', ')} symbol(s) not supported`);
        }
        const parsedSymbols = symbolsArray.map(symbol => market[symbol][isParsing ? 'symbol' : 'id']);
        return isInputArray ? parsedSymbols : parsedSymbols[0];
    }
    safeTimeframe(timeframe, assetType = undefined, params = {}) {
        const tf = this.has().timeframes[assetType];
        if (typeof timeframe === 'undefined' || !timeframe) {
            throw new EmptyParameters(this.exchange + ' ' + 'timeframe must be specified');
        }
        if (!this.hasProp(tf, [timeframe])) {
            throw new InvalidParameters(`${this.exchange} ${timeframe} timeframe not supported`);
        }
        return tf[timeframe];
    }
    parseMarkets() {
        // must be implemented in a subclass
        // this.instrument = { spot: {BTCUSDT: BTC_USDT ...}, futures: {}}
        throw new Unavailable(this.exchange + ' ' + 'parseMarkets() not supported');
    }
    async loadMarkets() {
        // must be implemented in a subclass
        throw new Unavailable(this.exchange + ' ' + 'loadMarkets() not supported');
    }
    async getMarkets() {
        await this.loadMarkets();
        let markets = this.markets;
        delete markets['parsed'];
        return markets;
    }
    async getInstruments(assetType = undefined) {
        // returns an array of trading symbols
        if (!assetType) throw new EmptyParameters(this.exchange + ' ' + 'getInstruments() assetType must be specified');
        await this.loadInstruments();
        return Object.keys(this.instruments[assetType]);
    }
    async loadWallets(assetType = undefined) {
        // assetType = 'spot' or 'futures'
        if (!assetType) throw new EmptyParameters(this.exchange + ' ' + 'loadWallets() assetType must be specified');
        if (this.wallets[assetType]) return; // wallets already loaded
        const updateWallets = async (balanceType, methodName) => {
            const balances = await this[methodName]();
            this.wallets[assetType] = {};
            for (let i = 0; i < balances.length; i++) {
                const symbol = this.safeStringUpper(balances[i], 'symbol');
                const wallet = this.safeString(balances[i], 'wallet');
                const available = this.safeString(balances[i], 'available');
                const frozen = this.safeString(balances[i], 'frozen');
                this.wallets[balanceType][symbol] = {
                    symbol: symbol,
                    wallet: wallet,
                    available: available,
                    frozen: frozen,
                };
            }
        };
        const method = assetType === 'spot' ? 'balances' : 'futuresBalances';
        await updateWallets(assetType, method);
    }
    getWallets(assetType = 'spot') {
        if (!assetType) throw new EmptyParameters(this.exchange + ' ' + 'getWallets() assetType must be specified');
        return this.wallets[assetType];
    }
    async loadPositions(assetType = undefined) {
        if (!assetType) throw new EmptyParameters(this.exchange + ' ' + 'loadPositions() assetType must be specified');
        if (this.exposures[assetType]) return; // positions already loaded
        const updatePositions = async (positionType, methodName) => {
            const positions = await this[methodName]();
            this.exposures[assetType] = {};
            for (let i = 0; i < positions.length; i++) {
                const symbol = this.safeStringUpper(positions[i], 'symbol');
                const qty = this.safeString(positions[i], 'qty');
                const entryPrice = this.safeString(positions[i], 'entryPrice');
                const positionSide = this.safeString(positions[i], 'positionSide');
                const leverage = this.safeString(positions[i], 'leverage');
                const notional = this.safeString(positions[i], 'notional');
                const liquidPrice = this.safeString(positions[i], 'liquidPrice');
                const marginType = this.safeString(positions[i], 'marginType');
                const unRealizedPnL = this.safeString(positions[i], 'unRealizedPnL');
                this.exposures[positionType][symbol] = {
                    symbol: symbol,
                    qty: qty,
                    entryPrice: entryPrice,
                    positionSide: positionSide,
                    leverage: leverage,
                    notional: notional,
                    liquidPrice: liquidPrice,
                    marginType: marginType,
                    unRealizedPnL: unRealizedPnL,
                };
            }
        };
    }
    client(channel, handleSocketOpen, handleSocketClose, handleSocketMessage, handleSocketError, payload = {}, method) {
        const options = this.getDefaultOptions();
        if (this.proxyAgent) {
            options.agent = this.proxyAgent;
        }
        const ws = new BaseClient(options, handleSocketOpen, handleSocketClose, handleSocketMessage, handleSocketError, method);
        ws.subscribe(channel, payload);

        return ws;
    }
    safeCommissionRate(commission) {
        return {
            symbol: this.safeStringUpper(commission, 'symbol', null),
            maker: this.safeString(commission, 'maker', null),
            taker: this.safeString(commission, 'taker', null),
        };
    }
    safeTrade(trade) {
        let price = this.safeString(trade, 'price', null);
        let qty = this.safeString(trade, 'qty', null);
        let quoteQty = this.safeString(trade, 'quoteQty', null);

        if (price !== null && qty !== null && quoteQty === null) {
            trade.quoteQty = Precise.stringMul(price, qty);
        }
        if (price !== null && qty === null && quoteQty !== null) {
            trade.qty = Precise.stringDiv(quoteQty, price);
        }
        if (price === null && qty !== null && quoteQty !== null) {
            trade.price = Precise.stringDiv(quoteQty, qty);
        }
        return {
            timestamp: this.safeTimestamp(trade, 'timestamp', null),
            price: this.safeString(trade, 'price', null),
            qty: this.safeString(trade, 'qty', null),
            quoteQty: this.safeString(trade, 'quoteQty', null),
            side: this.safeStringUpper(trade, 'side', null),
        };
    }
    safeTradeHistory(trade) {
        const response = {
            timestamp: this.safeTimestamp(trade, 'timestamp'),
            orderId: this.safeString(trade, 'orderId', null),
            symbol: this.safeStringUpper(trade, 'symbol', null),
            side: this.safeString(trade, 'side', null),
            price: this.safeString(trade, 'price', null),
            qty: this.safeString(trade, 'qty', null),
            isMaker: this.safeString(trade, 'isMaker', null),
            commission: this.safeString(trade, 'commission', null),
        };
        this.extendWithObj(response, {
            realizedPnl: this.safeString(trade, 'realizedPnl', null),
        });
        return response;
    }
    safeOrderBook(orderbook, symbol, timestamp = undefined, limit) {
        const parseBidsAsks = data => data.map(([price, amount]) => ({ price, amount }));
        let bids = parseBidsAsks(this.safeValue(orderbook, 'bids', []));
        let asks = parseBidsAsks(this.safeValue(orderbook, 'asks', []));
        bids = this.sortBy(bids, 'price', true); // bids are sorted in descending order
        asks = this.sortBy(asks, 'price'); // asks are sorted in ascending order

        if (limit) {
            bids = bids.slice(0, limit);
            asks = asks.slice(0, limit);
        }
        return {
            symbol: this.safeStringUpper(orderbook, 'symbol', symbol),
            asks,
            bids,
            timestamp: timestamp,
        };
    }
    safeOrderBooks(orderbooks) {
        return {
            symbol: this.safeString(orderbooks, 'symbol', null),
            bestBidPrice: this.safeString(orderbooks, 'bestBidPrice', null),
            bestBidQty: this.safeString(orderbooks, 'bestBidQty', null),
            bestAskPrice: this.safeString(orderbooks, 'bestAskPrice', null),
            bestAskQty: this.safeString(orderbooks, 'bestAskQty', null),
            timestamp: this.safeTimestamp(orderbooks, 'timestamp', null),
        };
    }
    safePrice(price) {
        return { [this.safeStringUpper(price, 'symbol')]: this.safeString(price, 'price') };
    }
    safeTicker(ticker) {
        /*
         * {
         *  symbol: 'BTC/USDT',
         *  open: 0.0001,
         *  high: 0.0001,
         *  low: 0.0001,
         *  close: 0.0001,
         *  volume: 0.0001,
         * }
         */
        return {
            symbol: this.safeStringUpper(ticker, 'symbol', null),
            open: this.safeString(ticker, 'open', null),
            high: this.safeString(ticker, 'high', null),
            low: this.safeString(ticker, 'low', null),
            close: this.safeString(ticker, 'close', null),
            volume: this.safeString(ticker, 'volume', null),
        };
    }
    safeBalance(balance) {
        let wallet = this.safeString(balance, 'wallet', null);
        let available = this.safeString(balance, 'available', null);
        let frozen = this.safeString(balance, 'frozen', null);

        if (wallet === null && available !== null && frozen !== null) {
            balance.wallet = Precise.stringAdd(available, frozen);
        }
        if (available === null && wallet !== null && frozen !== null) {
            balance.available = Precise.stringSub(wallet, frozen);
        }
        if (frozen === null && wallet !== null && available !== null) {
            balance.frozen = Precise.stringAbs(Precise.stringSub(wallet, available));
        }

        return {
            symbol: this.safeString(balance, 'symbol'),
            wallet: this.safeString(balance, 'wallet'),
            available: this.safeString(balance, 'available'),
            frozen: this.safeString(balance, 'frozen'),
        };
    }
    safeCandle(candle = {}) {
        return {
            openTime: this.safeTimestamp(candle, 'openTime'),
            closeTime: this.safeTimestamp(candle, 'closeTime'),
            open: this.safeString(candle, 'open'),
            high: this.safeString(candle, 'high'),
            low: this.safeString(candle, 'low'),
            close: this.safeString(candle, 'close'),
            volume: this.safeString(candle, 'volume'),
        };
    }
    safeOrder(order = {}) {
        const response = {
            timestamp: this.safeTimestamp(order, 'timestamp', null),
            id: this.safeString(order, 'id', null),
            symbol: this.safeStringUpper(order, 'symbol', null),
            price: this.safeString(order, 'price', null),
            qty: this.safeString(order, 'qty', null),
            type: this.safeStringUpper(order, 'type', null), // LIMIT, MARKET, TP, SL, TRAILING
            tif: this.safeStringUpper(order, 'tif', null), // GTC, IOC, FOK, GTD, GTX (POSTONLY)
            side: this.safeStringUpper(order, 'side', null), // BUY or SELL for both spot and futures
        };
        this.extendWithObj(response, {
            executedQty: this.safeString(order, 'executedQty', null),
            reduceOnly: order.reduceOnly,
            closePosition: order.closePosition,
        });
        return response;
    }
    safeExposure(exposure) {
        return {
            symbol: this.safeStringUpper(exposure, 'symbol', null),
            qty: this.safeString(exposure, 'qty', null),
            entryPrice: this.safeString(exposure, 'entryPrice', null),
            positionSide: this.safeString(exposure, 'positionSide', null),
            leverage: this.safeString(exposure, 'leverage', null),
            notional: this.safeString(exposure, 'notional', null),
            liquidPrice: this.safeString(exposure, 'liquidPrice', null),
            marginType: this.safeString(exposure, 'marginType', null),
            unRealizedPnL: this.safeString(exposure, 'unRealizedPnL', null),
        };
    }
    async checkSystemStatus() {
        throw new Unavailable(this.exchange + ' ' + 'checkSystemStatus() not supported');
    }
    async commissionRate() {
        throw new Unavailable(this.exchange + ' ' + 'commissionRate() not supported');
    }
    async recentTrades(symbol, limit) {
        throw new Unavailable(this.exchange + ' ' + 'recentTrades() not supported');
    }
    async balance(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'balance() not supported');
    }
    async balances() {
        throw new Unavailable(this.exchange + ' ' + 'balances() not supported');
    }
    async orderBook(symbol, limit = 50) {
        throw new Unavailable(this.exchange + ' ' + 'orderBook() not supported');
    }
    async orderBooks(symbols = null) {
        throw new Unavailable(this.exchange + ' ' + 'orderBooks() not supported');
    }
    async ticker(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'ticker() not supported');
    }
    async tickers(symbols = []) {
        throw new Unavailable(this.exchange + ' ' + 'tickers() not supported');
    }
    async price(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'price() not supported');
    }
    async prices(symbols = []) {
        throw new Unavailable(this.exchange + ' ' + 'prices() not supported');
    }
    async candles(symbol, timeframe, limit = 100, params = {}) {
        throw new Unavailable(this.exchange + ' ' + 'candles() not supported');
    }
    async tradeHistory(symbol, limit = null, params = {}) {
        throw new Unavailable(this.exchange + ' ' + 'tradeHistory() not supported');
    }
    async openOrders(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'openOrders() not supported');
    }
    async openOrdersHistory(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'openOrdersHistory() not supported');
    }
    async cancelOrder(symbol, orderId) {
        throw new Unavailable(this.exchange + ' ' + 'cancelOrder() not supported');
    }
    async cancelAllOrders(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'cancelAllOrders() not supported');
    }
    async fundingFee(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'fundingFee() not supported');
    }
    async futuresCommissionRate() {
        throw new Unavailable(this.exchange + ' ' + 'futuresCommissionRate() not supported');
    }
    async futuresRecentTrades(symbol, limit) {
        throw new Unavailable(this.exchange + ' ' + 'futuresRecentTrades() not supported');
    }
    async futuresBalance(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'futuresBalance() not supported');
    }
    async futuresBalances() {
        throw new Unavailable(this.exchange + ' ' + 'futuresBalances() not supported');
    }
    async futuresExposure(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'futuresExposure() not supported');
    }
    async futuresExposures() {
        throw new Unavailable(this.exchange + ' ' + 'futuresExposures() not supported');
    }
    async futuresOrderBook(symbol, limit = 50) {
        throw new Unavailable(this.exchange + ' ' + 'futuresOrderBook() not supported');
    }
    async futuresOrderBooks(symbols = null) {
        throw new Unavailable(this.exchange + ' ' + 'futuresOrderBooks() not supported');
    }
    async futuresTicker(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'futuresTicker() not supported');
    }
    async futuresTickers(symbols = []) {
        throw new Unavailable(this.exchange + ' ' + 'futuresTickers() not supported');
    }
    async futuresPrice(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'futuresPrice() not supported');
    }
    async futuresPrices(symbols = []) {
        throw new Unavailable(this.exchange + ' ' + 'futuresPrices() not supported');
    }
    async futuresCandles(symbol, timeframe, limit = 100, params = {}) {
        throw new Unavailable(this.exchange + ' ' + 'futuresCandles() not supported');
    }
    async futuresTradeHistory(symbol, limit = null, params = {}) {
        throw new Unavailable(this.exchange + ' ' + 'futuresTradeHistory() not supported');
    }
    async futuresOpenOrders(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'futuresOpenOrders() not supported');
    }
    async futuresOpenOrderHistory(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'futuresOpenOrderHistory() not supported');
    }
    async futuresCancelOrder(symbol, orderId) {
        throw new Unavailable(this.exchange + ' ' + 'futuresCancelOrder() not supported');
    }
    async futuresCancelAllOrders(symbol) {
        throw new Unavailable(this.exchange + ' ' + 'futuresCancelAllOrders() not supported');
    }
    async setLeverage(symbol, leverage) {
        throw new Unavailable(this.exchange + ' ' + 'setLeverage() not supported');
    }
    async setPositionMode() {
        throw new Unavailable(this.exchange + ' ' + 'setPositionMode() not supported');
    }
    async setMarginMode() {
        throw new Unavailable(this.exchange + ' ' + 'setMarginMode() not supported');
    }
    async order(symbol, side, qty, price, params = {}) {
        throw new Unavailable(this.exchange + ' ' + 'order() not supported');
    }
    async futuresOrder(symbol, side, qty, price, params = {}) {
        throw new Unavailable(this.exchange + ' ' + 'futuresOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the target price
     * @param {string} [params.tif] - time in force (GTC, IOC, FOK) - optional by default GTC
     */
    async limitBuy(symbol, qty, price, params = {}) {
        const tif = params.tif || 'GTC';
        if (this.has().features['limitOrder']) {
            return await this.order(symbol, 'BUY', qty, price, { type: 'LIMIT', tif: tif });
        }
        throw new Unavailable(this.exchange + ' ' + 'limitBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the target price
     * @param {string} [params.tif] - time in force (GTC, IOC, FOK) - optional by default GTC
     */
    async limitSell(symbol, qty, price, params = {}) {
        const tif = params.tif || 'GTC';
        if (this.has().features['limitOrder']) {
            return await this.order(symbol, 'SELL', qty, price, { type: 'LIMIT', tif: tif });
        }
        throw new Unavailable(this.exchange + ' ' + 'limitSell() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {string} side - BUY or SELL
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the target price
     * @param {string} [params.tif] - time in force (GTC, IOC, FOK) - optional by default GTC
     */
    async limitOrder(symbol, side, qty, price, params = {}) {
        const tif = params.tif || 'GTC';
        if (this.has().features['limitOrder']) {
            return await this.order(symbol, side, qty, price, { type: 'LIMIT', tif: tif });
        }
        throw new Unavailable(this.exchange + ' ' + 'limitOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     */
    async marketBuy(symbol, qty) {
        if (this.has().features['marketOrder']) {
            return await this.order(symbol, 'BUY', qty, null, { type: 'MARKET' });
        }
        throw new Unavailable(this.exchange + ' ' + 'marketBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     */
    async marketSell(symbol, qty) {
        if (this.has().features['marketOrder']) {
            return await this.order(symbol, 'SELL', qty, null, { type: 'MARKET' });
        }
        throw new Unavailable(this.exchange + ' ' + 'marketSell() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {string} side - BUY or SELL
     * @param {number} qty - how much you want to trade in units of the base currency
     */
    async marketOrder(symbol, side, qty) {
        if (this.has().features['marketOrder']) {
            return await this.order(symbol, side, qty, null, { type: 'MARKET' });
        }
        throw new Unavailable(this.exchange + ' ' + 'marketOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the stop order limit price
     * @param {string} [params.tif] - time in force (GTC, IOC, FOK) - optional by default GTC
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerPrice] - the trigger price
     */
    async stopLimitBuy(symbol, qty, price, params = {}) {
        const parameters = {
            type: params.type,
            tif: params.tif,
            triggerPrice: params.triggerPrice,
        };
        if (this.has().features['stopLimitOrder']) {
            return await this.stopLimitOrder(symbol, 'BUY', qty, price, (params = parameters));
        }
        throw new Unavailable(this.exchange + ' ' + 'stopLimitBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the stop order limit price
     * @param {string} [params.tif] - time in force (GTC, IOC, FOK) - optional by default GTC
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerPrice] - the trigger price
     */
    async stopLimitSell(symbol, qty, price, params = {}) {
        const parameters = {
            type: params.type,
            tif: params.tif,
            triggerPrice: params.triggerPrice,
        };
        if (this.has().features['stopLimitOrder']) {
            return await this.stopLimitOrder(symbol, 'SELL', qty, price, (params = parameters));
        }
        throw new Unavailable(this.exchange + ' ' + 'stopLimitSell() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} side - BUY or SELL
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the stop order limit price
     * @param {string} [params.tif] - time in force (GTC, IOC, FOK) - optional by default GTC
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerPrice] - the trigger price
     */
    async stopLimitOrder(symbol, side, qty, price, params = {}) {
        const parameters = {
            isStopOrder: true,
            type: params.type,
            tif: params.tif,
            triggerPrice: params.triggerPrice,
        };
        if (typeof parameters.triggerPrice == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'stopLimitOrder() triggerPrice must be specified');
        }
        if (typeof side == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'stopLimitOrder() side must be specified BUY or SELL');
        }
        if (typeof qty == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'stopLimitOrder() qty must be specified');
        }
        if (typeof price == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'stopLimitOrder() price must be specified');
        }
        if (this.has().features['stopLimitOrder']) {
            return await this.order(symbol, side, qty, price, (params = parameters));
        }
        throw new Unavailable(this.exchange + ' ' + 'stopLimitOrder()  not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the stop order limit price
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerPrice] - the trigger price
     */
    async stopMarketBuy(symbol, qty, params = {}) {
        const parameters = {
            isStopOrder: true,
            type: params.type,
            triggerPrice: params.triggerPrice,
        };
        if (this.has().features['stopMarketOrder']) {
            return await this.stopMarketOrder(symbol, 'BUY', qty, null, (params = parameters));
        }
        throw new Unavailable(this.exchange + ' ' + 'stopMarketBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the stop order limit price
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerPrice] - the trigger price
     */
    async stopMarketSell(symbol, qty, params = {}) {
        const parameters = {
            isStopOrder: true,
            type: params.type,
            triggerPrice: params.triggerPrice,
        };
        if (this.has().features['stopMarketOrder']) {
            return await this.stopMarketOrder(symbol, 'SELL', qty, null, (params = parameters));
        }
        throw new Unavailable(this.exchange + ' ' + 'stopMarketSell() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} side - BUY or SELL
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerPrice] - the trigger price
     */
    async stopMarketOrder(symbol, side, qty, params = {}) {
        const parameters = {
            isStopOrder: true,
            type: params.type,
            triggerPrice: params.triggerPrice,
        };
        if (typeof parameters.triggerPrice == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'stopMarketOrder() triggerPrice must be specified');
        }
        if (typeof side == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'stopMarketOrder() side must be specified BUY or SELL');
        }
        if (typeof qty == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'stopMarketOrder() qty must be specified');
        }
        if (this.has().features['stopMarketOrder']) {
            return await this.order(symbol, side, amount, null, (params = parameters));
        }
        throw new Unavailable(this.exchange + ' ' + 'stopMarketOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the trailing limit price
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerPrice] - the trailing activation price - optional
     */
    async trailingLimitSell(symbol, amount, price, params = {}) {
        const parameters = {
            type: params.type,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            triggerPrice: params.triggerPrice,
        };
        if (this.has().features['trailingLimitOrder']) {
            return await this.trailingLimitOrder(symbol, 'SELL', amount, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'trailingLimitSell() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the trailing limit price
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerPrice] - the trailing activation price - optional
     */
    async trailingLimitBuy(symbol, amount, price, params = {}) {
        const parameters = {
            type: params.type,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            triggerPrice: params.triggerPrice,
        };
        if (this.has().features['trailingLimitOrder']) {
            return await this.trailingLimitOrder(symbol, 'BUY', amount, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'trailingLimitBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} side - BUY or SELL
     * @param {number} amount - how much you want to trade in units of the base currency
     * @param {number} price - the trailing limit price
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerPrice] - the trailing activation price - optional
     */
    async trailingLimitOrder(symbol, side, amount, price, params = {}) {
        const parameters = {
            isTrailingOrder: true,
            type: params.type,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            triggerPrice: params.triggerPrice,
        };
        if (typeof parameters.deltaPercent == 'undefined' && typeof parameters.deltaAmount == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'trailingLimitPercentOrder() deltaPercent or deltaAmount must be specified');
        }
        if (typeof parameters.deltaPercent !== 'undefined' && typeof parameters.deltaAmount !== 'undefined') {
            throw new InvalidOrder(
                this.exchange + ' ' + 'trailingLimitPercentOrder() deltaPercent and deltaAmount cannot be specified at the same time',
            );
        }
        if (typeof amount == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'trailingLimitPercentOrder() amount must be specified');
        }
        if (typeof price === 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'trailingLimitPercentOrder() price must be specified');
        }
        if (this.has().features['trailingLimitOrder']) {
            return await this.order(symbol, side, amount, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'trailingLimitOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} amount - how much you want to trade in units of the base currency
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerPrice] - the trailing activation price - optional
     */
    async trailingMarketBuy(symbol, amount, params = {}) {
        const parameters = {
            type: params.type,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            triggerPrice: params.triggerPrice,
        };
        if (this.has().features['trailingMarketOrder']) {
            return await this.trailingMarketOrder(symbol, 'BUY', amount, null, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'trailingMarketBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} amount - how much you want to trade in units of the base currency
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerPrice] - the trailing activation price - optional
     */
    async trailingMarketSell(symbol, amount, params = {}) {
        const parameters = {
            type: params.type,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            triggerPrice: params.triggerPrice,
        };
        if (this.has().features['trailingMarketOrder']) {
            return await this.trailingMarketOrder(symbol, 'BUY', amount, null, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'trailingMarketBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} side - BUY or SELL
     * @param {number} amount - how much you want to trade in units of the base currency
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerPrice] - the trailing activation price - optional
     */
    async trailingMarketOrder(symbol, side, amount, params = {}) {
        const parameters = {
            isTrailingOrder: true,
            type: params.type,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            triggerPrice: params.triggerPrice,
        };
        if (typeof parameters.deltaPercent == 'undefined' && typeof parameters.deltaAmount == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'trailingLimitPercentOrder() deltaPercent or deltaAmount must be specified');
        }
        if (typeof parameters.deltaPercent !== 'undefined' && typeof parameters.deltaAmount !== 'undefined') {
            throw new InvalidOrder(
                this.exchange + ' ' + 'trailingLimitPercentOrder() deltaPercent and deltaAmount cannot be specified at the same time',
            );
        }
        if (typeof amount == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'trailingLimitPercentOrder() amount must be specified');
        }
        if (this.has().features['trailingMarketOrder']) {
            return await this.order(symbol, side, amount, null, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'trailingMarketOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the target price
     * @param {object} [params] - other parameters
     * @param {string} [params.tif] - GTC, IOC, FOK, GTX, GTD - optional by default GTC
     * @param {number} [params.goodTillDate] - good till date - mandatory if tif is GTD
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresLimitBuy(symbol, qty, price, params = {}) {
        const parameters = {
            type: 'LIMIT',
            tif: params.tif,
            goodTillDate: params.goodTillDate,
            reduceOnly: params.reduceOnly,
        };
        if (this.upperCase(parameters.tif) === 'GTD' && typeof params.goodTillDate === 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresLimitBuy() goodTillDate must be specified if tif is GTD');
        }
        if (this.has().features['futuresLimitOrder']) {
            return await this.futuresOrder(symbol, 'BUY', qty, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresLimitBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {side} side - BUY or SELL
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the target price
     * @param {object} [params] - other parameters
     * @param {string} [params.tif] - GTC, IOC, FOK, GTX, GTD - optional by default GTC
     * @param {number} [params.goodTillDate] - good till date - mandatory if tif is GTD
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresLimitOrder(symbol, side, qty, price, params = {}) {
        const parameters = {
            type: 'LIMIT',
            tif: params.tif,
            goodTillDate: params.goodTillDate,
            reduceOnly: params.reduceOnly,
        };
        if (this.upperCase(parameters.tif) === 'GTD' && typeof params.goodTillDate === 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresLimitBuy() goodTillDate must be specified if tif is GTD');
        }
        if (this.has().features['futuresLimitOrder']) {
            return await this.futuresOrder(symbol, side, qty, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresLimitBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the target price
     * @param {object} [params] - other parameters
     * @param {string} [params.tif] - GTC, IOC, FOK, GTX, GTD - optional
     * @param {number} [params.goodTillDate] - good till date - mandatory if tif is GTD
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresLimitSell(symbol, qty, price, params = {}) {
        const parameters = {
            type: 'LIMIT',
            tif: params.tif,
            goodTillDate: params.goodTillDate,
            reduceOnly: params.reduceOnly,
        };
        if (this.upperCase(params.tif) === 'GTD' && typeof params.goodTillDate === 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresLimitBuy() goodTillDate must be specified if tif is GTD');
        }
        if (this.has().features['futuresLimitOrder']) {
            return await this.futuresOrder(symbol, 'BUY', qty, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresLimitSell() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {object} [params] - other parameters
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresMarketBuy(symbol, qty, params = {}) {
        const parameters = {
            type: 'MARKET',
            reduceOnly: params.reduceOnly,
        };
        if (this.has().features['futuresMarketOrder']) {
            return await this.futuresOrder(symbol, 'BUY', qty, null, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresMarketOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {object} [params] - other parameters
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresMarketSell(symbol, qty, params = {}) {
        const parameters = {
            type: 'MARKET',
            reduceOnly: params.reduceOnly,
        };
        if (this.has().features['futuresMarketOrder']) {
            return await this.futuresOrder(symbol, 'SELL', qty, null, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresMarketOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {string} side - BUY or SELL
     * @param {object} [params] - other parameters
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresMarketOrder(symbol, side, qty, params = {}) {
        const parameters = {
            type: 'MARKET',
            reduceOnly: params.reduceOnly,
        };
        if (this.has().features['futuresMarketOrder']) {
            return await this.futuresOrder(symbol, side, qty, null, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresMarketOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the target price
     * @param {object} [params] - other parameters
     * @param {string} [params.tif] - GTC, IOC, FOK, GTX, GTD - optional by defulat GTC
     * @param {number} [params.goodTillDate] - good till date - mandatory if tif is GTD
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerType] - MARK or LAST by default LAST
     * @param {number} [params.triggerPrice] - the trigger price
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresStopLimitBuy(symbol, qty, price, params = {}) {
        const parameters = {
            isStopOrder: true,
            tif: params.tif,
            goodTillDate: params.goodTillDate,
            type: params.type,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
        };
        if (this.has().features['futuresStopLimitOrder']) {
            return await this.futuresStopLimitOrder(symbol, 'BUY', qty, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresLimitBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the target price
     * @param {object} [params] - other parameters
     * @param {string} [params.tif] - GTC, IOC, FOK, GTX, GTD - optional by defulat GTC
     * @param {number} [params.goodTillDate] - good till date - mandatory if tif is GTD
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerType] - MARK or LAST by default LAST
     * @param {number} [params.triggerPrice] - the trigger price
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresStopLimitSell(symbol, qty, price, params = {}) {
        const parameters = {
            isStopOrder: true,
            tif: params.tif,
            goodTillDate: params.goodTillDate,
            type: params.type,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
        };
        if (this.has().features['futuresStopLimitOrder']) {
            return await this.futuresStopLimitOrder(symbol, 'SELL', qty, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresLimitSell() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {string} side - BUY or SELL
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the target price
     * @param {object} [params] - other parameters
     * @param {string} [params.tif] - GTC, IOC, FOK, GTX, GTD - optional by defulat GTC
     * @param {number} [params.goodTillDate] - good till date - mandatory if tif is GTD
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerType] - MARK or LAST by default LAST
     * @param {number} [params.triggerPrice] - the trigger price
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresStopLimitOrder(symbol, side, qty, price, params = {}) {
        const parameters = {
            isStopOrder: true,
            tif: params.tif,
            goodTillDate: params.goodTillDate,
            type: params.type,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
        };
        if (this.upperCase(params.tif) === 'GTD' && typeof params.goodTillDate === 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresLimitBuy() goodTillDate must be specified if tif is GTD');
        }
        if (typeof parameters.type === 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresStopLimitOrder() type must be specified');
        }
        if (typeof parameters.triggerPrice === 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresStopLimitOrder() triggerPrice must be specified');
        }
        if (this.has().features['futuresStopLimitOrder']) {
            return await this.futuresOrder(symbol, side, qty, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresStopLimit() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {object} [params] - other parameters
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerType] - MARK or LAST by default LAST
     * @param {number} [params.triggerPrice] - the trigger price
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     * @param {boolean} [params.closePosition] - close position - optional
     */
    async futuresStopMarketBuy(symbol, qty, params = {}) {
        const parameters = {
            isStopOrder: true,
            type: params.type,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
            closePosition: params.closePosition,
        };
        if (this.has().features['futuresStopMarketOrder']) {
            return await this.futuresStopMarketOrder(symbol, 'BUY', qty, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresStopMarketBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {object} [params] - other parameters
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerType] - MARK or LAST by default LAST
     * @param {number} [params.triggerPrice] - the trigger price
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     * @param {boolean} [params.closePosition] - close position - optional
     */
    async futuresStopMarketSell(symbol, qty, params = {}) {
        const parameters = {
            isStopOrder: true,
            type: params.type,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
            closePosition: params.closePosition,
        };
        if (this.has().features['futuresStopMarketOrder']) {
            return await this.futuresStopMarketOrder(symbol, 'SELL', qty, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresStopMarketSell() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {string} side - BUY or SELL
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {object} [params] - other parameters
     * @param {string} [params.type] - TP or SL
     * @param {string} [params.triggerType] - MARK or LAST by default LAST
     * @param {number} [params.triggerPrice] - the trigger price
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     * @param {boolean} [params.closePosition] - close position - optional
     */
    async futuresStopMarketOrder(symbol, side, qty, params = {}) {
        const parameters = {
            isStopOrder: true,
            type: params.type,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
            closePosition: params.closePosition,
        };
        if (params.closePosition) qty = null;
        if (params.closePosition && params.reduceOnly) {
            throw new InvalidOrder(
                this.exchange + ' ' + 'futuresStopMarketOrder() closePosition and reduceOnly cannot be specified at the same time',
            );
        }
        if (typeof parameters.type === 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresStopMarketOrder() type must be specified');
        }
        if (typeof parameters.triggerPrice === 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'futuresStopMarketOrder() triggerPrice must be specified');
        }
        if (this.has().features['futuresStopMarketOrder']) {
            return await this.futuresOrder(symbol, side, qty, null, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresStopMarket() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the trailing limit price
     * @param {object} [params] - other parameters
     * @param {string} [params.tif] - GTC, IOC, FOK, GTX, GTD - optional
     * @param {number} [params.goodTillDate] - good till date - mandatory if tif is GTD
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerType] - MARK or LAST by default LAST - the activation price type - optional
     * @param {number} [params.triggerPrice] - the trigger price - the activation price - optional
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresTrailingLimitBuy(symbol, qty, price, params = {}) {
        const parameters = {
            isTrailingOrder: true,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            tif: params.tif,
            goodTillDate: params.goodTillDate,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
        };
        if (this.has().features['futuresTrailingLimitOrder']) {
            return await this.futuresTrailingLimitOrder(symbol, 'BUY', qty, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresTrailingLimitOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the trailing limit price
     * @param {object} [params] - other parameters
     * @param {string} [params.tif] - GTC, IOC, FOK, GTX, GTD - optional
     * @param {number} [params.goodTillDate] - good till date - mandatory if tif is GTD
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerType] - MARK or LAST by default LAST - the activation price type - optional
     * @param {number} [params.triggerPrice] - the trigger price - the activation price - optional
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresTrailingLimitSell(symbol, qty, price, params = {}) {
        const parameters = {
            isTrailingOrder: true,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            tif: params.tif,
            goodTillDate: params.goodTillDate,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
            postOnly: params.postOnly,
        };
        if (this.has().features['futuresTrailingLimitOrder']) {
            return await this.futuresTrailingLimitOrder(symbol, 'SELL', qty, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresTrailingLimitOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {string} side - BUY or SELL
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {number} price - the trailing limit price
     * @param {object} [params] - other parameters
     * @param {string} [params.tif] - GTC, IOC, FOK, GTX, GTD - optional
     * @param {number} [params.goodTillDate] - good till date - mandatory if tif is GTD
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerType] - MARK or LAST by default LAST - the activation price type - optional
     * @param {number} [params.triggerPrice] - the trigger price - the activation price - optional
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     */
    async futuresTrailingLimitOrder(symbol, side, qty, price, params = {}) {
        const parameters = {
            isTrailingOrder: true,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            tif: params.tif,
            goodTillDate: params.goodTillDate,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
        };
        if (params.closePosition) qty = null;
        if (typeof parameters.deltaPercent == 'undefined' && typeof parameters.deltaAmount == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'trailingLimitPercentOrder() deltaPercent or deltaAmount must be specified');
        }
        if (typeof parameters.deltaPercent !== 'undefined' && typeof parameters.deltaAmount !== 'undefined') {
            throw new InvalidOrder(
                this.exchange + ' ' + 'trailingLimitPercentOrder() deltaPercent and deltaAmount cannot be specified at the same time',
            );
        }
        if (this.has().features['futuresTrailingLimitOrder']) {
            return await this.futuresOrder(symbol, side, qty, price, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresTrailingLimitOrder() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {object} [params] - other parameters
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerType] - MARK or LAST by default LAST - the activation price type - optional
     * @param {number} [params.triggerPrice] - the trigger price - the activation price - optional
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     * @param {boolean} [params.closePosition] - close position - optional
     */
    async futuresTrailingMarketSell(symbol, qty, params = {}) {
        const parameters = {
            isTrailingOrder: true,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
            closePosition: params.closePosition,
        };
        if (this.has().features['futuresTrailingMarketOrder']) {
            return await this.futuresTrailingMarketOrder(symbol, 'SELL', qty, null, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresTrailingMarketSell() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {object} [params] - other parameters
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerType] - MARK or LAST by default LAST - the activation price type - optional
     * @param {number} [params.triggerPrice] - the trigger price - the activation price - optional
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     * @param {boolean} [params.closePosition] - close position - optional
     */
    async futuresTrailingMarketBuy(symbol, qty, params = {}) {
        const parameters = {
            isTrailingOrder: true,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
            closePosition: params.closePosition,
        };
        if (this.has().features['futuresTrailingMarketOrder']) {
            return await this.futuresTrailingMarketOrder(symbol, 'BUY', qty, null, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresTrailingMarketBuy() not supported');
    }
    /**
     * @param {string} symbol - the target symbol
     * @param {string} side - BUY or SELL
     * @param {number} qty - how much you want to trade in units of the base currency
     * @param {object} [params] - other parameters
     * @param {string} [params.deltaPercent] - trailing delta in percentage ex) 0.1 = 10%
     * @param {string} [params.deltaAmount] - trailing delta in amount either deltaPercent or deltaAmount must be specified
     * @param {string} [params.triggerType] - MARK or LAST by default LAST - the activation price type - optional
     * @param {number} [params.triggerPrice] - the trigger price - the activation price - optional
     * @param {boolean} [params.reduceOnly] - reduce only - optional
     * @param {boolean} [params.closePosition] - close position - optional
     */
    async futuresTrailingMarketOrder(symbol, side, qty, params = {}) {
        const parameters = {
            isTrailingOrder: true,
            deltaPercent: params.deltaPercent,
            deltaAmount: params.deltaAmount,
            triggerType: params.triggerType,
            triggerPrice: params.triggerPrice,
            reduceOnly: params.reduceOnly,
            closePosition: params.closePosition,
        };
        if (params.closePosition) qty = null;
        if (params.closePosition && params.reduceOnly) {
            throw new InvalidOrder(
                this.exchange + ' ' + 'futuresTrailingMarketOrder() closePosition and reduceOnly cannot be specified at the same time',
            );
        }
        if (typeof parameters.deltaPercent == 'undefined' && typeof parameters.deltaAmount == 'undefined') {
            throw new EmptyParameters(this.exchange + ' ' + 'trailingLimitPercentOrder() deltaPercent or deltaAmount must be specified');
        }
        if (typeof parameters.deltaPercent !== 'undefined' && typeof parameters.deltaAmount !== 'undefined') {
            throw new InvalidOrder(
                this.exchange + ' ' + 'trailingLimitPercentOrder() deltaPercent and deltaAmount cannot be specified at the same time',
            );
        }
        if (this.has().features['futuresTrailingMarketOrder']) {
            return await this.futuresOrder(symbol, side, qty, null, parameters);
        }
        throw new Unavailable(this.exchange + ' ' + 'futuresTrailingMarketOrder() not supported');
    }

    // --- websocket spot --- //
    async tradeStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'tradeStream() not supported');
    }
    async candleStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'candleStream() not supported');
    }
    async orderBookStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'orderBookStream() not supported');
    }
    async balanceStream(callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'balanceStream() not supported');
    }
    async orderStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'orderStream() not supported');
    }
    async orderUpdateStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'orderUpdateStream() not supported');
    }
    async executionStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'executionStream() not supported');
    }

    // --- websocket futures --- //
    async futuresTradeStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'futuresTradeStream() not supported');
    }
    async futuresCandleStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'futuresCandleStream() not supported');
    }
    async futuresOrderBookStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'futuresOrderBookStream() not supported');
    }
    async futuresBalanceStream(callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'futuresBalanceStream() not supported');
    }
    async futuresPositionStream(callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'futuresPositionStream() not supported');
    }
    async futuresOrderStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'futuresOrderStream() not supported');
    }
    async futuresOrderUpdateStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'futuresOrderUpdateStream() not supported');
    }
    async futuresExecutionStream(symbol, callback = console.log()) {
        throw new Unavailable(this.exchange + ' ' + 'futuresExecutionStream() not supported');
    }
}
