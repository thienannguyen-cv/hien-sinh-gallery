import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const dist = path.resolve('dist');
const forbiddenFileExtensions = new Set(['.map', '.env', '.pk8', '.pem', '.key']);
const CANONICAL_PAINTING_HASH = '190dfcfc8439c1613c149e72088c0bd32eefa66f2ded7cfbc0f250640b146d8e';

const forbiddenText = [
  'VITE_DEVMODE_ENABLED',
  'VITE_LOCAL_MOCKS',
  'VITE_BYPASS_AUTH',
  'HIEN_SINH_LOCAL_PRESENTATION_PUBLIC_KEY_SPKI',
  'HIEN_SINH_LOCAL_PRESENTATION_SIGNATURE',
  'mockRole',
  'dev-role-selector',
  'BEGIN PRIVATE KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'intersection-allowed.png',
  'intersection-frame.png',
  'condensed_masterpiece_512.png',
];
const forbiddenActiveSourceText = [
  "from 'wagmi'",
  'WagmiProvider',
  'Web3Provider',
  'MockCuratorService',
  'transactionEnabled',
  'transactionDisabled',
  'onInitiatePractice',
  'onAccedeStewardship',
  'writeContract(',
  'sendTransaction(',
  'intersection-allowed.png',
  'intersection-frame.png',
  'condensed_masterpiece_512.png',
  '0x0000000000000000000000000000000000000001',
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  }))).flat();
}

const files = await walk(dist);
const forbiddenFiles = files.filter(file => forbiddenFileExtensions.has(path.extname(file).toLowerCase()));
if (forbiddenFiles.length) {
  throw new Error(`Production artifact contains forbidden files:\n${forbiddenFiles.join('\n')}`);
}

// Reject canonical Painting H_CORE in any dist file
for (const file of files) {
  const buf = await readFile(file);
  const hash = createHash('sha256').update(buf).digest('hex');
  if (hash === CANONICAL_PAINTING_HASH) {
    throw new Error(`Production artifact contains canonical Painting bytes (H_CORE leak) in ${file}`);
  }
}

for (const file of files.filter(candidate => /\.(?:html|js|css|json|txt)$/i.test(candidate))) {
  const content = await readFile(file, 'utf8');
  for (const marker of forbiddenText) {
    if (content.includes(marker)) {
      throw new Error(`Production artifact contains forbidden marker "${marker}" in ${file}`);
    }
  }
}

const sourceFiles = (await walk(path.resolve('src')))
  .filter(candidate => /\.(?:ts|tsx|js|jsx)$/i.test(candidate));
for (const file of sourceFiles) {
  const content = await readFile(file, 'utf8');
  for (const marker of forbiddenActiveSourceText) {
    if (content.includes(marker)) {
      throw new Error(`Active source contains disabled financial or fallback marker "${marker}" in ${file}`);
    }
  }
}

const publicAssets = await readdir(path.resolve('public/assets'));
const allowedPublicAssets = new Set(['frame-cover-banner.svg', 'intersection-public.png']);
const unexpectedPublicAssets = publicAssets.filter(file => !allowedPublicAssets.has(file));
if (unexpectedPublicAssets.length) {
  throw new Error(`Browser-public asset inventory is not allowlisted:\n${unexpectedPublicAssets.join('\n')}`);
}

console.log(`Production security scan passed (${files.length} built files; ${sourceFiles.length} active source files; allowlisted public assets; H_CORE leak check clean).`);
