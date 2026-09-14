import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import zlib from 'zlib';
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ARCHIVE_CONTRACT = '0xdf12fc901934f1adfbb6e5199b13ac7287dd9fd8';
export const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

export const PAINTING_CANONICAL_PATHS = Object.freeze([
  'PACKAGE-MANIFEST.json',
  'READ-ME-FIRST.md',
  '_reveal/ARCHIVE-MAP.md',
  '_reveal/CARE-VERIFICATION.md',
  '_reveal/README.en.md',
  '_reveal/README.md',
  '_reveal/effective-verbal-context.md',
  '_reveal/painting/Manifesto_Curatorial_Statement.md',
  '_reveal/painting/PROVENANCE.md',
  '_reveal/painting/The_Ritual_Prompts.md',
  '_reveal/painting/condense_masterpiece.py',
  '_reveal/painting/condensed_masterpiece.png',
  '_reveal/painting/seeds/logo-banner-offset.svg',
  '_reveal/painting/seeds/logo-mark.svg',
  '_reveal/record-schemas/ACCESSION-RECORD.schema.json',
  '_reveal/record-schemas/SUCCESSION-RECORD.schema.json',
]);

export function getFrameCanonicalPaths(tokenId) {
  return Object.freeze([
    'PACKAGE-MANIFEST.json',
    'READ-ME-FIRST.md',
    '_reveal/README.en.md',
    '_reveal/README.md',
    '_reveal/effective-verbal-context.md',
    '_reveal/frame/FRAME-CURATOR-CONTINUATION.md',
    '_reveal/frame/TRAJECTORY-TEMPLATE.md',
    '_reveal/frame/frame-template.en.md',
    '_reveal/frame/frame-template.md',
    '_reveal/frame/logo-banner-offset.svg',
    '_reveal/frame/logo-mark.svg',
  ]);
}

export function resolveCanonicalMemberPaths(tokenId, assetType) {
  if (tokenId === 0) {
    if (assetType !== 'H_PAINTING_PACKAGE' && assetType !== 'H_CORE') {
      throw new Error('Asset type mismatch for Token 0');
    }
    return PAINTING_CANONICAL_PATHS;
  }
  if (Number.isInteger(tokenId) && tokenId >= 1 && tokenId <= 9) {
    if (assetType !== 'H_FRAME_PACKAGE') {
      throw new Error('Asset type mismatch for Frame');
    }
    return getFrameCanonicalPaths(tokenId);
  }
  throw new Error(`Invalid token ID: ${tokenId}`);
}

export function getCanonicalPreviewDirectory(tokenId) {
  const isPainting = tokenId === 0;
  const dirName = isPainting ? 'painting' : `frame${String(tokenId).padStart(2, '0')}`;
  
  const candidates = [
    path.resolve(__dirname, '../../../../..', '_harness', 'retrieval-preview-v6-20260910', dirName),
    path.resolve(process.cwd(), '../../../../..', '_harness', 'retrieval-preview-v6-20260910', dirName),
    path.join('C:/Users/Admin/Downloads/Commercial Images/_harness/retrieval-preview-v6-20260910', dirName),
  ];
  for (const cand of candidates) {
    if (fs.existsSync(cand)) return cand;
  }
  return null;
}

export function generateCanonicalZip(tokenId, assetType) {
  const dir = getCanonicalPreviewDirectory(tokenId);
  if (!dir) return null;

  const paths = resolveCanonicalMemberPaths(tokenId, assetType);
  const fileEntries = [];

  for (const relPath of paths) {
    const fullPath = path.join(dir, ...relPath.split('/'));
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    const data = fs.readFileSync(fullPath);
    fileEntries.push({
      path: relPath,
      data,
    });
  }

  const zipBuffer = createZipBuffer(fileEntries);
  const assetHash = crypto.createHash('sha256').update(zipBuffer).digest('hex');
  const isPainting = tokenId === 0;
  const xx = String(tokenId).padStart(2, '0');
  const filename = isPainting ? 'Hien-Sinh-Painting.zip' : `Hien-Sinh-Frame-${xx}.zip`;

  return {
    zipBuffer,
    assetHash,
    filename,
    memberPaths: paths,
    isCanonical: true,
  };
}

export function createZipBuffer(files) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const f of files) {
    const nameBuf = Buffer.from(f.path, 'utf8');
    const dataBuf = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, 'utf8');
    const crc = zlib.crc32(dataBuf);
    const size = dataBuf.length;

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);

    const localOffset = offset;
    localHeaders.push(local, dataBuf);
    offset += local.length + dataBuf.length;

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(size, 20);
    central.writeUInt32LE(size, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(localOffset, 42);
    nameBuf.copy(central, 46);
    centralHeaders.push(central);
  }

  const centralDirOffset = offset;
  const centralDirSize = centralHeaders.reduce((sum, b) => sum + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

export function listZipEntries(buf) {
  const entries = [];
  let pos = 0;
  while (pos < buf.length - 4) {
    if (buf.readUInt32LE(pos) === 0x02014b50) {
      const nameLen = buf.readUInt16LE(pos + 28);
      const extraLen = buf.readUInt16LE(pos + 30);
      const commentLen = buf.readUInt16LE(pos + 32);
      const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);
      entries.push(name);
      pos += 46 + nameLen + extraLen + commentLen;
    } else {
      pos++;
    }
  }
  return entries;
}

