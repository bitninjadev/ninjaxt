import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { sha512 } from '@noble/hashes/sha512';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils';

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

export { hmacSha256, hmacSha512, sha512Hex };