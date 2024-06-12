const zero = BigInt(0);
const minusOne = BigInt(-1);
const base = BigInt(10);
class Precise {
    /**
     * Constructs a Precise object. If decimals are not specified, they're calculated from the number if it's a string containing a decimal point.
     * @param {any} number - Initial number, can be a string or BigInt for precise arithmetic.
     * @param {any} [decimals=undefined] - Optional. Number of decimals to consider in arithmetic operations.
     */
    constructor(number, decimals = undefined) {
        this.decimals = undefined;
        this.integer = undefined;
        this.base = undefined;
        if (decimals === undefined) {
            let modifier = 0;
            number = number.toLowerCase();
            if (number.indexOf('e') > -1) {
                [number, modifier] = number.split('e');
                modifier = parseInt(modifier.toString());
            }
            const decimalIndex = number.indexOf('.');
            this.decimals = decimalIndex > -1 ? number.length - decimalIndex - 1 : 0;
            const integerString = number.replace('.', '');
            this.integer = BigInt(integerString);
            this.decimals = this.decimals - modifier;
        } else {
            this.integer = number;
            this.decimals = decimals;
        }
    }
    /**
     * Multiplies this Precise object by another Precise object and returns the result as a new Precise object.
     * @param {Precise} other - The Precise object to multiply with. Must also be a Precise instance.
     * @returns {Precise} The product of the multiplication as a new Precise object.
     */
    mul(other) {
        // other must be another instance of Precise
        const integerResult = this.integer * other.integer;
        return new Precise(integerResult, this.decimals + other.decimals);
    }
    /**
     * Divides this Precise object by another Precise object and returns the result as a new Precise object with specified precision.
     * @param {Precise} other - The Precise object to divide by. Must also be a Precise instance.
     * @param {number} [precision=18] - Number of decimal places to retain in the result.
     * @returns {Precise} The quotient of the division as a new Precise object.
     */
    div(other, precision = 18) {
        const distance = precision - this.decimals + other.decimals;
        let numerator = undefined;
        if (distance === 0) {
            numerator = this.integer;
        } else if (distance < 0) {
            const exponent = base ** BigInt(-distance);
            numerator = this.integer / exponent;
        } else {
            const exponent = base ** BigInt(distance);
            numerator = this.integer * exponent;
        }
        const result = numerator / other.integer;
        return new Precise(result, precision);
    }
    /**
     * Adds another Precise object to this one and returns the result as a new Precise object.
     * @param {Precise} other - The Precise object to add. Must also be a Precise instance.
     * @returns {Precise} The sum of both Precise objects as a new Precise object.
     */
    add(other) {
        if (this.decimals === other.decimals) {
            const integerResult = this.integer + other.integer;
            return new Precise(integerResult, this.decimals);
        } else {
            const [smaller, bigger] = this.decimals > other.decimals ? [other, this] : [this, other];
            const exponent = bigger.decimals - smaller.decimals;
            const normalised = smaller.integer * base ** BigInt(exponent);
            const result = normalised + bigger.integer;
            return new Precise(result, bigger.decimals);
        }
    }
    /**
     * Calculates the remainder of dividing this Precise object by another Precise object and returns it as a new Precise object.
     * @param {Precise} other - The Precise object to divide by and find the remainder. Must also be a Precise instance.
     * @returns {Precise} The remainder of the division as a new Precise object.
     */
    mod(other) {
        const rationizerNumerator = Math.max(-this.decimals + other.decimals, 0);
        const numerator = this.integer * base ** BigInt(rationizerNumerator);
        const rationizerDenominator = Math.max(-other.decimals + this.decimals, 0);
        const denominator = other.integer * base ** BigInt(rationizerDenominator);
        const result = numerator % denominator;
        return new Precise(result, rationizerDenominator + other.decimals);
    }
    /**
     * Subtracts another Precise object from this one and returns the result as a new Precise object.
     * @param {Precise} other - The Precise object to subtract from this one. Must also be a Precise instance.
     * @returns {Precise} The difference between both Precise objects as a new Precise object.
     */
    sub(other) {
        const negative = new Precise(-other.integer, other.decimals);
        return this.add(negative);
    }
    /**
     * Calculates and returns the absolute value of this Precise object as a new Precise object.
     * @returns {Precise} The absolute value of this Precise object as a new Precise object.
     */
    abs() {
        return new Precise(this.integer < 0 ? this.integer * minusOne : this.integer, this.decimals);
    }
    /**
     * Negates the value of this Precise object and returns the result as a new Precise object.
     * @returns {Precise} The negated value of this Precise object as a new Precise object.
     */
    neg() {
        return new Precise(-this.integer, this.decimals);
    }
    /**
     * Compares this Precise object with another to determine the smaller value and returns it as a new Precise object.
     * @param {Precise} other - The Precise object to compare with. Must also be a Precise instance.
     * @returns {Precise} The Precise object with the smaller value.
     */
    min(other) {
        return this.lt(other) ? this : other;
    }
    /**
     * Compares this Precise object with another to determine the larger value and returns it as a new Precise object.
     * @param {Precise} other - The Precise object to compare with. Must also be a Precise instance.
     * @returns {Precise} The Precise object with the larger value.
     */
    max(other) {
        return this.gt(other) ? this : other;
    }
    /**
     * Determines if the current Precise object's value is greater than another Precise object's value.
     * @param {Precise} other - Another Precise object to compare with.
     * @returns {boolean} True if the current object's value is greater than the other object's value, false otherwise.
     */
    gt(other) {
        const sum = this.sub(other);
        return sum.integer > 0;
    }
    /**
     * Determines if the current Precise object's value is greater than or equal to another Precise object's value.
     * @param {Precise} other - Another Precise object to compare with.
     * @returns {boolean} True if the current object's value is greater than or equal to the other object's value, false otherwise.
     */
    ge(other) {
        const sum = this.sub(other);
        return sum.integer >= 0;
    }
    /**
     * Determines if the current Precise object's value is less than another Precise object's value.
     * @param {Precise} other - Another Precise object to compare with.
     * @returns {boolean} True if the current object's value is less than the other object's value, false otherwise.
     */
    lt(other) {
        return other.gt(this);
    }
    /**
     * Determines if the current Precise object's value is less than or equal to another Precise object's value.
     * @param {Precise} other - Another Precise object to compare with.
     * @returns {boolean} True if the current object's value is less than or equal to the other object's value, false otherwise.
     */
    le(other) {
        return other.ge(this);
    }
    /**
     * Simplifies this Precise object's representation by reducing its decimal places if possible without changing its value.
     * @returns {Precise} This Precise object after reduction, potentially with fewer decimal places.
     */
    reduce() {
        const string = this.integer.toString();
        const start = string.length - 1;
        if (start === 0) {
            if (string === '0') {
                this.decimals = 0;
            }
            return this;
        }
        let i;
        for (i = start; i >= 0; i--) {
            if (string.charAt(i) !== '0') {
                break;
            }
        }
        const difference = start - i;
        if (difference === 0) {
            return this;
        }
        this.decimals -= difference;
        this.integer = BigInt(string.slice(0, i + 1));
    }
    /**
     * Checks if the value of this Precise object is equal to the value of another Precise object.
     * @param {Precise} other - The Precise object to compare with. Must also be a Precise instance.
     * @returns {boolean} True if values are equal, false otherwise.
     */
    equals(other) {
        this.reduce();
        other.reduce();
        return this.decimals === other.decimals && this.integer === other.integer;
    }
    /**
     * Converts this Precise object's value to a string representation, including proper decimal placement.
     * @returns {string} String representation of the Precise object's value.
     */
    toString() {
        this.reduce();
        let sign;
        let abs;
        if (this.integer < 0) {
            sign = '-';
            abs = -this.integer;
        } else {
            sign = '';
            abs = this.integer;
        }
        const integerArray = Array.from(abs.toString(Number(base)).padStart(this.decimals, '0'));
        const index = integerArray.length - this.decimals;
        let item;
        if (index === 0) {
            // if we are adding to the front
            item = '0.';
        } else if (this.decimals < 0) {
            item = '0'.repeat(-this.decimals);
        } else if (this.decimals === 0) {
            item = '';
        } else {
            item = '.';
        }
        integerArray.splice(index, 0, item);
        return sign + integerArray.join('');
    }
    /**
     * Multiplies two numeric strings precisely, avoiding floating-point errors, and returns the result as a string.
     * @param {string} string1 - First numeric string to multiply.
     * @param {string} string2 - Second numeric string to multiply.
     * @returns {string} The product of the multiplication as a string.
     */
    static stringMul(string1, string2) {
        if (string1 === undefined || string2 === undefined) {
            return undefined;
        }
        return new Precise(string1).mul(new Precise(string2)).toString();
    }
    /**
     * Divides one numeric string by another and returns the result as a string with specified precision.
     * @param {string} string1 - The numerator numeric string.
     * @param {string} string2 - The denominator numeric string.
     * @param {number} [precision=18] - The precision for the result.
     * @returns {string} The result of the division as a string.
     */
    static stringDiv(string1, string2, precision = 18) {
        if (string1 === undefined || string2 === undefined) {
            return undefined;
        }
        const string2Precise = new Precise(string2);
        if (string2Precise.integer === zero) {
            return undefined;
        }
        return new Precise(string1).div(string2Precise, precision).toString();
    }
    /**
     * Adds two numeric strings and returns the result as a string.
     * @param {string} string1 - The first numeric string.
     * @param {string} string2 - The second numeric string.
     * @returns {string} The sum as a string.
     */
    static stringAdd(string1, string2) {
        if (string1 === undefined && string2 === undefined) {
            return undefined;
        }
        if (string1 === undefined) {
            return string2;
        } else if (string2 === undefined) {
            return string1;
        }
        return new Precise(string1).add(new Precise(string2)).toString();
    }
    /**
     * Subtracts one numeric string from another and returns the result as a string.
     * Enables precise subtraction, avoiding floating-point inaccuracies.
     * @param {string} string1 - The numeric string to subtract from.
     * @param {string} string2 - The numeric string to subtract.
     * @returns {string} The difference as a string.
     */
    static stringSub(string1, string2) {
        if (string1 === undefined || string2 === undefined) {
            return undefined;
        }
        return new Precise(string1).sub(new Precise(string2)).toString();
    }
    /**
     * Calculates the absolute value of a numeric string and returns it as a string.
     * @param {string} string - The numeric string.
     * @returns {string} The absolute value as a string.
     */
    static stringAbs(string) {
        if (string === undefined) {
            return undefined;
        }
        return new Precise(string).abs().toString();
    }
    /**
     * Negates a numeric string (changes its sign) and returns the result as a string.
     * @param {string} string - The numeric string to negate.
     * @returns {string} The negated value as a string.
     */
    static stringNeg(string) {
        if (string === undefined) {
            return undefined;
        }
        return new Precise(string).neg().toString();
    }
    /**
     * Calculates the modulus (remainder of division) of two numeric strings and returns it as a string.
     * @param {string} string1 - The dividend numeric string.
     * @param {string} string2 - The divisor numeric string.
     * @returns {string} The modulus as a string.
     */
    static stringMod(string1, string2) {
        if (string1 === undefined || string2 === undefined) {
            return undefined;
        }
        return new Precise(string1).mod(new Precise(string2)).toString();
    }
    /**
     * Compares two numeric strings for equality and returns true if they represent the same value.
     * @param {string} string1 - The first numeric string.
     * @param {string} string2 - The second numeric string.
     * @returns {boolean} True if both strings represent the same value, otherwise false.
     */
    static stringEquals(string1, string2) {
        if (string1 === undefined || string2 === undefined) {
            return undefined;
        }
        return new Precise(string1).equals(new Precise(string2));
    }
    /**
     * Compares two numeric strings and returns the smaller value as a string.
     * @param {string} string1 - The first numeric string.
     * @param {string} string2 - The second numeric string.
     * @returns {string} The smaller numeric value as a string.
     */
    static stringMin(string1, string2) {
        if (string1 === undefined || string2 === undefined) {
            return undefined;
        }
        return new Precise(string1).min(new Precise(string2)).toString();
    }
    /**
     * Compares two numeric strings and returns the larger value as a string.
     * @param {string} string1 - The first numeric string.
     * @param {string} string2 - The second numeric string.
     * @returns {string} The larger numeric value as a string.
     */
    static stringMax(string1, string2) {
        if (string1 === undefined || string2 === undefined) {
            return undefined;
        }
        return new Precise(string1).max(new Precise(string2)).toString();
    }
    /**
     * Determines if the first numeric string represents a value greater than the second numeric string.
     * @param {string} string1 - The first numeric string.
     * @param {string} string2 - The second numeric string.
     * @returns {boolean} True if the first string represents a larger value, otherwise false.
     */
    static stringGt(string1, string2) {
        if (string1 === undefined || string2 === undefined) {
            return undefined;
        }
        return new Precise(string1).gt(new Precise(string2));
    }
    /**
     * Determines if the first numeric string is greater than or equal to the second numeric string.
     * @param {string} string1 - The first numeric string.
     * @param {string} string2 - The second numeric string.
     * @returns {boolean} True if the first string is greater than or equal to the second, otherwise false.
     */
    static stringGe(string1, string2) {
        if (string1 === undefined || string2 === undefined) {
            return undefined;
        }
        return new Precise(string1).ge(new Precise(string2));
    }
    /**
     * Determines if the first numeric string represents a value less than the second numeric string.
     * @param {string} string1 - The first numeric string.
     * @param {string} string2 - The second numeric string.
     * @returns {boolean} True if the first string represents a smaller value, otherwise false.
     */
    static stringLt(string1, string2) {
        if (string1 === undefined || string2 === undefined) {
            return undefined;
        }
        return new Precise(string1).lt(new Precise(string2));
    }
    /**
     * Determines if the first numeric string is less than or equal to the second numeric string.
     * @param {string} string1 - The first numeric string.
     * @param {string} string2 - The second numeric string.
     * @returns {boolean} True if the first string is less than or equal to the second, otherwise false.
     */
    static stringLe(string1, string2) {
        if (string1 === undefined || string2 === undefined) {
            return undefined;
        }
        return new Precise(string1).le(new Precise(string2));
    }
}

module.exports = Precise, { Precise }; 