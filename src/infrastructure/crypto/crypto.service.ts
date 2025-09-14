import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { createHash, randomInt } from 'crypto';
import forge from 'node-forge';

@Injectable()
export class CryptoService {
  /**
   * Securely hashes a plaintext string using the argon2 algorithm.
   */
  public hash(plainText: string): Promise<string> {
    return argon2.hash(plainText);
  }

  /**
   * Securely compares a plaintext against an argon2 hash.
   */
  public compareHash(hash: string, plainText: string): Promise<boolean> {
    return argon2.verify(hash, plainText);
  }

  /**
   * Computes the SHA-256 hash of the input data.
   */
  public sha256(data: Uint8Array): Uint8Array {
    return createHash('sha256').update(data).digest();
  }

  /**
   * Converts a byte array to a lowercase hexadecimal string.
   */
  public encodeHexLowerCase(input: Uint8Array): string {
    return Array.from(input)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Encodes a byte array using base32 with lowercase letters and no padding.
   */
  public encodeBase32LowerCaseNoPadding(input: Uint8Array): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < input.length; i++) {
      value = (value << 8) | input[i];
      bits += 8;
      while (bits >= 5) {
        output += alphabet[(value >> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }

    return output;
  }

  /**
   * Generates a numeric token as an integer.
   */
  public generateNumericToken(length = 6): number {
    if (length < 1) {
      throw new Error('length must be at least 1');
    }

    let token = randomInt(1, 10);

    for (let i = 1; i < length; i++) {
      token = token * 10 + randomInt(0, 10);
    }

    return token;
  }

  /**
   * Generates a cryptographically secure random hexadecimal string.
   */
  public generateRandomHexString(length = 16): string {
    const bytes = forge.random.getBytesSync(length);
    return forge.util.bytesToHex(bytes);
  }
}
