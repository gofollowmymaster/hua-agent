import crypto from 'crypto';
function verifySignature(
  data,
  signature,
  secret = 'eb470d9237d66d515fabbd87160152fd0c7c5b808c3089c90c8d82c6569cd26a',
) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(data), 'utf8');
  const digest = hmac.digest('hex');
  return digest === signature;
}
console.log('[ generatedSignature ] >', verifySignature());
