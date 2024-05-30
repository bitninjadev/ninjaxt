import WebSocket from 'ws';
import { deepExtend, isEmpty } from '../functions/utils';
import { isNode } from '../functions/platform';
import { EventEmitter } from 'events';

declare const WebSocketPlatform: typeof WebSocket | typeof self.WebSocket;

export class BaseClient extends EventEmitter {
    constructor(
        options?: {
            handleSocketOpen?: () => void;
            handleSocketClose?: () => void;
            handleSocketMessage?: (message: any) => void;
            handleSocketError?: (error: Error) => void;
            subscriptions?: { [key: string]: WebSocket };
            reconnect?: boolean;
            maxRetries?: number;
            retryCount?: number;
            verbose?: boolean;
            pingInterval?: number;
            lastPingTime?: number;
            agent?: any;
        },
        handleSocketOpen?: () => void,
        handleSocketClose?: () => void,
        handleSocketMessage?: (message: any) => void,
        handleSocketError?: (error: Error) => void,
    );

    isOpen(): boolean;
    subscribe(channel: string, payload?: any): WebSocket | undefined;
    unsubscribe(): void;
    openSocket(payload?: any): WebSocket;
}
