import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { completeDigest } from '../../src/services/completePackageProtocol.ts';
import { DEPLOYED_ARTIST, rehearseArtistAuthorization } from '../../src/services/artistCompleteSigning.ts';

function setup(change = {}) {
  const artist = privateKeyToAccount(generatePrivateKey());
  const message = { canonicalDesignationHash: '0x'+'11'.repeat(32), archiveCommitment: '0x'+'22'.repeat(32),
    licenseHash: '0x'+'33'.repeat(32), paintingTokenId: 0n, frameTokenId: 5n,
    designatedBearer: privateKeyToAccount(generatePrivateKey()).address, nonce: 0n, deadline: 1900000000n };
  const state = { artist: artist.address, designation: message.canonicalDesignationHash, license: message.licenseHash,
    nonce: 0n, paintingOwner: artist.address, packageId: 0n, mintStart: 1700000000n,
    timestamp: 1800000000n, digest: completeDigest(message), ...change };
  let calls = [], reads = 0;
  const wallet = { request: async ({method,params}) => {
    calls.push(method);
    if (method === 'eth_accounts') return [state.artist];
    if (method === 'eth_chainId') return '0x2105';
    assert.equal(method, 'eth_signTypedData_v4', 'no transaction or personal signing');
    const payload = JSON.parse(params[1]);
    return artist.signTypedData(payload);
  }};
  return { message, state, wallet, calls, readState: async () => { reads++; return {...state}; }, get reads() { return reads; } };
}

test('Artist ceremony uses EIP-712 wallet method and checks state again before releasing result', async () => {
  const f = setup();
  const result = await rehearseArtistAuthorization(f);
  assert.equal(result.rehearsal, true);
  assert.equal(result.digest, completeDigest(f.message));
  assert.equal(f.reads, 2);
  assert.deepEqual(f.calls, ['eth_accounts','eth_chainId','eth_signTypedData_v4','eth_accounts','eth_chainId']);
});

test('real Artist is blocked before prompting any wallet', async () => {
  const f = setup({artist: DEPLOYED_ARTIST, paintingOwner: DEPLOYED_ARTIST});
  await assert.rejects(rehearseArtistAuthorization(f), /Production Artist signing is disabled/);
  assert.equal(f.calls.length, 0);
});

test('expired, consumed, wrong digest or unavailable state never prompts signing', async () => {
  for (const change of [{nonce:1n}, {timestamp:1900000001n}, {packageId:5n}, {digest:'0x'+'00'.repeat(32)}]) {
    const f = setup(change);
    await assert.rejects(rehearseArtistAuthorization(f));
    assert.equal(f.calls.length, 0);
  }
});

test('state changed during signing does not release approval', async () => {
  const f = setup(); let reads = 0;
  f.readState = async () => ({...f.state, nonce: ++reads === 1 ? 0n : 1n});
  await assert.rejects(rehearseArtistAuthorization(f), /nonce changed/);
});

test('form mutation during wallet signing cannot alter the returned signed message', async () => {
  const f = setup(); const original = {...f.message}; const request = f.wallet.request;
  f.wallet.request = async args => {
    if (args.method === 'eth_signTypedData_v4') f.message.archiveCommitment = '0x'+'99'.repeat(32);
    return request(args);
  };
  const result = await rehearseArtistAuthorization(f);
  assert.deepEqual(result.message, original);
});
