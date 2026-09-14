import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { hashTypedData } from 'viem';
import { reconstruct } from '../../../operator/independent-reconstruction-20260911/reconstruct.mjs';
import { rehearseArtistAuthorization } from '../../src/services/artistCompleteSigning.ts';
import { completeDigest, completeTransaction } from '../../src/services/completePackageProtocol.ts';

test('PUBLIC-only verifier reconstructs the ceremony result and buyer transaction', async () => {
  const artist = privateKeyToAccount(generatePrivateKey());
  const buyer = privateKeyToAccount(generatePrivateKey());
  const message = { canonicalDesignationHash:'0x'+'11'.repeat(32), archiveCommitment:'0x'+'22'.repeat(32),
    licenseHash:'0x'+'33'.repeat(32), paintingTokenId:0n, frameTokenId:5n,
    designatedBearer:buyer.address, nonce:7n, deadline:1900000000n };
  const signed = await rehearseArtistAuthorization({ message,
    readState: async () => ({artist:artist.address, designation:message.canonicalDesignationHash,
      license:message.licenseHash, nonce:7n, paintingOwner:artist.address, packageId:0n,
      mintStart:1700000000n, timestamp:1800000000n, digest:completeDigest(message)}),
    wallet:{request:async ({method,params}) => {
      if (method === 'eth_accounts') return [artist.address];
      if (method === 'eth_chainId') return '0x2105';
      assert.equal(method,'eth_signTypedData_v4');
      return artist.signTypedData(JSON.parse(params[1]));
    }},
  });
  const independent = reconstruct(signed.message, signed.signature);
  const gallery = completeTransaction(signed.message, signed.signature);
  assert.equal(independent.digest, signed.digest);
  assert.equal(hashTypedData(JSON.parse(independent.serializedWalletTypedData)), signed.digest);
  assert.equal(independent.transaction.data, gallery.data);
  assert.equal(independent.transaction.to.toLowerCase(), gallery.to.toLowerCase());
  assert.equal(independent.transaction.from.toLowerCase(), gallery.from.toLowerCase());
  assert.equal(BigInt(independent.transaction.value), gallery.value);
  assert.equal(Number(BigInt(independent.transaction.chainId)), gallery.chainId);
});
