export interface Trade {
    price: string | null;
    qty: string | null;
    quoteQty: string | null;
    timestamp: number | null;
}

export interface TradeHistory {
    orderId: string | null;
    symbol: string | null;
    side: string | null;
    price: string | null;
    qty: string | null;
    isMaker: string | null;
}

export interface OrderBookEntry {
    price: string;
    amount: string;
}

export interface OrderBook {
    symbol: string;
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
    timestamp?: number;
}

export interface Ticker {
    symbol: string | null;
    open: string | null;
    high: string | null;
    low: string | null;
    close: string | null;
    volume: string | null;
}

export interface Balance {
    symbol: string | null;
    wallet: string | null;
    available: string | null;
    frozen: string | null;
}

export interface Candle {
    openTime: number;
    closeTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}

export interface Order {
    id: string | null;
    symbol: string | null;
    price: string | null;
    qty: string | null;
    executedQty: string | null;
    type: string | null;
    tif: string | null;
    side: string | null;
    status: string | null;
    reduceOnly?: boolean;
    closePosition?: boolean;
    timestamp?: number;
}

export interface Exposure {
    symbol: string | null;
    qty: string | null;
    entryPrice: string | null;
    positionSide: string | null;
    leverage: string | null;
    notional: string | null;
    liquidPrice: string | null;
    marginType: string | null;
    unRealizedPnL: string | null;
}

export interface SystemStatus {
    status: string;
    msg: string;
}
