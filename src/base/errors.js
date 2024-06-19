class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ExchangeError extends CustomError { };

export class DDoSProtection extends CustomError { }

export class Unavailable extends CustomError { };

export class AuthenticationError extends CustomError { }

export class Timeout extends CustomError { };

export class EmptyParameters extends CustomError { };

export class InternalServerError extends CustomError { };

export class PermissionDenied extends CustomError { };

export class TooManyRequests extends CustomError { };

export class Rejected extends CustomError { };

export class AssetNotEnough extends CustomError { };

export class OrderNotExist extends CustomError { };

export class AmountTooSmall extends CustomError { };

export class AmountTooLarge extends CustomError { };

export class InvalidOrder extends CustomError { };

export class MalformedParameter extends CustomError { }

export class DataLost extends CustomError { }

export class InvalidParameters extends CustomError { }

export class NetworkError extends CustomError { }

export class ProtocolError extends CustomError { }

export class ProxyError extends CustomError { }