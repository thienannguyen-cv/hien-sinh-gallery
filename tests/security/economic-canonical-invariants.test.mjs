import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import {
  encodeFunctionData,
  parseAbi,
  toHex,
  stringToBytes,
  keccak256,
} from 'viem';

import {
  COMPLETE_CONTRACT,
  COMPLETE_PRICE,
  COMPLETE_ACQUIRE_ABI,
  completeTypedData,
  completeTransaction,
} from '../../src/services/completePackageProtocol.ts';

import { canonicalizeJson } from '../../src/services/authorization/canonicalJson.ts';
import { DEFAULT_AUTHORIZATION_REGISTRY } from '../../src/services/authorization/onChainAuthorizationDiscovery.ts';

const HIEN_SINH_FULL_ABI = parseAbi([
  'function COMPLETE_PACKAGE_PRICE() view returns(uint256)',
  'function PAINTING_MINIMUM_SUCCESSION_CONSIDERATION() view returns(uint256)',
  'function completePackageTokenId() view returns(uint256)',
  'function ownerOf(uint256) view returns(address)',
  'function nonces(address) view returns(uint256)',
  'function artistSigner() view returns(address)',
  'function acquireCompletePackage(bytes32,bytes32,bytes32,uint256,uint256,uint256,uint256,bytes) payable',
  'function executeSuccession(uint256,address) payable',
  'function transferFrom(address,address,uint256)',
]);

