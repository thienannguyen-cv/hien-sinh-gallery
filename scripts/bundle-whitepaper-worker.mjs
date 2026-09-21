import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(galleryRoot, 'public', 'whitepaper', 'index.html');

const deploymentDir = path.resolve(galleryRoot, '../03_DEPLOYMENT');
const dedicatedWorkerJs = path.join(deploymentDir, 'dedicated-whitepaper-worker', 'worker.js');
const rootWorkerJs = path.join(deploymentDir, 'hien-sinh-whitepaper.worker.js');

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

console.log('=== [Hiện Sinh] Packaging Dedicated Whitepaper Cloudflare Worker ===');

if (!fs.existsSync(htmlPath)) {
  console.error(`Error: Source HTML not found at ${htmlPath}`);
  process.exit(1);
}

const htmlUtf8 = fs.readFileSync(htmlPath, 'utf8');
const htmlBytes = Buffer.from(htmlUtf8, 'utf8');
const htmlHash = sha256(htmlBytes);
const htmlBase64 = htmlBytes.toString('base64');

console.log(`Source HTML: ${htmlPath}`);
console.log(`  Byte length: ${htmlBytes.length} bytes`);
console.log(`  SHA-256:     ${htmlHash}`);

const hasSection83 = htmlUtf8.includes('8.3 Security Architecture') || htmlUtf8.includes('SolidityScan QuickScan');
const hasSection15 = htmlUtf8.includes('Ontological Observation Log') || htmlUtf8.includes('ontological_observation_log');

if (!hasSection83) {
  console.warn('⚠️ Warning: Section 8.3 (Security Architecture / SolidityScan) not detected in source HTML!');
} else {
  console.log('✓ Verified: Section 8.3 (Security Architecture & SolidityScan) present in payload.');
}

if (!hasSection15) {
  console.warn('⚠️ Warning: Section 15 (Ontological Observation Log) not detected in source HTML!');
} else {
  console.log('✓ Verified: Section 15 (Ontological Observation Log) present in payload.');
}

const workerCode = `const TARGET_PATH = '/whitepaper';
const HTML_BASE64 = '${htmlBase64}';

function frozenHtmlBytes() {
  const binary = atob(HTML_BASE64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

const HTML_BYTES = frozenHtmlBytes();
const REPRESENTATION_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Content-Length': String(HTML_BYTES.byteLength),
};

export default {
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== TARGET_PATH && url.pathname !== TARGET_PATH + '/') {
      return new Response('Not found', { status: 404 });
    }
    if (request.method === 'HEAD') return new Response(null, { status: 200, headers: REPRESENTATION_HEADERS });
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
    return new Response(HTML_BYTES, { status: 200, headers: REPRESENTATION_HEADERS });
  },
};
`;

if (fs.existsSync(path.dirname(dedicatedWorkerJs))) {
  fs.writeFileSync(dedicatedWorkerJs, workerCode, 'utf8');
  console.log(`✓ Updated dedicated worker: ${path.relative(galleryRoot, dedicatedWorkerJs)}`);
}

if (fs.existsSync(deploymentDir)) {
  fs.writeFileSync(rootWorkerJs, workerCode, 'utf8');
  console.log(`✓ Updated deployment worker: ${path.relative(galleryRoot, rootWorkerJs)}`);
}

console.log('=== Whitepaper Cloudflare Worker Packaged Successfully ===');
