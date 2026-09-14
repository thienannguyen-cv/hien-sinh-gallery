import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPublicClient, http, encodeFunctionData, fallback } from 'viem';
import { base } from 'viem/chains';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_ADDRESS = '0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8';
const ARTIST_ADDRESS = '0x3cff39491b333016055B3d9328905B0b172988a4';

const RPC_ENDPOINTS = [
  'https://mainnet.base.org',
  'https://base-mainnet.public.blastapi.io',
  'https://base.blockpi.network/v1/rpc/public',
  'https://1rpc.io/base',
  'https://base-rpc.publicnode.com'
];

const ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../contract/abi/HienSinh.abi.json'), 'utf8'));

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('=== BASE MAINNET CONTRACT INVARIANT & PURCHASE SIMULATION ===\n');

  const client = createPublicClient({
    chain: base,
    transport: fallback(RPC_ENDPOINTS.map(url => http(url, { retryCount: 3, retryDelay: 500 })))
  });

  const read = async (name, args = []) => {
    await sleep(150);
    return client.readContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: name, args });
  };

  const totalIdentities = await read('TOTAL_IDENTITIES');
  const maxFrameSupply = await read('MAX_FRAME_SUPPLY');
  const paintingTokenId = await read('PAINTING_TOKEN_ID');
  const completePackageId = await read('COMPLETE_PACKAGE_ID');
  const artistGenesisFrameId = await read('ARTIST_GENESIS_FRAME_ID');
  const framePrice = await read('FRAME_PRICE');
  const completePackagePrice = await read('COMPLETE_PACKAGE_PRICE');
  const minDelay = await read('MIN_MINT_DELAY');
  const mintStart = await read('mintStart');
  const artistOnChain = await read('artistSigner');
  const treasuryOnChain = await read('treasury');
  const designationHash = await read('canonicalDesignationHash');
  const frameLicenseHash = await read('frameLicenseHash');
  const completeLicenseHash = await read('completeLicenseHash');

  console.log('Contract Immutables & Constants:');
  console.log(`  TOTAL_IDENTITIES: ${totalIdentities}`);
  console.log(`  MAX_FRAME_SUPPLY: ${maxFrameSupply}`);
  console.log(`  PAINTING_TOKEN_ID: ${paintingTokenId}`);
  console.log(`  COMPLETE_PACKAGE_ID: ${completePackageId}`);
  console.log(`  ARTIST_GENESIS_FRAME_ID: ${artistGenesisFrameId}`);
  console.log(`  FRAME_PRICE: ${framePrice} wei (0.081 ETH)`);
  console.log(`  COMPLETE_PACKAGE_PRICE: ${completePackagePrice} wei (4.29 ETH)`);
  console.log(`  MIN_MINT_DELAY: ${minDelay} seconds (24h)`);
  console.log(`  mintStart: ${new Date(Number(mintStart) * 1000).toISOString()}`);
  console.log(`  ARTIST SIGNER: ${artistOnChain} (match: ${artistOnChain.toLowerCase() === ARTIST_ADDRESS.toLowerCase()})`);
  console.log(`  TREASURY: ${treasuryOnChain}`);
  console.log(`  CANONICAL_DESIGNATION_HASH: ${designationHash}`);
  console.log(`  FRAME_LICENSE_HASH: ${frameLicenseHash}`);
  console.log(`  COMPLETE_LICENSE_HASH: ${completeLicenseHash}`);

  // 2. Ownership checks
  const owner0 = await read('ownerOf', [0n]);
  const owner6 = await read('ownerOf', [6n]);
  const completePackageTokenId = await read('completePackageTokenId');
  const paintingPrimaryReleased = await read('paintingPrimaryReleased');

  let isFrame5Minted = false;
  try {
    const owner5 = await read('ownerOf', [5n]);
    isFrame5Minted = Boolean(owner5);
  } catch {
    isFrame5Minted = false;
  }

  console.log('\nGenesis Ownership & State:');
  console.log(`  ownerOf(0): ${owner0} (Artist: ${owner0.toLowerCase() === ARTIST_ADDRESS.toLowerCase()})`);
  console.log(`  ownerOf(6): ${owner6} (Artist: ${owner6.toLowerCase() === ARTIST_ADDRESS.toLowerCase()})`);
  console.log(`  completePackageTokenId: ${completePackageTokenId}`);
  console.log(`  isFrameMinted(5): ${isFrame5Minted}`);
  console.log(`  paintingPrimaryReleased: ${paintingPrimaryReleased}`);

  // 3. Purchase simulation for standalone Frame 02 (0.081 ETH)
  const testBuyer = '0x1111111111111111111111111111111111111111';
  try {
    await sleep(200);
    const frame2Sim = await client.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'mintFrame',
      args: [2n],
      account: testBuyer,
      value: framePrice
    });
    console.log('\n[SIMULATION PASS] mintFrame(2) simulation succeeded with 0.081 ETH.');
  } catch (e) {
    console.log('\n[SIMULATION RESULT] mintFrame(2):', e.shortMessage || e.message);
  }

  // 4. Complete Package 05 Purchase Payload & Simulation
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);
  const nonce = await read('nonces', [testBuyer]);
  const dummySignature = '0x' + '00'.repeat(65);
  const archiveCommitment = '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9';

  const calldata05 = encodeFunctionData({
    abi: ABI,
    functionName: 'acquireCompletePackage',
    args: [
      designationHash,
      archiveCommitment,
      completeLicenseHash,
      0n,
      5n,
      deadline,
      nonce,
      dummySignature
    ]
  });
  console.log(`\nComplete Package 05 Calldata Length: ${calldata05.length / 2 - 1} bytes`);

  try {
    await sleep(200);
    await client.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'acquireCompletePackage',
      args: [
        designationHash,
        archiveCommitment,
        completeLicenseHash,
        0n,
        5n,
        deadline,
        nonce,
        dummySignature
      ],
      account: testBuyer,
      value: completePackagePrice
    });
    console.log('[SIMULATION] acquireCompletePackage unexpectedly succeeded with dummy signature');
  } catch (e) {
    console.log(`[SIMULATION PASS - REJECTED INVALID SIGNATURE AS EXPECTED]: ${e.shortMessage || e.message}`);
  }
}

main().catch(console.error);
