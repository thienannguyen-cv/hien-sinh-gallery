import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryRoot = path.resolve(__dirname, '..');
const pubDir = path.join(galleryRoot, '00_PUBLIC');
const pathsJson = path.join(galleryRoot, 'src', 'generated', 'release', 'publicDocumentPaths.json');
const commitsJson = path.join(galleryRoot, 'src', 'generated', 'release', 'publicDocumentCommits.json');

const harnessGeneratedDir = path.resolve(galleryRoot, '../../../_harness/vercel-standalone-test/src/generated/release');

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function getAllFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(path.relative(baseDir, fullPath).replace(/\\/g, '/'));
    }
  }
  return files.sort();
}

console.log('=== [Hiện Sinh] Generating Release Hashes & Permalinks ===');

if (!fs.existsSync(pubDir)) {
  console.error(`Error: Directory not found: ${pubDir}`);
  process.exit(1);
}

// 1. Scan all public files
const allPublicPaths = getAllFiles(pubDir);
console.log(`Discovered ${allPublicPaths.length} public release files in 00_PUBLIC.`);

// Write publicDocumentPaths.json
fs.writeFileSync(pathsJson, JSON.stringify(allPublicPaths, null, 2) + '\n', 'utf8');
console.log(`✓ Updated ${path.relative(galleryRoot, pathsJson)}`);

// 2. Extract commit hash for every file
const commits = {};
for (const relPath of allPublicPaths) {
  const gitPath = `00_PUBLIC/${relPath}`;
  try {
    const hash = execFileSync(
      'git',
      ['-C', galleryRoot, 'log', '-n', '1', '--format=%H', '--', gitPath],
      { encoding: 'utf8' }
    ).trim();
    if (hash) {
      commits[relPath] = hash;
      // Also register bare filename for top-level convenience
      const baseName = path.basename(relPath);
      if (!commits[baseName]) {
        commits[baseName] = hash;
      }
    }
  } catch (err) {
    console.warn(`Warning: Could not retrieve git log for ${gitPath}`);
  }
}

// Write publicDocumentCommits.json
fs.writeFileSync(commitsJson, JSON.stringify(commits, null, 2) + '\n', 'utf8');
console.log(`✓ Updated ${path.relative(galleryRoot, commitsJson)} (${Object.keys(commits).length} mappings)`);

// 3. Mirror to harness if available
if (fs.existsSync(harnessGeneratedDir)) {
  fs.copyFileSync(pathsJson, path.join(harnessGeneratedDir, 'publicDocumentPaths.json'));
  fs.copyFileSync(commitsJson, path.join(harnessGeneratedDir, 'publicDocumentCommits.json'));
  console.log(`✓ Mirrored generated JSONs to harness: ${path.relative(galleryRoot, harnessGeneratedDir)}`);
}

// 4. Verification summary
console.log('=== Hashes and Permalinks Synchronized Successfully ===');
