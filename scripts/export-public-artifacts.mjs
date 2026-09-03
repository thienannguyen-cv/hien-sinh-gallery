import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryRoot = path.resolve(__dirname, '..');
const operatorRoot = path.resolve(galleryRoot, '..');
const blueprintRoot = path.resolve(operatorRoot, '..');

const sourceDir = path.join(blueprintRoot, '00_PUBLIC');
const targetDir = path.join(galleryRoot, '00_PUBLIC');

export const ALLOWLIST = [
  'DEPLOYMENT-RECORD.json',
  'VERIFY.md',
  'VERIFY.en.md',
  'INDEPENDENT-OPERATION.md',
  'INDEPENDENT-OPERATION.en.md',
  'WORK-ONTOLOGY.md',
  'WORK-ONTOLOGY.en.md',
  'CANONICAL-DESIGNATION.md',
  'CANONICAL-DESIGNATION.en.md',
  'CANONICAL-DEFAULT-DIALOGUE.md',
  'CARE-AND-SUCCESSION.md',
  'CARE-AND-SUCCESSION.en.md',
  'HIEN-SINH_dossier.md',
  'HIEN-SINH_dossier.en.md',
  'LEGAL-TERMS.md',
  'LEGAL-TERMS.en.md',
  'LICENSE.md',
  'ORIGIN-PROVENANCE.json',
  'ORIGIN-PROVENANCE.json.asc',
  'ORIGIN-PROVENANCE.json.ots',
  'ORIGIN-PROVENANCE.json.asc.ots',
  'persona-pubkey.asc',
  'PROVENANCE.md',
  'PROVENANCE.en.md',
  'README.md',
  'README.en.md',
  'ROOT-COMMITMENTS.json',
  'SCHEDULE-COMPLETE.md',
  'SCHEDULE-COMPLETE.en.md',
  'SCHEDULE-FRAME.md',
  'SCHEDULE-FRAME.en.md',
  'STEWARDSHIP-CHARTER.md',
  'STEWARDSHIP-CHARTER.en.md',
  'TRANSACTION-DISCLOSURE.md',
  'TRANSACTION-DISCLOSURE.en.md',
  'effective-verbal-context.md'
];

export function exportPublicArtifacts() {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const results = [];

  for (const fileName of ALLOWLIST) {
    const srcFile = path.join(sourceDir, fileName);
    const dstFile = path.join(targetDir, fileName);

    if (!fs.existsSync(srcFile)) {
      throw new Error(`Required allowlisted file missing from source: ${srcFile}`);
    }

    const srcBytes = fs.readFileSync(srcFile);
    fs.writeFileSync(dstFile, srcBytes);

    const dstBytes = fs.readFileSync(dstFile);
    const srcHash = crypto.createHash('sha256').update(srcBytes).digest('hex');
    const dstHash = crypto.createHash('sha256').update(dstBytes).digest('hex');

    if (srcHash !== dstHash) {
      throw new Error(`Byte parity failure for ${fileName}: src=${srcHash} dst=${dstHash}`);
    }

    results.push({
      fileName,
      size: srcBytes.length,
      sha256: srcHash
    });
  }

  // Ensure no unapproved files exist in targetDir
  const targetFiles = fs.readdirSync(targetDir);
  for (const f of targetFiles) {
    if (!ALLOWLIST.includes(f)) {
      throw new Error(`Unapproved file detected in target directory: ${f}`);
    }
  }

  return results;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  console.log('Exporting approved public artifacts from canonical blueprint...');
  const exported = exportPublicArtifacts();
  console.log(`Successfully exported ${exported.length} artifacts with verified byte parity.`);
}
