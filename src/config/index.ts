import feishu from './feishu';
import db from './db';
export default {
  ...feishu,
  ...db,
  jwtSecret: process.env.JWT_SECRET,
  sentryIntegrationToken: process.env.SENTRY_API_TOKEN,
};
