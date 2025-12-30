import { createHmac } from 'crypto';
import { SentryWebHookHeader } from './dto/sentry-hook';

export function verifySignature(
  data,
  headers: SentryWebHookHeader,
  secret = 'e6d69e86dc27fac6a361d5da1c818d73ddea5b956adf2f9571799f240eb69b3d',
) {
  const hmac = createHmac('sha256', secret);
  hmac.update(JSON.stringify(data), 'utf8');
  const digest = hmac.digest('hex');
  return digest === headers['sentry-hook-signature'];
}
