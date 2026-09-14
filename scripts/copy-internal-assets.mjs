import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const EXPECTED_HASH = 'dc897efc99468a1482e736d4d8f05b0b55555244c835d9731c6a208e908ea260';
const source = path.resolve('archive_assets/intersection-frame.png');
const targetDir = path.resolve('dist/_internal_assets');
const target = path.join(targetDir, 'frame-curator-baseline.png');

const buf = await readFile(source);
const actualHash = createHash('sha256').update(buf).digest('hex');

if (actualHash !== EXPECTED_HASH) {
  throw new Error(`Hash mismatch for intersection-frame.png: expected ${EXPECTED_HASH}, got ${actualHash}`);
}

await mkdir(targetDir, { recursive: true });
await copyFile(source, target);

console.log(`[copy-internal-assets] Staged baseline asset to ${target} (SHA-256: ${actualHash}, size: ${buf.length} bytes)`);
