import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { completeDigest, completeWalletPayload, completeTransaction, verifyCompleteAuthorization } from '../../src/services/completePackageProtocol.ts';
const requireContract = createRequire(new URL('../../../contract/package.json', import.meta.url));
const { Wallet, TypedDataEncoder, Interface } = requireContract('ethers');
const abi = JSON.parse(readFileSync(new URL('../../../contract/abi/HienSinh.abi.json', import.meta.url), 'utf8'));
// Independently transcribed from Solidity; never import the implementation's types/domain.
const domain = { name: 'HienSinh', version: '2', chainId: 8453, verifyingContract: '0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8' };
const types = { CompletePackageAcceptance: [
  ['canonicalDesignationHash','bytes32'], ['archiveCommitment','bytes32'], ['licenseHash','bytes32'],
  ['paintingTokenId','uint256'], ['frameTokenId','uint256'], ['designatedBearer','address'], ['nonce','uint256'], ['deadline','uint256'],
].map(([name,type]) => ({name,type})) };
const artist = Wallet.createRandom(), buyer = Wallet.createRandom();
const message = { canonicalDesignationHash: '0x'+'11'.repeat(32), archiveCommitment: '0x'+'22'.repeat(32),
  licenseHash: '0x'+'33'.repeat(32), paintingTokenId: 0n, frameTokenId: 5n, designatedBearer: buyer.address,
  nonce: 9007199254740993n, deadline: 1900000000n };

test('independent ethers reconstruction matches digest, wallet JSON and exported contract ABI calldata', async () => {
  const signature = await artist.signTypedData(domain, types, message);
  assert.equal(completeDigest(message), TypedDataEncoder.hash(domain, types, message));
  const json = JSON.parse(completeWalletPayload(message));
  assert.equal(json.message.nonce, '9007199254740993');
  const { EIP712Domain, ...walletTypes } = json.types;
  assert.equal(EIP712Domain.length, 4);
  assert.equal(TypedDataEncoder.hash(json.domain, walletTypes, json.message), completeDigest(message));
  assert.equal((await verifyCompleteAuthorization(message, signature, artist.address)).toLowerCase(), artist.address.toLowerCase());
  const tx = completeTransaction(message, signature);
  assert.equal(tx.data, new Interface(abi).encodeFunctionData('acquireCompletePackage', [
    message.canonicalDesignationHash, message.archiveCommitment, message.licenseHash, 0, 5, message.deadline, message.nonce, signature,
  ]));
  assert.equal(tx.data.slice(0,10), '0x3b5abbb7');
  assert.equal(tx.value, 4290000000000000000n);
  assert.equal(tx.from, buyer.address);
  assert.equal(tx.to, domain.verifyingContract);
});

test('authorization is bound to every field and the deployed chain/domain', async () => {
  const signature = await artist.signTypedData(domain, types, message);
  for (const change of [
    { designatedBearer: artist.address }, { nonce: message.nonce+1n }, { deadline: message.deadline+1n },
    { archiveCommitment: '0x'+'44'.repeat(32) }, { canonicalDesignationHash: '0x'+'55'.repeat(32) }, { licenseHash: '0x'+'66'.repeat(32) },
  ]) await assert.rejects(verifyCompleteAuthorization({...message,...change}, signature, artist.address));
  for (const change of [{chainId:1}, {version:'1'}, {verifyingContract: buyer.address}]) {
    const wrong = await artist.signTypedData({...domain,...change}, types, message);
    await assert.rejects(verifyCompleteAuthorization(message, wrong, artist.address));
  }
  assert.throws(() => completeDigest({...message, paintingTokenId:1n}));
  assert.throws(() => completeDigest({...message, nonce:-1n}));
  assert.throws(() => completeDigest({...message, nonce:Number(message.nonce)}));
  assert.throws(() => completeDigest({...message, archiveCommitment:'0x'+'00'.repeat(32)}));
});
