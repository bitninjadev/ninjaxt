class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ExchangeError extends CustomError { }

class DDoSProtection extends CustomError { }

class Unavailable extends CustomError { }

class AuthenticationError extends CustomError { }

class Timeout extends CustomError { }

class EmptyParameters extends CustomError { }

class InternalServerError extends CustomError { }

class PermissionDenied extends CustomError { }

class TooManyRequests extends CustomError { }

class Rejected extends CustomError { }

class AssetNotEnough extends CustomError { }

class OrderNotExist extends CustomError { }

class AmountTooSmall extends CustomError { }

class AmountTooLarge extends CustomError { }

class InvalidOrder extends CustomError { }

class MalformedParameter extends CustomError { }

class DataLost extends CustomError { }

class InvalidParameters extends CustomError { }

class NetworkError extends CustomError { }

class ProtocolError extends CustomError { }

class ProxyError extends CustomError { }

module.exports = {
    ExchangeError,
    DDoSProtection,
    Unavailable,
    AuthenticationError,
    Timeout,
    EmptyParameters,
    InternalServerError,
    PermissionDenied,
    TooManyRequests,
    Rejected,
    AssetNotEnough,
    OrderNotExist,
    AmountTooSmall,
    AmountTooLarge,
    InvalidOrder,
    MalformedParameter,
    DataLost,
    InvalidParameters,
    NetworkError,
    ProtocolError,
    ProxyError,
};
