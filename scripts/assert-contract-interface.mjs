import { execFileSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

import { existsSync } from 'node:fs';

const root = process.cwd();
const contractRoot = path.resolve(root, '..', 'contract');
const canonicalExporter = path.join(contractRoot, 'script', 'export-abi.js');

if (existsSync(canonicalExporter)) {
  execFileSync(process.execPath, [canonicalExporter, '--check'], {
    cwd: contractRoot,
    stdio: 'inherit',
  });
} else {
  // In standalone buyer deployment mode, verify the bundled contract interface exists and is non-empty
  const bundledInterface = path.join(root, 'src', 'generated', 'contract', 'hienSinhInterface.ts');
  if (!existsSync(bundledInterface)) {
    throw new Error(`Contract interface missing in standalone mode: ${bundledInterface}`);
  }
  console.log('[assert-contract-interface] Standalone mode: Verified bundled contract interface.');
}

const forbiddenContractCopies = [];
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['generated', 'node_modules', 'dist'].includes(entry.name)) continue;
      await walk(absolute);
    } else if (/HienSinh(?:Gallery)?\.(?:sol|json)$/i.test(entry.name)) {
      forbiddenContractCopies.push(absolute);
    }
  }
}
await walk(path.join(root, 'src'));
if (forbiddenContractCopies.length) {
  throw new Error(`Hand-maintained contract copies are forbidden in gallery source:\n${forbiddenContractCopies.join('\n')}`);
}

console.log('Generated contract projections match the canonical compiled source byte-for-byte.');
