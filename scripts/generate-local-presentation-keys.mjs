import { webcrypto } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const configuredDirectory = process.argv[2];
if (!configuredDirectory) {
  throw new Error('Usage: npm run presentation:keygen -- <empty-directory>');
}

const secretDirectory = path.resolve(configuredDirectory);
const privatePath = path.join(secretDirectory, 'local-presentation.private.pk8');
const publicPath = path.join(secretDirectory, 'local-presentation.public.spki');
const keyPair = await webcrypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify'],
);
const privateKey = await webcrypto.subtle.exportKey('pkcs8', keyPair.privateKey);
const publicKey = await webcrypto.subtle.exportKey('spki', keyPair.publicKey);

await mkdir(secretDirectory, { recursive: true, mode: 0o700 });
await writeFile(privatePath, Buffer.from(privateKey), { mode: 0o600, flag: 'wx' });
await writeFile(publicPath, Buffer.from(publicKey), { mode: 0o600, flag: 'wx' });

console.log(`private_key=${privatePath}`);
console.log(`public_key=${publicPath}`);
console.log(`HIEN_SINH_LOCAL_PRESENTATION_PUBLIC_KEY_SPKI=${Buffer.from(publicKey).toString('base64url')}`);