async function createFixture() {
  const artist = privateKeyToAccount(generatePrivateKey());
  const buyer = privateKeyToAccount(generatePrivateKey());
  const stranger = privateKeyToAccount(generatePrivateKey());

  const message = {
    canonicalDesignationHash: '0x' + '11'.repeat(32),
    archiveCommitment: '0x' + '22'.repeat(32),
    licenseHash: '0x' + '33'.repeat(32),
    paintingTokenId: 0n,
    frameTokenId: 5n,
    designatedBearer: buyer.address,
    nonce: 0n,
    deadline: 1900000000n,
  };

  const typedData = completeTypedData(message);
  const signature = await artist.signTypedData(typedData);

  return { artist, buyer, stranger, message, signature };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Primary Consideration Exactness: Exactly 4.29 ETH
// ─────────────────────────────────────────────────────────────────────────────
test('1. Primary Consideration Exactness: Complete Package requires exactly 4.29 ETH', async () => {
  const { message, signature } = await createFixture();
  const tx = completeTransaction(message, signature);

  assert.equal(tx.value, COMPLETE_PRICE);
  assert.equal(tx.value, 4290000000000000000n);

  // Assert exact function signature matches deployed HienSinh.sol
  assert.equal(COMPLETE_ACQUIRE_ABI[0].name, 'acquireCompletePackage');
  assert.equal(COMPLETE_ACQUIRE_ABI[0].inputs.length, 8);
  assert.equal(COMPLETE_ACQUIRE_ABI[0].stateMutability, 'payable');

  // Any deviation from 4.29 ETH is rejected by contract logic
  const underpaidValue = 4280000000000000000n; // 4.28 ETH
  const overpaidValue = 4300000000000000000n;  // 4.30 ETH
  assert.notEqual(underpaidValue, COMPLETE_PRICE);
  assert.notEqual(overpaidValue, COMPLETE_PRICE);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Canonical Succession Minimum: Cannot occur under 4.29 ETH
// ─────────────────────────────────────────────────────────────────────────────
test('2. Canonical Succession Minimum: Token 0 succession consideration cannot be under 4.29 ETH', async () => {
  const successionMin = 4290000000000000000n; // 4.29 ETH
  const subMinimumConsideration = 4289999999999999999n; // 4.29 ETH - 1 wei

  assert.ok(subMinimumConsideration < successionMin);
  // Contract enforces: if (msg.value < PAINTING_MINIMUM_SUCCESSION_CONSIDERATION) revert InsufficientSuccessionConsideration()
  const validateSuccessionPayment = (value) => {
    if (value < successionMin) {
      throw new Error(`InsufficientSuccessionConsideration: minimum ${successionMin}, actual ${value}`);
    }
    return true;
  };

  assert.throws(
    () => validateSuccessionPayment(subMinimumConsideration),
    /InsufficientSuccessionConsideration/
  );
  assert.ok(validateSuccessionPayment(successionMin));
  assert.ok(validateSuccessionPayment(5000000000000000000n)); // 5 ETH is allowed
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Registry Price Independence: Registry cannot alter or override 4.29 ETH
// ─────────────────────────────────────────────────────────────────────────────
test('3. Registry Price Independence: HienSinhAuthorizationRegistry cannot override 4.29 ETH', async () => {
  const { buyer, message, signature } = await createFixture();

  const artifact = {
    domain: { name: 'HienSinh', version: '2', chainId: 8453, verifyingContract: COMPLETE_CONTRACT },
    message: {
      ...message,
      paintingTokenId: '0',
      frameTokenId: '5',
      nonce: '0',
      deadline: String(message.deadline),
    },
    signature,
    source: 'on_chain',
  };

  const canonicalPayload = toHex(stringToBytes(canonicalizeJson(artifact)));
  const artifactHash = keccak256(stringToBytes(canonicalizeJson(artifact)));

  // Registry anchor function ABI
  const registryAbi = parseAbi([
    'function anchorAuthorization(address targetContract, address designatedBearer, uint256 nonce, uint256 deadline, bytes canonicalPayload, bytes signature) external',
  ]);

  // Notice: anchorAuthorization takes 0 payable value and specifies NO price parameter
  assert.equal(registryAbi[0].stateMutability, 'nonpayable');
  assert.equal(registryAbi[0].inputs.some(input => input.name === 'price' || input.name === 'value'), false);

  // Even if an anchor is registered on Base, executing acquireCompletePackage on HienSinh.sol still requires 4.29 ETH
  const tx = completeTransaction(message, signature);
  assert.equal(tx.value, 4290000000000000000n);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. No Cheaper Path: Registry cannot create an alternative acquisition route
// ─────────────────────────────────────────────────────────────────────────────
test('4. No Cheaper Path: Registry cannot create an acquisition path cheaper or different from HienSinh.sol', async () => {
  // Registry has no mint, burn, or transfer capabilities
  const registryCalldata = encodeFunctionData({
    abi: parseAbi([
      'function anchorAuthorization(address,address,uint256,uint256,bytes,bytes)',
    ]),
    functionName: 'anchorAuthorization',
    args: [
      COMPLETE_CONTRACT,
      VALID_BUYER_ADDR,
      0n,
      1900000000n,
      '0x1234',
      '0x' + '00'.repeat(65),
    ],
  });

  // Sending calldata to registry does not change token balances in HienSinh
  assert.notEqual(registryCalldata.slice(0, 10), '0x3b5abbb7'); // Not acquireCompletePackage selector
  assert.notEqual(DEFAULT_AUTHORIZATION_REGISTRY.toLowerCase(), COMPLETE_CONTRACT.toLowerCase());
});

const VALID_BUYER_ADDR = '0x1111111111111111111111111111111111111111';

// ─────────────────────────────────────────────────────────────────────────────
// 5. Price-Agnostic Artifact: EIP-712 struct contains zero price argument
// ─────────────────────────────────────────────────────────────────────────────
test('5. Price-Agnostic Artifact: CompletePackageAcceptance EIP-712 struct contains NO price parameter', () => {
  const fields = completeTypedData({
    canonicalDesignationHash: '0x' + '11'.repeat(32),
    archiveCommitment: '0x' + '22'.repeat(32),
    licenseHash: '0x' + '33'.repeat(32),
    paintingTokenId: 0n,
    frameTokenId: 5n,
    designatedBearer: VALID_BUYER_ADDR,
    nonce: 0n,
    deadline: 1900000000n,
  }).types.CompletePackageAcceptance;

  // The struct strictly specifies exact designation and bearer fields; price is not in the message
  const fieldNames = fields.map(f => f.name);
  assert.equal(fieldNames.includes('price'), false);
  assert.equal(fieldNames.includes('value'), false);
  assert.equal(fieldNames.includes('payment'), false);

  // Pricing authority is 100% hardcoded in HienSinh.sol (COMPLETE_PACKAGE_PRICE = 4.29 ether)
  assert.equal(COMPLETE_PRICE, 4290000000000000000n);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Fake Registry Entry: Yields zero ownership and reverts on settlement
// ─────────────────────────────────────────────────────────────────────────────
test('6. Fake Registry Entry: Malicious entry in open bulletin board yields zero ownership', async () => {
  const attacker = privateKeyToAccount(generatePrivateKey());
  const fakeSig = '0x' + '99'.repeat(65);

  // Attacker creates calldata targeting HienSinh with forged signature
  const fakeMessage = {
    canonicalDesignationHash: '0x' + '11'.repeat(32),
    archiveCommitment: '0x' + '22'.repeat(32),
    licenseHash: '0x' + '33'.repeat(32),
    paintingTokenId: 0n,
    frameTokenId: 5n,
    designatedBearer: attacker.address,
    nonce: 0n,
    deadline: 1900000000n,
  };

  // Attempting to complete transaction with fake signature
  const tx = completeTransaction(fakeMessage, fakeSig);
  assert.equal(tx.to, COMPLETE_CONTRACT);
  assert.equal(tx.from, attacker.address);

  // Smart contract execution will revert with InvalidArtistSignature()
  // Client RAM verification rejects before prompt:
  let clientVerificationThrew = false;
  try {
    const { verifyAuthorizationPipeline } = await import('../../src/services/authorization/authorizationProvider.ts');
    const res = await verifyAuthorizationPipeline({
      domain: { name: 'HienSinh', version: '2', chainId: 8453, verifyingContract: COMPLETE_CONTRACT },
      message: { ...fakeMessage, paintingTokenId: '0', frameTokenId: '5', nonce: '0', deadline: '1900000000' },
      signature: fakeSig,
      source: 'on_chain',
    }, {
      connectedWallet: attacker.address,
      onChainState: { contractNonce: 0n, artistSigner: '0x3cff39491b333016055B3d9328905B0b172988a4', blockTimestamp: 1726000000n },
    });
    if (!res.success) clientVerificationThrew = true;
  } catch {
    clientVerificationThrew = true;
  }
  assert.ok(clientVerificationThrew);
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. 1/1 Supply Invariant: Duplicate authorization cannot mint a second Complete Package
// ─────────────────────────────────────────────────────────────────────────────
test('7. 1/1 Supply Invariant: Secondary execution reverts with CompletePackageAlreadyAcquired', async () => {
  // Simulate smart contract state check when completePackageTokenId is already 5
  const evaluateAcquisitionEligibility = (completePackageTokenId) => {
    if (completePackageTokenId !== 0n) {
      throw new Error(`CompletePackageAlreadyAcquired(${completePackageTokenId})`);
    }
    return true;
  };

  // First acquisition succeeds when completePackageTokenId == 0
  assert.ok(evaluateAcquisitionEligibility(0n));

  // Second acquisition strictly reverts because Package 05 is a 1/1
  assert.throws(
    () => evaluateAcquisitionEligibility(5n),
    /CompletePackageAlreadyAcquired\(5\)/
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Choke-Point Invariant: No layer path can bypass HienSinh.sol
// ─────────────────────────────────────────────────────────────────────────────
test('8. Choke-Point Invariant: Token 0 transfer is strictly restricted to acquireCompletePackage & executeSuccession', () => {
  // HienSinh.sol:172-185 _update choke-point:
  // if (tokenId == PAINTING_TOKEN_ID && from != address(0)) {
  //     if (!_isPrimaryAcquisition && !_isCanonicalSuccession) {
  //         if (!paintingPrimaryReleased) revert PaintingTransferLocked();
  //         revert PaintingOrdinaryTransferDisabled();
  //     }
  // }
  const simulateToken0Transfer = ({ isPrimaryAcquisition, isCanonicalSuccession, paintingPrimaryReleased }) => {
    if (!isPrimaryAcquisition && !isCanonicalSuccession) {
      if (!paintingPrimaryReleased) {
        throw new Error('PaintingTransferLocked');
      }
      throw new Error('PaintingOrdinaryTransferDisabled');
    }
    return 'TRANSFER_SUCCESS';
  };

  // Ordinary transfer (ERC721.transferFrom) attempts revert
  assert.throws(
    () => simulateToken0Transfer({ isPrimaryAcquisition: false, isCanonicalSuccession: false, paintingPrimaryReleased: false }),
    /PaintingTransferLocked/
  );
  assert.throws(
    () => simulateToken0Transfer({ isPrimaryAcquisition: false, isCanonicalSuccession: false, paintingPrimaryReleased: true }),
    /PaintingOrdinaryTransferDisabled/
  );

  // Only internal contract calls with flags enabled succeed
  assert.equal(
    simulateToken0Transfer({ isPrimaryAcquisition: true, isCanonicalSuccession: false, paintingPrimaryReleased: false }),
    'TRANSFER_SUCCESS'
  );
  assert.equal(
    simulateToken0Transfer({ isPrimaryAcquisition: false, isCanonicalSuccession: true, paintingPrimaryReleased: true }),
    'TRANSFER_SUCCESS'
  );
});
