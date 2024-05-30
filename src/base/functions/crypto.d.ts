import { sha256 } from '@noble/hashes/sha256';
import { hmac } from '@noble/hashes/hmac';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils';

/**
 * Computes HMAC SHA-256 hash of a message given a key.
 * @param key - The secret key as a string or Uint8Array for HMAC computation.
 * @param message - The message to be hashed, provided as a string or Uint8Array.
 * @returns The HMAC SHA-256 hash as a hexadecimal string.
 */
export function hmacSha256(key: string | Uint8Array, message: string | Uint8Array): string;
