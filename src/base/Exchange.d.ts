import { Unavailable, EmptyParameters, AuthenticationError, InvalidOrder, InvalidParameters } from './errors';
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
} from './functions/utils';
import { BaseClient } from './ws/baseClient';
import { Precise } from './functions/Precise';
import { timeframeConvert } from './functions/constants';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

import { Trade, TradeHistory, OrderBook, OrderBookEntry, Ticker, Balance, Candle, Order, Exposure, SystemStatus } from './types';

export class BaseExchange {
    exchange: string;
    apiKey?: string;
    apiSecret?: string;
    verbose?: boolean;
    hasProp: typeof hasProp;
    define: typeof define;
    extend: typeof extend;
    deepExtend: typeof deepExtend;
    extendWithKey: typeof extendWithKey;
    extendWithObj: typeof extendWithObj;
    numberToString: typeof numberToString;
    upperCase: typeof upperCase;
    lowerCase: typeof lowerCase;
    sortBy: typeof sortBy;
    isEmpty: typeof isEmpty;
    isValid: typeof isValid;
    isArray: typeof isArray;
    isObject: typeof isObject;
    safeFloat: typeof safeFloat;
    safeInteger: typeof safeInteger;
    safeString: typeof safeString;
    safeValue: typeof safeValue;
    safeTimestamp: typeof safeTimestamp;
    safeStringLower: typeof safeStringLower;
    safeStringUpper: typeof safeStringUpper;
    schedule: typeof schedule;
    toMilliseconds: typeof toMilliseconds;
    timeframeConvert: typeof timeframeConvert;
    proxyUrl?: string;
    proxyProtocol?: string;
    proxyHostname?: string;
    proxyPort?: string;
    proxyAgent?: HttpProxyAgent | HttpsProxyAgent;
    // instruments: Record<string, any>; // TODO: Add instruments type

    constructor(userConfig?: object);
    has(): {
        features: {
            ws: boolean;
            publicAPI: boolean;
            privateAPI: boolean;
            spot?: boolean;
            futures?: boolean;
            delievery?: boolean;
            options?: boolean;
            limitOrder: any;
            marketOrder: any;
            stopLimitOrder: any;
            stopMarketOrder: any;
            trailingLimitOrder: any;
            trailingMarketOrder: any;
            cancelOrder: any;
            cancelAllOrders: any;
            recentTrades: any;
            balance: any;
            balances: any;
            orderBook: any;
            orderBooks: any;
            ticker: any;
            tickers: any;
            price: any;
            prices: any;
            candles: any;
            openOrders: any;
            tradeHistory: any;
            openOrderHistory: any;
            futuresLimitOrder: any;
            futuresMarketOrder: any;
            futuresStopLimitOrder: any;
            futuresStopMarketOrder: any;
            futuresTrailingLimitOrder: any;
            futuresTrailingMarketOrder: any;
            futuresCancelOrder: any;
            futuresCancelAllOrders: any;
            futuresCloseAll: any;
            fundingFee: any;
            fundingFees: any;
            futuresRecentTrades: any;
            futuresBalance: any;
            futuresBalances: any;
            futuresExposure: any;
            futuresExposures: any;
            futuresOrderBook: any;
            futuresOrderBooks: any;
            futuresTicker: any;
            futuresTickers: any;
            futuresPrice: any;
            futuresPrices: any;
            futuresCandles: any;
            futuresTradeHistory: any;
            futuresOpenOrders: any;
            futuresOpenOrdersHistory: any;
            setLeverage: any;
            setPositionMode: any;
            setMarginMode: any;
            tradeStream: any;
            candleStream: any;
            orderBookStream: any;
            balanceStream: any;
            orderStream: any;
            orderUpdateStream: any;
            executionStream: any;
            futuresTradeStream: any;
            futuresCandleStream: any;
            futuresOrderBookStream: any;
            futuresBalanceStream: any;
            futuresPositionStream: any;
            futuresOrderStream: any;
            futuresOrderUpdateStream: any;
            futuresExecutionStream: any;
        };
        urls: {
            base: any;
            sandbox: any;
        };
        endpoints: {
            public: {
                get: any;
                post: any;
                put: any;
                delete: any;
            };
            private: {
                get: any;
                post: any;
                put: any;
                delete: any;
            };
        };
        ws: {
            public: any;
            private: any;
        };
    };