export function readZipEntry(buf, entryPath) {
  let pos = 0;
  while (pos < buf.length - 4) {
    if (buf.readUInt32LE(pos) === 0x02014b50) {
      const nameLen = buf.readUInt16LE(pos + 28);
      const extraLen = buf.readUInt16LE(pos + 30);
      const commentLen = buf.readUInt16LE(pos + 32);
      const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);
      const localOffset = buf.readUInt32LE(pos + 42);
      const size = buf.readUInt32LE(pos + 24);
      if (name === entryPath) {
        const localNameLen = buf.readUInt16LE(localOffset + 26);
        const localExtraLen = buf.readUInt16LE(localOffset + 28);
        const dataStart = localOffset + 30 + localNameLen + localExtraLen;
        return buf.subarray(dataStart, dataStart + size);
      }
      pos += 46 + nameLen + extraLen + commentLen;
    } else {
      pos++;
    }
  }
  return null;
}

export function generateSyntheticZip(tokenId, assetType) {
  const paths = resolveCanonicalMemberPaths(tokenId, assetType);
  const isPainting = tokenId === 0;
  const tokenLabel = isPainting ? 'Painting' : `Frame ${String(tokenId).padStart(2, '0')}`;
  const xx = String(tokenId).padStart(2, '0');

  const filesMap = {};

  for (const p of paths) {
    if (p === 'PACKAGE-MANIFEST.json') {
      continue;
    }

    if (p === 'READ-ME-FIRST.md') {
      filesMap[p] = [
        '# TEST_FALLBACK_NOT_CANONICAL',
        '',
        `## Development-Only Transport Fixture: ${tokenLabel}`,
        '',
        'IMPORTANT: Canonical membership != canonical bytes.',
        'This package is a structural transport fixture for local development only.',
        'It is NOT a canonical release package and contains synthetic placeholder bytes.',
        'It must NEVER be uploaded to the production stewardship-private-archive bucket.',
      ].join('\n');
    } else if (p === '_reveal/frame/FRAME-CURATOR-CONTINUATION.md') {
      filesMap[p] = [
        '# TEST_FALLBACK_NOT_CANONICAL',
        `# Tiếp nối đối thoại — Frame ${xx}`,
        '',
        `**FRAME ${xx}**`,
        '',
        `[DEVELOPMENT PLACEHOLDER CONTINUATION FOR FRAME ${xx}]`,
      ].join('\n');
    } else if (p === '_reveal/README.md') {
      filesMap[p] = [
        `# TEST_FALLBACK_NOT_CANONICAL — ${tokenLabel}`,
        '',
        '[DEVELOPMENT PLACEHOLDER HANDOFF TIẾNG VIỆT]',
      ].join('\n');
    } else if (p === '_reveal/README.en.md') {
      filesMap[p] = [
        `# TEST_FALLBACK_NOT_CANONICAL — ${tokenLabel}`,
        '',
        '[DEVELOPMENT PLACEHOLDER HANDOFF ENGLISH]',
      ].join('\n');
    } else {
      filesMap[p] = [
        '# TEST_FALLBACK_NOT_CANONICAL',
        '',
        `Path: ${p}`,
        'This file contains development placeholder content for structural transport testing.',
      ].join('\n');
    }
  }

  const manifestFiles = Object.entries(filesMap).map(([filePath, text]) => {
    const dataBuf = Buffer.from(text, 'utf8');
    const fileHash = crypto.createHash('sha256').update(dataBuf).digest('hex');
    return {
      path: filePath,
      bytes: dataBuf.length,
      sha256: fileHash,
      canonical_role: 'DEVELOPMENT_SYNTHETIC_PLACEHOLDER',
    };
  });

  const manifestContent = JSON.stringify({
    status: 'TEST_FALLBACK_NOT_CANONICAL',
    disclaimer: 'Development-only transport fixture. Canonical membership != canonical bytes.',
    package_type: isPainting ? 'painting' : 'frame',
    token_scope: tokenId,
    frame_token_id: isPainting ? null : tokenId,
    files: manifestFiles,
  }, null, 2);

  filesMap['PACKAGE-MANIFEST.json'] = manifestContent;

  const fileEntries = paths.map(p => ({
    path: p,
    data: Buffer.from(filesMap[p], 'utf8'),
  }));

  const zipBuffer = createZipBuffer(fileEntries);
  const assetHash = crypto.createHash('sha256').update(zipBuffer).digest('hex');
  const filename = isPainting ? 'Hien-Sinh-Painting.zip' : `Hien-Sinh-Frame-${xx}.zip`;

  return {
    zipBuffer,
    assetHash,
    filename,
    memberPaths: paths,
  };
}

