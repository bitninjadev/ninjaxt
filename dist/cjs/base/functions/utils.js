const isString = (s) => (typeof s === 'string');
const asFloat = (x) => ((Number.isFinite(x) || (isString(x) && x.length !== 0)) ? parseFloat(x) : NaN);
const asInteger = (x) => ((Number.isFinite(x) || (isString(x) && x.length !== 0)) ? Math.trunc(Number(x)) : NaN);
const isStringCoercible = (x) => (isValid(x) && x.toString || Number.isFinite(x));
const hasProp = (obj, props) => {
    for (let i = 0; i < props.length; i++) {
        if (!obj.hasOwnProperty(props[i]) || typeof obj[props[i]] === 'undefined') {
            return false;
        }
    }
    return true;
};
const isValid = (x) => (x !== null && x !== undefined);
const define = (obj, props) => {
    for (let i = 0; i < props.length; i++) {
        if (typeof obj[props[i]] !== 'undefined') {
            return obj[props[i]];
        }
    }
    return null;
};

const convertSciToNormal = (num) => {
    const str = num.toString()
    const match = str.match(/^(\d+)(\.(\d+))?[eE]([-\+]?\d+)$/)
    if (!match) return str //number was not e notation or toString converted
    // we parse the e notation as (integer).(tail)e(exponent)
    const [, integer, , tail, exponentStr] = match
    const exponent = Number(exponentStr)
    const realInteger = integer + (tail || '')
    if (exponent > 0) {
        const realExponent = Math.abs(exponent + integer.length)
        return realInteger.padEnd(realExponent, '0')
    } else {
        const realExponent = Math.abs(exponent - (tail?.length || 0))
        return '0.' + realInteger.padStart(realExponent, '0')
    }

}

const isEmpty = (value) => {
    if (isArray(value) || typeof value === 'string') {
        return value.length === 0;
    } else if (isObject(value) && value !== null) {
        return Object.keys(value).length === 0;
    }
    return false;
};
const isArray = Array.isArray;
const isObject = (o) => ((o !== null) && (typeof o === 'object') && !isArray(o));
const isRegExp = (o) => (o instanceof RegExp);
const isDictionary = (o) => (isObject(o) && (Object.getPrototypeOf(o) === Object.prototype) && !isArray(o) && !isRegExp(o));

const safeFloat = (obj, prop, $default) => {
    const n = asFloat(define(obj, [prop]));
    return Number.isFinite(n) ? n : $default;
};
const safeInteger = (obj, prop, $default) => {
    const n = asInteger(define(obj, [prop]));
    return Number.isFinite(n) ? n : $default;
};
const safeValue = (obj, prop, $default) => {
    const x = define(obj, [prop]);
    return isValid(x) ? x : $default;
};
const safeString = (obj, prop, $default) => {
    const x = define(obj, [prop]);
    return isStringCoercible(x) ? String(x) : $default;
};
const safeTimestamp = (obj, prop, $default) => {
    const x = define(obj, [prop]);
    return Number.isFinite(x) ? parseInt(x) : $default;
}
const safeStringLower = (obj, prop, $default) => {
    const x = define(obj, [prop]);
    return isStringCoercible(x) ? String(x).toLowerCase() : $default;
};
const safeStringUpper = (obj, prop, $default) => {
    const x = define(obj, [prop]);
    return isStringCoercible(x) ? String(x).toUpperCase() : $default;
};

const extend = (...args) => Object.assign({}, ...args);
const extendWithKey = (obj, key, value) => {
    if (value !== null) {
        obj[key] = value;
    }
};
const extendWithObj = (obj, values) => {
    Object.entries(values).forEach(([key, value]) => {
        // Check for undefined, null, or empty (objects/arrays)
        if (value !== undefined && value !== null && !isEmpty(value)) {
            obj[key] = value;
        }
    });
};
const deepExtend = function deepExtend(...xs) {
    let out = undefined;
    for (const x of xs) {
        if (isDictionary(x)) {
            if (!isDictionary(out)) {
                out = {};
            }
            for (const k in x) {
                out[k] = deepExtend(out[k], x[k]);
            }
        } else {
            out = x;
        }
    }
    return out;
};
const upperCase = (str) => {
    if (typeof str !== 'undefined' && str !== null) {
        return str.toUpperCase();
    }
    return '';
};
const lowerCase = (str) => {
    if (typeof str !== 'undefined' && str !== null) {
        return str.toLowerCase();
    }
    return '';
};


const sortBy = (array, key, descending = false, defaultValue = 0, direction = descending ? -1 : 1) => array.sort((a, b) => {
    const first = (key in a) ? a[key] : defaultValue;
    const second = (key in b) ? b[key] : defaultValue;
    if (first < second) {
        return -direction;
    }
    else if (first > second) {
        return direction;
    }
    else {
        return 0;
    }
});

const toMilliseconds = x => x * 1000;
const schedule = async (callback, args = [], interval = 1000) => {
    setTimeout(async () => {
        await callback(...args);
        schedule(callback, args, interval);
    }, interval);
}


const parseToInt = (number) => {
    // Solve Common parseInt misuse ex: parseInt ((since / 1000).toString ())
    // using a number as parameter which is not valid in ts
    const stringifiedNumber = number.toString();
    const convertedNumber = parseFloat(stringifiedNumber);
    return parseInt(convertedNumber);
}


const decimalPlaces = num => {
    const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) return 0;
    return String(Math.max(0,
        // Number of digits right of decimal point.
        (match[1] ? match[1].length : 0) -
        // Adjust for scientific notation.
        (match[2] ? +match[2] : 0),
    ));
};


module.exports = {
    asFloat,
    asInteger,
    isStringCoercible,
    hasProp,
    isValid,
    define,
    convertSciToNormal,
    safeFloat,
    safeInteger,
    safeValue,
    safeString,
    safeTimestamp,
    safeStringLower,
    safeStringUpper,
    extend,
    extendWithKey,
    isEmpty,
    extendWithObj,
    deepExtend,
    upperCase,
    lowerCase,
    sortBy,
    isArray,
    isObject,
    isRegExp,
    isDictionary,
    toMilliseconds,
    schedule,
    parseToInt,
    decimalPlaces
};