    getDefaultOptions(): object;
    checkCredentials(): void;
    initializeEntry(userConfig?: object): void;
    handleResponse(response: any, callback?: () => void): Promise<any>;
    capitalize(str: string): string;
    defineRestApi(api: any, paths?: string[]): void;
    defineRestApiEndpoint(method: string, endpoint: string, config: any, paths?: string[]): void;
    generateFunctionName(method: string, path: string): string;
    async checkProxySettings(): Promise<void>;
    async request(url: string, method?: string, body?: any, config?: any, isPrivate?: boolean): Promise<any>;
    sign(url: string, method?: string, body?: any, isPrivate?: boolean): any;
    async requestAPI(requestOptions: { url: string; method: string; headers?: any; body?: any }): Promise<any>;
    safeSymbols(symbols?: string | string[], assetType?: string, allowEmpty?: boolean, isParsing?: boolean): any;
    safeTimeframe(timeframe: string, assetType?: string, params?: any): any;
    parseInstruments(): void;
    async loadInstruments(): Promise<void>;
    async getInstruments(assetType?: string): Promise<string[]>;
    client(
        channel: string,
        handleSocketOpen: Function,
        handleSocketClose: Function,
        handleSocketMessage: Function,
        handleSocketError: Function,
        payload?: any,
    ): BaseClient;
    safeTrade(trade: any): Trade;
    safeTradeHistory(trade: any): TradeHistory;
    safeOrderBook(orderbook: any, symbol: string, timestamp?: number, limit?: number): OrderBook;
    safeOrderBooks(orderbooks: any): {
        symbol: string | null;
        bestBidPrice: string | null;
        bestBidQty: string | null;
        bestAskPrice: string | null;
        bestAskQty: string | null;
        timestamp: number | null;
    };
    safePrice(price: any): { [key: string]: string | undefined };
    safeTicker(ticker: any): Ticker;
    safeBalance(balance: any): Balance;
    safeCandle(candle: any): Candle;
    safeOrder(order: any): Order;
    safeExposure(exposure: any): Exposure;
    checkSystemStatus(): Promise<SystemStatus>;
    commissionRate(): Promise<never>;
    recentTrades(symbol: string, limit?: number): Promise<Trade[]>;
    balance(symbol: string): Promise<Balance>;
    balances(): Promise<Balance[]>;
    orderBook(symbol: string, limit?: number): Promise<never>;
    orderBooks(symbols?: string[] | null): Promise<never>;
    ticker(symbol: string): Promise<never>;
    tickers(symbols?: string[]): Promise<never>;
    price(symbol: string): Promise<never>;
    prices(symbols?: string[]): Promise<never>;
    candles(symbol: string, timeframe: string, limit?: number, params?: any): Promise<never>;
    tradeHistory(symbol: string, limit?: number | null, params?: any): Promise<never>;
    openOrders(symbol: string): Promise<never>;
    openOrdersHistory(symbol: string): Promise<never>;
    cancelOrder(symbol: string, orderId: string): Promise<never>;
    cancelAllOrders(symbol: string): Promise<never>;
    fundingFee(symbol: string): Promise<never>;
    futuresCommissionRate(): Promise<never>;
    futuresRecentTrades(symbol: string, limit?: number): Promise<never>;
    futuresBalance(symbol: string): Promise<never>;
    futuresBalances(): Promise<never>;
    futuresExposure(symbol: string): Promise<never>;
    futuresExposures(): Promise<never>;
    futuresOrderBook(symbol: string, limit?: number): Promise<never>;
    futuresOrderBooks(symbols?: string[] | null): Promise<never>;
    futuresTicker(symbol: string): Promise<never>;
    futuresTickers(symbols?: string[]): Promise<never>;
    futuresPrice(symbol: string): Promise<never>;
    futuresPrices(symbols?: string[]): Promise<never>;
    futuresCandles(symbol: string, timeframe: string, limit?: number, params?: any): Promise<never>;
    futuresTradeHistory(symbol: string, limit?: number | null, params?: any): Promise<never>;
    futuresOpenOrders(symbol: string): Promise<never>;
    futuresOpenOrderHistory(symbol: string): Promise<never>;
    futuresCancelOrder(symbol: string, orderId: string): Promise<never>;
    futuresCancelAllOrders(symbol: string): Promise<never>;
    setLeverage(symbol: string, leverage: number): Promise<never>;
    setPositionMode(): Promise<never>;
    setMarginMode(): Promise<never>;
}
