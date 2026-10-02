import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);
const keyLength = 64;
const hashVersion = 'scrypt';

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer;
  return `${hashVersion}$${salt.toString('base64')}$${derivedKey.toString('base64')}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [version, encodedSalt, encodedKey] = storedHash.split('$');
  if (version !== hashVersion || !encodedSalt || !encodedKey) return false;

  try {
    const expectedKey = Buffer.from(encodedKey, 'base64');
    const actualKey = (await scrypt(
      password,
      Buffer.from(encodedSalt, 'base64'),
      keyLength,
    )) as Buffer;
    return (
      expectedKey.length === actualKey.length &&
      timingSafeEqual(expectedKey, actualKey)
    );
  } catch {
    return false;
  }
}
