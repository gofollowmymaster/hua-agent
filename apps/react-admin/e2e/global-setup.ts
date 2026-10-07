import { request } from '@playwright/test';

const APP_URL = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT || '5175'}/`;
const READY_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 500;

export default async function globalSetup() {
  const api = await request.newContext({
    extraHTTPHeaders: {
      'Cache-Control': 'no-cache',
    },
  });
  const deadline = Date.now() + READY_TIMEOUT_MS;
  let lastStatus = 'no response';

  try {
    while (Date.now() < deadline) {
      try {
        const response = await api.get(`${APP_URL}?ready=${Date.now()}`);
        const html = await response.text();
        lastStatus = `HTTP ${response.status()}`;

        if (response.ok() && !html.includes('Bundling...')) {
          return;
        }
      } catch (error) {
        lastStatus = error instanceof Error ? error.message : String(error);
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  } finally {
    await api.dispose();
  }

  throw new Error(
    `React Admin did not finish bundling within ${READY_TIMEOUT_MS}ms (${lastStatus}).`,
  );
}
