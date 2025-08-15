import { createHash } from 'crypto';
const secretKey = 'w1JHRBTylvbXFKNP'; // Replace with your actual secret key
const restData = {
  appId: 'recuRy2RxDT28R',
  code: 'Diana|20250814163415',
  sessionId: '7538356709696831000',
};
// Sort keys and construct the string
const sortedKeys = Object.keys(restData).sort();
const concatenatedString = sortedKeys
  .map((key) => `${key}=${restData[key]}`)
  .join('&');

// Append the secret key
const stringToHash = concatenatedString + secretKey;

// Generate MD5 hash
const generatedSignature = createHash('md5').update(stringToHash).digest('hex');

console.log('[ generatedSignature ] >', generatedSignature);
