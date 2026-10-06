import { expect, test as base } from '@playwright/test';
import { installAdminApiMocks } from './mock-api';

interface AdminFixtures {
  adminApi: void;
}

export const test = base.extend<AdminFixtures>({
  adminApi: [
    async ({ page }, use) => {
      await installAdminApiMocks(page);
      await use();
    },
    { auto: true },
  ],
});

export { expect };
