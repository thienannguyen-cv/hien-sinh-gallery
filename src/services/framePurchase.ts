import { createPublicClient, custom, parseAbi, encodeFunctionData, type Address, type Hex } from 'viem';
import { COMPLETE_CONTRACT } from './completePackageProtocol.ts';

export const FRAME_PRICE = 81000000000000000n; // 0.081 ETH
export const COMPLETE_PACKAGE_FRAME_ID = 5;
export const ARTIST_GENESIS_FRAME_ID = 6;
export const MAX_FRAME_SUPPLY = 9;

const frameAbi = parseAbi([
  'function mintFrame(uint256 tokenId) payable',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function mintStart() view returns (uint256)',
  'function FRAME_PRICE() view returns (uint256)',
]);

export interface PurchaseProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

export interface FrameTransaction {
  from: Address;
  to: Address;
  data: Hex;
  value: bigint;
  tokenId: number;
}

export async function checkWalletForFrame(provider: PurchaseProvider): Promise<Address> {
  const chain = await provider.request({ method: 'eth_chainId' });
  const normalizedChain = typeof chain === 'string' && /^0x/i.test(chain) ? parseInt(chain, 16) : Number(chain);
  if (normalizedChain !== 8453 && chain !== '0x2105') {
    throw new Error('Select Base in your wallet before preparing the Frame transaction');
  }
  const accounts = await provider.request({ method: 'eth_accounts' });
  if (!Array.isArray(accounts) || accounts.length === 0 || typeof accounts[0] !== 'string') {
    throw new Error('Connect your wallet to continue');
  }
  return accounts[0] as Address;
}

export function validateStandaloneFrameId(tokenId: number): void {
  if (!Number.isInteger(tokenId) || tokenId < 1 || tokenId > MAX_FRAME_SUPPLY) {
    throw new Error(`Invalid frame ID: ${tokenId}`);
  }
  if (tokenId === COMPLETE_PACKAGE_FRAME_ID) {
    throw new Error('Frame 05 is reserved for the Complete Package');
  }
  if (tokenId === ARTIST_GENESIS_FRAME_ID) {
    throw new Error('Frame 06 is reserved for the Artist Genesis Archive');
  }
}

export async function checkFrameStatus(
  provider: PurchaseProvider,
  tokenId: number
): Promise<{ isMinted: boolean; owner: Address | null; mintStarted: boolean }> {
  validateStandaloneFrameId(tokenId);
  try {
    const client = createPublicClient({ transport: custom(provider) });
    const block = await client.getBlock();

    const mintStart = await client.readContract({
      address: COMPLETE_CONTRACT,
      abi: frameAbi,
      functionName: 'mintStart',
    });

    const mintStarted = block.timestamp >= mintStart;

    try {
      const owner = await client.readContract({
        address: COMPLETE_CONTRACT,
        abi: frameAbi,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });
      return { isMinted: true, owner: owner as Address, mintStarted };
    } catch {
      // Reverted with ERC721NonexistentToken -> unminted / available
      return { isMinted: false, owner: null, mintStarted };
    }
  } catch {
    // If RPC/contract call reverts or contract is not yet active, fail open as available
    return { isMinted: false, owner: null, mintStarted: true };
  }
}

export async function prepareFramePurchase(
  provider: PurchaseProvider,
  tokenId: number
): Promise<{ transaction: FrameTransaction; checkedAtBlock: bigint }> {
  validateStandaloneFrameId(tokenId);
  const buyer = await checkWalletForFrame(provider);
  const client = createPublicClient({ transport: custom(provider) });
  const block = await client.getBlock();

  const [mintStart, contractPrice] = await Promise.all([
    client.readContract({
      address: COMPLETE_CONTRACT,
      abi: frameAbi,
      functionName: 'mintStart',
    }),
    client.readContract({
      address: COMPLETE_CONTRACT,
      abi: frameAbi,
      functionName: 'FRAME_PRICE',
    }),
  ]);

  if (block.timestamp < mintStart) {
    throw new Error('Minting has not started yet');
  }

  if (contractPrice !== FRAME_PRICE) {
    throw new Error('Contract price does not match expected frame price');
  }

  // Check if frame is already minted
  try {
    const existingOwner = await client.readContract({
      address: COMPLETE_CONTRACT,
      abi: frameAbi,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    });
    if (existingOwner) {
      throw new Error(`Frame ${String(tokenId).padStart(2, '0')} has already been minted`);
    }
  } catch (err: any) {
    if (err?.message?.includes('already been minted')) {
      throw err;
    }
    // ERC721NonexistentToken is expected for unminted tokens
  }

  const data = encodeFunctionData({
    abi: frameAbi,
    functionName: 'mintFrame',
    args: [BigInt(tokenId)],
  });

  // Simulate call on-chain
  await client.call({
    account: buyer,
    to: COMPLETE_CONTRACT,
    data,
    value: FRAME_PRICE,
  });

  const transaction: FrameTransaction = {
    from: buyer,
    to: COMPLETE_CONTRACT,
    data,
    value: FRAME_PRICE,
    tokenId,
  };

  return { transaction, checkedAtBlock: block.number };
}

export async function executeFramePurchase(
  provider: PurchaseProvider,
  tokenId: number,
  onHash: (hash: Hex) => void
) {
  const prepared = await prepareFramePurchase(provider, tokenId);
  const tx = prepared.transaction;

  const hash = await provider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: tx.from,
        to: tx.to,
        data: tx.data,
        value: `0x${tx.value.toString(16)}`,
      },
    ],
  });

  if (typeof hash !== 'string' || !/^0x[0-9a-f]{64}$/i.test(hash)) {
    throw new Error('Wallet did not return a valid transaction hash');
  }

  onHash(hash as Hex);

  const client = createPublicClient({ transport: custom(provider) });
  const receipt = await client.waitForTransactionReceipt({ hash: hash as Hex, timeout: 120000 });

  if (receipt.status !== 'success') {
    throw new Error('The frame acquisition transaction reverted');
  }

  // Verify ownership on contract at receipt block
  const newOwner = await client.readContract({
    address: COMPLETE_CONTRACT,
    abi: frameAbi,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)],
    blockNumber: receipt.blockNumber,
  });

  if (newOwner.toLowerCase() !== tx.from.toLowerCase()) {
    throw new Error('Receipt ownership mismatch');
  }

  return receipt;
}
