/**
 * issue-rehearsal-authorization.mjs
 *
 * Operator tool — LOCAL REHEARSAL ONLY.
 * Exercises the complete asynchronous authorization protocol with test wallets.
 */

import { privateKeyToAccount } from 'viem/accounts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  prepareAuthoritativeBundle,
  verifyArtistSignature,
  persistVerifiedAuthorization,
} from './execute_airgap_authorization_ceremony.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', 'gallery', '.env.development.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^([^#=][^=]*)=(.*)/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  });
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Deterministic test key for local rehearsal (Anvil account 1)
const TEST_REHEARSAL_ARTIST_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const buyerAddress = process.argv[2];
if (!buyerAddress || !/^0x[0-9a-fA-F]{40}$/.test(buyerAddress)) {
  console.error('Usage: node --experimental-strip-types operator/issue-rehearsal-authorization.mjs <buyer_address>');
  process.exit(1);
}

const supabaseUrl = process.env.ENCOUNTER_SUPABASE_URL;
const serviceKey  = process.env.ENCOUNTER_SUPABASE_SECRET_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('ERROR: ENCOUNTER_SUPABASE_URL and ENCOUNTER_SUPABASE_SECRET_KEY must be set in gallery/.env.development.local');
  process.exit(1);
}

console.log('\n[1] Checking encounter request state for', buyerAddress, '…');
const reqIdRes = await fetch(
  new URL(`/rest/v1/encounter_requests?wallet_address=eq.${buyerAddress.toLowerCase()}&status=eq.PENDING&select=request_id&limit=1`, supabaseUrl),
  { headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` } }
);
const reqRows = await reqIdRes.json();
const encounterRequestId = reqRows?.[0]?.request_id ?? null;
console.log('    Pending encounter request_id:', encounterRequestId ?? '(none)');

console.log('[2] Preparing authoritative bundle (deadline = prepared_at + 7 days) …');
const bundle = prepareAuthoritativeBundle(buyerAddress, 0n);
console.log('    Session Request ID:', bundle.requestId);
console.log('    Prepared At:', new Date(bundle.preparedAt * 1000).toISOString());
console.log('    Authoritative Deadline:', new Date(bundle.deadline * 1000).toISOString());

console.log('[3] Simulating Cold-Signing Ceremony with Test Rehearsal Artist …');
const testArtist = privateKeyToAccount(TEST_REHEARSAL_ARTIST_KEY);
const signature = await testArtist.signTypedData(bundle.typedData);
console.log('    Signature generated (65 bytes):', signature.slice(0, 20) + '…');

console.log('[4] Server-side independent signature verification …');
const recovered = await verifyArtistSignature(bundle.typedData, signature, testArtist.address);
console.log('    Recovered signer matches test Artist:', recovered);

console.log('[5] Atomic persistence & encounter confirmation …');
const result = await persistVerifiedAuthorization({
  supabaseUrl,
  serviceKey,
  walletAddress: buyerAddress,
  typedData: bundle.typedData,
  signature,
  requestId: bundle.requestId,
  preparedAt: bundle.preparedAt,
  deadline: bundle.deadline,
  encounterRequestId,
});

console.log('    Persistence result:', result);
console.log('\n✓ Rehearsal authorization complete. Buyer may now poll /api/acquisition-authorization and acquire.\n');
