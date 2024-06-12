const { hmac } = require('@noble/hashes/hmac');
const { sha256 } = require('@noble/hashes/sha256');
const { sha512 } = require('@noble/hashes/sha512');
const { utf8ToBytes, bytesToHex } = require('@noble/hashes/utils');

function hmacSha256(key, message) {
    // Ensure key and message are Uint8Array
    const keyBytes = typeof key === 'string' ? utf8ToBytes(key) : key;
    const messageBytes = typeof message === 'string' ? utf8ToBytes(message) : message;

    // Compute HMAC and convert to hex string
    const mac = hmac(sha256, keyBytes, messageBytes);
    return bytesToHex(mac); // Convert the resulting Uint8Array to a hex string
}

function hmacSha512(key, message) {
    // Ensure key and message are Uint8Array
    const keyBytes = typeof key === 'string' ? utf8ToBytes(key) : key;
    const messageBytes = typeof message === 'string' ? utf8ToBytes(message) : message;

    // Compute HMAC and convert to hex string
    const mac = hmac(sha512, keyBytes, messageBytes);
    return bytesToHex(mac); // Convert the resulting Uint8Array to a hex string
}

function sha512Hex(input) {
    const bytes = typeof input === 'string' ? utf8ToBytes(input) : input;
    return bytesToHex(sha512(bytes));
}

module.exports = { hmacSha256, hmacSha512, sha512Hex };