import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ASSETS = [
  {
    name: 'baseline',
    source: path.resolve('archive_assets/intersection-frame.png'),
    target: path.resolve('dist/_internal_assets/frame-curator-baseline.png'),
    expectedHash: 'dc897efc99468a1482e736d4d8f05b0b55555244c835d9731c6a208e908ea260',
  },
  {
    name: 'invited (512x512)',
    source: path.resolve('archive_assets/condensed_masterpiece_512.png'),
    target: path.resolve('dist/_internal_assets/frame-curator-invited.png'),
    expectedHash: '78e49014256c39102f0e3dc6b3a30098076276b63029a2395ac275156f95cce1',
  },
];

const targetDir = path.resolve('dist/_internal_assets');
await mkdir(targetDir, { recursive: true });

for (const asset of ASSETS) {
  const buf = await readFile(asset.source);
  const actualHash = createHash('sha256').update(buf).digest('hex');

  if (actualHash !== asset.expectedHash) {
    throw new Error(`Hash mismatch for ${asset.name}: expected ${asset.expectedHash}, got ${actualHash}`);
  }

  await copyFile(asset.source, asset.target);
  console.log(`[copy-internal-assets] Staged ${asset.name} to ${asset.target} (SHA-256: ${actualHash}, size: ${buf.length} bytes)`);
}
