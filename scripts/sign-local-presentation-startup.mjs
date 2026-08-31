import { webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const privatePath = process.argv[2];
if (!privatePath) {
  throw new Error('Usage: npm run presentation:sign -- <private-key-path>');
}

const privateKey = await webcrypto.subtle.importKey(
  'pkcs8',
  await readFile(path.resolve(privatePath)),
  { name: 'ECDSA', namedCurve: 'P-256' },
  false,
  ['sign'],
);
const message = Buffer.from('hien-sinh:local-presentation:v1', 'utf8');
const signature = await webcrypto.subtle.sign(
  { name: 'ECDSA', hash: 'SHA-256' },
  privateKey,
  message,
);

console.log(`HIEN_SINH_LOCAL_PRESENTATION_SIGNATURE=${Buffer.from(signature).toString('base64url')}`);
