export default class OrderBook {
    symbol: string;
    private buffer: any[];
    private firstCall: boolean;
    private isFindFirstEvent: boolean;
    private isProcessed: boolean;
    private lastUpdateId: number | null;

    private _data: {
        asks: any[];
        bids: any[];
        timestamp: number | null;
    };

    constructor(symbol: string);

    getOrderBook(): {
        symbol: string;
        asks: any[];
        bids: any[];
        timestamp: number | null;
    };

    getSymbol(): string;

    getBestBids(depth?: number): any[];

    getBestAsks(depth?: number): any[];

    getBestPrice(): {
        symbol: string;
        asks: any;
        bids: any;
        timestamp: number | null;
    };

    getBestPrices(depth?: number): {
        symbol: string;
        asks: any[];
        bids: any[];
        timestamp: number | null;
    };
}
