export declare function isString(s: any): s is string;
export declare function asFloat(x: any): number;
export declare function asInteger(x: any): number;
export declare function isStringCoercible(x: any): boolean;
export declare function hasProp(obj: object, props: string[]): boolean;
export declare function isValid(x: any): boolean;
export declare function define<T>(obj: object, props: string[]): T | null;

export declare function numberToString(x: any): string | null | undefined;
export declare function isEmpty(value: any): boolean;
export declare function isArray(o: any): o is Array<any>;
export declare function isObject(o: any): o is object;
export declare function isRegExp(o: any): o is RegExp;
export declare function isDictionary(o: any): o is Record<string, any>;

export declare function safeFloat(obj: object, prop: string, $default: number): number;
export declare function safeInteger(obj: object, prop: string, $default: number): number;
export declare function safeValue<T>(obj: object, prop: string, $default: T): T;
export declare function safeString(obj: object, prop: string, $default: string): string;
export declare function safeTimestamp(obj: object, prop: string, $default: number): number;
export declare function safeStringLower(obj: object, prop: string, $default: string): string;
export declare function safeStringUpper(obj: object, prop: string, $default: string): string;

export declare function extend(...args: object[]): object;
export declare function extendWithKey(obj: object, key: string, value: any): void;
export declare function extendWithObj(obj: object, values: object): void;
export declare function deepExtend(...xs: object[]): object;
export declare function upperCase(str: string | undefined | null): string;
export declare function lowerCase(str: string | undefined | null): string;

export declare function sortBy<T>(array: T[], key: keyof T, descending?: boolean, defaultValue?: any, direction?: number): T[];
export declare function toMilliseconds(x: number): number;
export declare function schedule(delay: number, func: (...args: any[]) => any, ...args: any[]): Promise<any>;
export declare function parseToInt(number: number): number;