let customOwnershipVerifier = null;
let customAuthorizationVerifier = null;

export function setOwnershipVerifierForTesting(fn) {
  customOwnershipVerifier = fn;
}

export function setAuthorizationVerifierForTesting(fn) {
  customAuthorizationVerifier = fn;
}

export async function verifyTokenOwnership(address, tokenId) {
  if (customOwnershipVerifier) {
    return customOwnershipVerifier(address, tokenId);
  }
  const client = createPublicClient({
    chain: base,
    transport: http(BASE_RPC_URL),
  });
  try {
    const owner = await client.readContract({
      address: ARCHIVE_CONTRACT,
      abi: parseAbi(['function ownerOf(uint256) view returns (address)']),
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    });
    return typeof owner === 'string' && owner.toLowerCase() === address.toLowerCase();
  } catch {
    return false;
  }
}

export async function verifyAcquisitionAuthorization(address) {
  if (customAuthorizationVerifier) {
    return customAuthorizationVerifier(address);
  }
  const supabaseUrl = process.env.ENCOUNTER_SUPABASE_URL || process.env.SUPABASE_URL;
  const serverKey = process.env.ENCOUNTER_SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serverKey) {
    try {
      const url = new URL('/rest/v1/acquisition_authorizations', supabaseUrl);
      url.searchParams.set('wallet_address', `eq.${address.toLowerCase()}`);
      url.searchParams.set('select', 'authorization_id');
      url.searchParams.set('limit', '1');
      const resp = await fetch(url.toString(), {
        headers: {
          'apikey': serverKey,
          'Authorization': `Bearer ${serverKey}`,
        },
      });
      if (resp.ok) {
        const rows = await resp.json();
        return Boolean(rows && rows.length > 0);
      }
    } catch {
      // Fallback
    }
  }
  return false;
}

const syntheticDownloads = new Map();

export function storeSyntheticDownload(downloadId, entry) {
  syntheticDownloads.set(downloadId, entry);
}

export function getSyntheticDownload(downloadId) {
  return syntheticDownloads.get(downloadId);
}

export async function handleArchiveTransmission(body, serverBaseUrl, options = {}) {
  const { address, tokenId, assetType } = body || {};
  if (!address || typeof address !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    const err = new Error('INVALID_ADDRESS');
    err.status = 400;
    throw err;
  }
  if (!Number.isInteger(tokenId) || tokenId < 0 || tokenId > 9) {
    const err = new Error('INVALID_TOKEN');
    err.status = 400;
    throw err;
  }

  const isFrame = assetType === 'H_FRAME_PACKAGE';
  const isPainting = assetType === 'H_PAINTING_PACKAGE' || assetType === 'H_CORE';
  if ((isFrame && tokenId === 0) || (!isFrame && tokenId !== 0) || (!isFrame && !isPainting)) {
    const err = new Error('ASSET_TOKEN_MISMATCH');
    err.status = 400;
    throw err;
  }

  const isOwner = await verifyTokenOwnership(address, tokenId);
  if (!isOwner) {
    const err = new Error('NOT_CURRENT_OWNER');
    err.status = 403;
    throw err;
  }

  if (isPainting) {
    const hasAuth = await verifyAcquisitionAuthorization(address);
    if (!hasAuth) {
      const err = new Error('ACQUISITION_AUTHORIZATION_REQUIRED');
      err.status = 403;
      throw err;
    }
  }

  let packageResult = null;
  if (!options.forceSynthetic) {
    try {
      packageResult = generateCanonicalZip(tokenId, assetType);
    } catch (e) {
      console.warn('[dev-archive-fallback] Canonical zip generation failed, falling back to synthetic:', e?.message);
    }
  }

  if (!packageResult) {
    packageResult = generateSyntheticZip(tokenId, assetType);
  }

  const { zipBuffer, assetHash, filename, isCanonical } = packageResult;
  const downloadId = crypto.randomUUID();

  storeSyntheticDownload(downloadId, {
    buffer: zipBuffer,
    assetHash,
    filename,
    isCanonical: Boolean(isCanonical),
    createdAt: Date.now(),
  });

  return {
    status: 'TRANSMISSION_GRANTED',
    signedUrl: `${serverBaseUrl}/local-archive-download/${downloadId}`,
    expiresInSeconds: 60,
    assetHash,
    archiveCommitment: isCanonical
      ? (tokenId === 0 ? '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9' : 'CANONICAL_FRAME_PREVIEW_V6')
      : 'TEST_FALLBACK_NOT_CANONICAL',
    disclaimer: isCanonical
      ? 'CANONICAL_PREVIEW_V6_ASSEMBLED'
      : 'TEST_FALLBACK_NOT_CANONICAL',
    isCanonical: Boolean(isCanonical),
  };
}

export async function handleSyntheticTransmission(body, serverBaseUrl) {
  return handleArchiveTransmission(body, serverBaseUrl, { forceSynthetic: true });
}
