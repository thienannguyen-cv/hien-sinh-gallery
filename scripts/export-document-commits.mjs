import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryRoot = path.resolve(__dirname, '..');
const pubDir = path.join(galleryRoot, '00_PUBLIC');
const outJson = path.join(galleryRoot, 'src', 'generated', 'release', 'publicDocumentCommits.json');

const commits = {};
for (const fname of fs.readdirSync(pubDir).sort()) {
  const fpath = path.join(pubDir, fname);
  if (fs.statSync(fpath).isFile()) {
    const rel = `00_PUBLIC/${fname}`;
    const hash = execFileSync('git', ['-C', galleryRoot, 'log', '-n', '1', '--format=%H', '--', rel], { encoding: 'utf8' }).trim();
    commits[fname] = hash;
  }
}

fs.writeFileSync(outJson, JSON.stringify(commits, null, 2) + '\n', 'utf8');
console.log(`Generated per-file commit mappings for ${Object.keys(commits).length} public documents.`);
