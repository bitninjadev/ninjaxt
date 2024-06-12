class OrderBook {
    constructor(symbol) {
        this.symbol = symbol;
        this.buffer = [];
        this.firstCall = true;
        this.isFindFirstEvent = false
        this.isProcessed = false;
        this.lastUpdateId = null;

        this._data = {
            asks: [],
            bids: [],
            timestamp: null,
        };
    }

    getOrderBook() {
        return {
            symbol: this.symbol,
            asks: this._data.asks,
            bids: this._data.bids,
            timestamp: this._data.timestamp,
        }
    }

    getSymbol() {
        return this.symbol;
    }

    getBestBids(depth = 0) {
        return this._data.bids.slice(0, depth + 1);
    }

    getBestAsks(depth = 0) {
        return this._data.asks.slice(0, depth + 1);
    }

    getBestPrice() {
        return {
            symbol: this.symbol,
            asks: this._data.asks[0],
            bids: this._data.bids[0],
            timestamp: this._data.timestamp,
        };
    }

    getBestPrices(depth = 0) {
        return {
            symbol: this.symbol,
            asks: this.getBestAsks(depth),
            bids: this.getBestBids(depth),
            timestamp: this._data.timestamp,
        };
    }
}

module.exports = OrderBook;