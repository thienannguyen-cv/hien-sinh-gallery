import { createPublicClient, custom, parseAbi, type Address } from 'viem';
import type { Eip1193Provider } from '../wallet/providerIdentity.ts';
import { accountFrom, chainIdFrom } from '../wallet/providerIdentity.ts';

export const ARCHIVE_CHAIN_ID = 8453;
export const ARCHIVE_CONTRACT = '0xdf12fc901934f1adfbb6e5199b13ac7287dd9fd8';
export type PackageAssetType = 'H_FRAME_PACKAGE' | 'H_PAINTING_PACKAGE';
export type RetrievalStage = 'verifying-ownership' | 'downloading' | 'verified';

export interface OwnedToken {
  tokenId: number;
  assetType: PackageAssetType;
  label: string;
}

export async function resolveOwnedTokens(
  provider: Eip1193Provider,
  address: string
): Promise<OwnedToken[]> {
  const normAddress = address.toLowerCase();
  const client = createPublicClient({ transport: custom(provider) });
  const owned: OwnedToken[] = [];

  const checkToken = async (tokenId: number) => {
    try {
      const owner = await client.readContract({
        address: ARCHIVE_CONTRACT as Address,
        abi: parseAbi(['function ownerOf(uint256) view returns (address)']),
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });
      if (typeof owner === 'string' && owner.toLowerCase() === normAddress) {
        if (tokenId === 0) {
          owned.push({
            tokenId: 0,
            assetType: 'H_PAINTING_PACKAGE',
            label: 'PAINTING',
          });
        } else {
          owned.push({
            tokenId,
            assetType: 'H_FRAME_PACKAGE',
            label: `FRAME ${String(tokenId).padStart(2, '0')}`,
          });
        }
      }
    } catch {
      // Reverted or not minted
    }
  };

  await Promise.all(Array.from({ length: 10 }, (_, i) => checkToken(i)));
  owned.sort((a, b) => a.tokenId - b.tokenId);
  return owned;
}

export async function retrievePackage(options: {
  provider: Eip1193Provider;
  address: string;
  tokenId: number;
  assetType: PackageAssetType;
  origin: string;
  signal: AbortSignal;
  stage: (stage: RetrievalStage) => void;
  fetcher?: typeof fetch;
}) {
  const { provider, tokenId, assetType, signal } = options;
  const address = options.address.toLowerCase();
  const fetcher = options.fetcher ?? fetch;
  if (!Number.isInteger(tokenId) || tokenId < 0 || tokenId > 9
    || (assetType === 'H_PAINTING_PACKAGE' ? tokenId !== 0 : tokenId === 0)) {
    throw new Error('The requested package does not match this token.');
  }
  const input = { address, tokenId, assetType };
  const checkWallet = async () => {
    signal.throwIfAborted();
    const [accounts, chain] = await Promise.all([
      provider.request({ method: 'eth_accounts' }), provider.request({ method: 'eth_chainId' }),
    ]);
    if (accountFrom(accounts)?.toLowerCase() !== address) throw new Error('Your wallet account changed. Please start the download again.');
    if (chainIdFrom(chain) !== ARCHIVE_CHAIN_ID && chain !== '0x2105' && Number(chain) !== 8453) {
      throw new Error('Select Base in your wallet to retrieve this package.');
    }
    signal.throwIfAborted();
  };

  await checkWallet();
  options.stage('verifying-ownership');

  const response = await fetcher('/api/transmit-artwork', {
    method: 'POST', credentials: 'same-origin', cache: 'no-store',
    headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'transmit', ...input }), signal,
  });
  let grant;
  try { grant = await response.json(); } catch { throw new Error('The download service is unavailable. Please try again later.'); }
  if (!response.ok) {
    if (response.status === 403) {
      if (grant?.error === 'ACQUISITION_AUTHORIZATION_REQUIRED') {
        throw new Error('Painting materials retrieval requires primary acquisition authorization history.');
      }
      throw new Error('This wallet is not the current owner of the requested token on Base.');
    }
    throw new Error('The package is not available for retrieval yet. Please try again later.');
  }

  await checkWallet();
  const url = new URL(grant.signedUrl);
  if (url.protocol !== 'https:' && url.protocol !== 'http:' || !/^(0x)?[0-9a-f]{64}$/i.test(grant.assetHash)) {
    throw new Error('The download response could not be verified.');
  }
  options.stage('downloading');
  const fileResponse = await fetcher(url.href, { credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal });
  if (!fileResponse.ok) {
    await fileResponse.body?.cancel();
    throw new Error('The download link expired or is unavailable. Please start again.');
  }
  const bytes = await fileResponse.arrayBuffer();
  const actualHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  if (actualHash !== grant.assetHash.toLowerCase().replace(/^0x/, '')) throw new Error('File verification failed. No file was saved.');
  await checkWallet();
  options.stage('verified');
  return {
    blob: new Blob([bytes], { type: 'application/zip' }),
    sha256: actualHash,
    filename: tokenId === 0 ? 'Hien-Sinh-Painting.zip' : `Hien-Sinh-Frame-${String(tokenId).padStart(2, '0')}.zip`,
  };
}
