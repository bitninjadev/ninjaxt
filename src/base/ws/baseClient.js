const WebSocket = require('ws');
const { deepExtend, isEmpty } = require('../functions/utils.js');
const { isNode } = require('../functions/platform.js');
const { EventEmitter } = require('events');

const WebSocketPlatform = isNode ? WebSocket : self.WebSocket;

class BaseClient extends EventEmitter {
    constructor(options = {}, handleSocketOpen, handleSocketClose, handleSocketMessage, handleSocketError, method) {
        super();
        const defaults = {
            handleSocketOpen,
            handleSocketClose,
            handleSocketMessage,
            handleSocketError,
            subscriptions: {},
            reconnect: true,
            maxRetries: 5,
            retryCount: 0,
            verbose: false,
            pingInterval: undefined,
            lastPingTime: undefined,
            agent: undefined,
            method,
        };
        Object.assign(this, deepExtend(defaults, options));
    }
    isOpen() {
        const ws = this.subscriptions[this.channel];
        return ws && ws.readyState === WebSocketPlatform.OPEN;
    }
    subscribe(channel, payload) {
        if (channel) {
            this.channel = channel;
        }
        if (this.subscriptions[this.channel] && this.isOpen(this.channel)) {
            if (this.verbose) {
                console.log(`Already subscribed to ${channel}`);
            }
            return;
        }
        this.subscriptions[this.channel] = this.openSocket(payload);

        return this.subscriptions[this.channel];
    }
    unsubscribe() {
        // This function is for testing purposes only
        const ws = this.subscriptions[this.channel];
        if (ws) {
            ws.terminate();
            delete this.subscriptions[this.channel];
        }
    }
    openSocket(payload) {
        this.retryCount = 0;
        if (this.verbose) {
            console.log('Websocket open: ', this.channel)
        }
        const ws = new WebSocketPlatform(this.channel, { agent: this.agent });
        ws.onopen = async () => {
            this.emit('open', await this.handleSocketOpen(this.channel, this.method));
            if (payload && !isEmpty(payload)) {
                console.log('Sending payload :', payload);
                ws.send(JSON.stringify(payload));
            }
        };
        ws.onclose = async (event) => {
            if (this.verbose) {
                console.log(`WebSocket closed: ${event.code} ${event.reason}`);
            }
            this.emit('close', await this.handleSocketClose(event));
            if (this.reconnect) {
                this._reconnect(payload);
            }
        };
        ws.onmessage = async (event) => {
            const result = await this.handleSocketMessage(event); // This can either be an iterator or a single message
            // Check if result is iterable
            if (result && result[Symbol.iterator]) {
                for (const message of result) {
                    if (message) {
                        this.emit('message', message);
                    }
                }
            } else if (result) {
                //console.log('result :', result)
                // If it's a single message
                this.emit('message', result);
            }
        };
        ws.onerror = event => {
            if (this.verbose) {
                console.log(`WebSocket error: ${event.message}`);
            }
            this.emit('error', this.handleSocketError(this.channel, this.method, event.message));
            if (this.reconnect) {
                this._reconnect(payload);
            }
        };

        return ws;
    }
    _reconnect(payload) {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;

            if (this.subscriptions[this.channel]) {
                this.subscriptions[this.channel].removeAllListeners();
                if (this.verbose) {
                    console.log(`Reconnecting to ${this.channel}...`);
                }
                this.subscriptions[this.channel] = this.openSocket(payload);
            }
        } else {
            if (this.verbose) {
                console.log(`Max retries reached for ${this.channel}`);
            }
        }
    }
    _close() {
        const ws = this.subscriptions[this.channel];
        if (ws) {
            ws.close();
        }
    }
    send() {
        const ws = this.subscriptions[this.channel];
        if (ws && ws.readyState === WebSocketPlatform.OPEN) {
            ws.send.apply(ws, arguments);
        }
    }
}

module.exports = BaseClient;