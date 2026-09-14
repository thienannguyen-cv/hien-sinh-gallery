import assert from 'node:assert/strict';
import test from 'node:test';
import { privateKeyToAccount } from 'viem/accounts';
import { recoverTypedDataAddress, verifyTypedData } from 'viem';
import { buildWalletProofTypedData } from '../../supabase/functions/_shared/three-brushstrokes-service.ts';
import { proofIdentityMismatch, selectProofProvider } from '../../src/wallet/providerIdentity.ts';

const provider = { request: async () => [] };

test('selects Rabby deterministically rather than injected-provider order', () => {
  const selected = selectProofProvider([
    { id: 'other', name: 'Other Wallet', rdns: 'com.example.wallet', provider, source: 'eip6963' },
    { id: 'rabby', name: 'Rabby Wallet', rdns: 'io.rabby', provider, source: 'eip6963' },
  ]);
  assert.equal(selected?.id, 'rabby');
});

test('rejects ambiguous provider selection and detects account or chain change before signing', () => {
  assert.equal(selectProofProvider([
    { id: 'a', name: 'Alpha', provider, source: 'eip6963' },
    { id: 'b', name: 'Beta', provider, source: 'eip6963' },
  ]), null);
  const expected = { challengedWallet: '0x1111111111111111111111111111111111111111', challengedChainId: 1 };
  assert.equal(proofIdentityMismatch({ ...expected, currentWallet: '0x2222222222222222222222222222222222222222', currentChainId: 1 }), 'ACCOUNT_CHANGED');
  assert.equal(proofIdentityMismatch({ ...expected, currentWallet: expected.challengedWallet, currentChainId: 8453 }), 'CHAIN_CHANGED');
  assert.equal(proofIdentityMismatch({ ...expected, currentWallet: expected.challengedWallet, currentChainId: 1 }), 'NONE');
});

test('Rabby-compatible eth_signTypedData_v4 shape verifies only for its challenged EOA', async () => {
  const signer = privateKeyToAccount(`0x${'1'.repeat(64)}`);
  const other = privateKeyToAccount(`0x${'2'.repeat(64)}`);
  const typedData = buildWalletProofTypedData({
    origin: 'http://127.0.0.1:5174', chainId: 1, walletAddress: signer.address.toLowerCase(),
    nonce: 'n'.repeat(43), commitmentSha256: 'a'.repeat(64),
    issuedAt: '2026-09-07T00:00:00.000Z', expiresAt: '2026-09-07T00:05:00.000Z',
  });
  assert.deepEqual(typedData.types.EIP712Domain, [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
  ]);
  // This is the complete JSON-RPC v4 envelope sent to an injected wallet.
  // Its explicit domain definition prevents a wallet from treating the
  // request as an unknown typed-data shape.
  assert.equal(JSON.parse(JSON.stringify(typedData)).types.EIP712Domain[2].type, 'uint256');
  const signature = await signer.signTypedData(typedData);
  const recovered = await recoverTypedDataAddress({ ...typedData, signature });
  assert.equal(recovered.toLowerCase(), signer.address.toLowerCase());
  assert.equal(await verifyTypedData({ address: signer.address, ...typedData, signature }), true);
  assert.equal(await verifyTypedData({ address: other.address, ...typedData, signature }), false);
});
