import { hashPassword, verifyPassword } from './password.util';

describe('password utility', () => {
  it('verifies the original password and rejects a different password', async () => {
    const hash = await hashPassword('password123');

    await expect(verifyPassword('password123', hash)).resolves.toBe(true);
    await expect(verifyPassword('password124', hash)).resolves.toBe(false);
  });

  it('rejects malformed password hashes', async () => {
    await expect(verifyPassword('password123', 'invalid')).resolves.toBe(false);
  });
});
