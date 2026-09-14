import { createPublicClient, custom, parseAbi, type Address, type Hex } from 'viem';
import { completeTransaction, completeTypedData, verifyCompleteAuthorization, COMPLETE_CONTRACT, COMPLETE_PRICE, type CompleteAcceptance } from './completePackageProtocol.ts';
import { assertAcquisitionState } from './artistCompleteSigning.ts';

const readAbi = parseAbi([
  'function artistSigner() view returns(address)', 'function canonicalDesignationHash() view returns(bytes32)',
  'function completeLicenseHash() view returns(bytes32)', 'function nonces(address) view returns(uint256)',
  'function ownerOf(uint256) view returns(address)', 'function completePackageTokenId() view returns(uint256)',
  'function mintStart() view returns(uint256)', 'function COMPLETE_PACKAGE_PRICE() view returns(uint256)',
  'function designatedArchiveCommitment() view returns(bytes32)',
  'function hashCompletePackageAcceptance(bytes32,bytes32,bytes32,uint256,uint256,address,uint256,uint256) view returns(bytes32)',
]);
export interface PurchaseProvider { request(args:{method:string;params?:unknown[]}):Promise<unknown> }
export interface PurchaseAuthorization { message:CompleteAcceptance; signature:Hex }
export function parsePurchaseAuthorization(text:string):PurchaseAuthorization {
  if(text.length>16384)throw new Error('Authorization file is too large');
  const value=JSON.parse(text);
  if(value?.domain?.name!=='HienSinh' || value.domain.version!=='2' || String(value.domain.chainId)!=='8453'
    || String(value.domain.verifyingContract).toLowerCase()!==COMPLETE_CONTRACT.toLowerCase())throw new Error('Authorization targets another contract or network');
  const m=value.message;
  if(!m || !['nonce','deadline','paintingTokenId','frameTokenId'].every(k=>typeof m[k]==='string' && /^(0|[1-9][0-9]*)$/.test(m[k])))throw new Error('Authorization integers must be decimal strings');
  const message={canonicalDesignationHash:m.canonicalDesignationHash,archiveCommitment:m.archiveCommitment,licenseHash:m.licenseHash,
    paintingTokenId:BigInt(m.paintingTokenId),frameTokenId:BigInt(m.frameTokenId),designatedBearer:m.designatedBearer,
    nonce:BigInt(m.nonce),deadline:BigInt(m.deadline)} as CompleteAcceptance;
  completeTypedData(message);
  if(typeof value.signature!=='string' || !/^0x[0-9a-f]{130}$/i.test(value.signature))throw new Error('Artist signature is missing or malformed');
  return {message,signature:value.signature};
}

async function checkWallet(provider:PurchaseProvider,buyer:Address) {
  const chain=await provider.request({method:'eth_chainId'});
  const normalizedChain = typeof chain === 'string' && /^0x/i.test(chain) ? parseInt(chain, 16) : Number(chain);
  if(normalizedChain !== 8453 && chain !== '0x2105') throw new Error('Select Base in your wallet');
  const accounts=await provider.request({method:'eth_accounts'});
  if(!Array.isArray(accounts) || String(accounts[0]).toLowerCase()!==buyer.toLowerCase())throw new Error('This authorization belongs to a different wallet');
}

export async function prepareCompletePurchase(provider:PurchaseProvider,authorization:PurchaseAuthorization) {
  const m={...authorization.message}, signature=authorization.signature;
  await checkWallet(provider,m.designatedBearer);
  const client=createPublicClient({transport:custom(provider)});
  const block=await client.getBlock();
  const options={address:COMPLETE_CONTRACT,abi:readAbi,blockNumber:block.number} as const;
  const [artist,designation,license,nonce,paintingOwner,packageId,mintStart,price,digest]=await Promise.all([
    client.readContract({...options,functionName:'artistSigner'}),client.readContract({...options,functionName:'canonicalDesignationHash'}),
    client.readContract({...options,functionName:'completeLicenseHash'}),client.readContract({...options,functionName:'nonces',args:[m.designatedBearer]}),
    client.readContract({...options,functionName:'ownerOf',args:[0n]}),client.readContract({...options,functionName:'completePackageTokenId'}),
    client.readContract({...options,functionName:'mintStart'}),client.readContract({...options,functionName:'COMPLETE_PACKAGE_PRICE'}),
    client.readContract({...options,functionName:'hashCompletePackageAcceptance',args:[m.canonicalDesignationHash,m.archiveCommitment,m.licenseHash,0n,5n,m.designatedBearer,m.nonce,m.deadline]}),
  ]);
  assertAcquisitionState(m,{artist,designation,license,nonce,paintingOwner,packageId,mintStart,timestamp:block.timestamp,digest});
  if(price!==COMPLETE_PRICE)throw new Error('Contract price does not match');
  await verifyCompleteAuthorization(m,signature,artist);
  const transaction=completeTransaction(m,signature);
  await client.call({account:m.designatedBearer,to:transaction.to,data:transaction.data,value:transaction.value});
  await checkWallet(provider,m.designatedBearer);
  return {transaction,authorization:{message:m,signature},checkedAtBlock:block.number};
}

// This is the single audited transaction boundary. Calling code must use a
// rehearsal provider until Owner explicitly opens the production-sign/GO phases.
export async function executeCompletePurchase(provider:PurchaseProvider,authorization:PurchaseAuthorization,onHash:(hash:Hex)=>void) {
  const prepared=await prepareCompletePurchase(provider,authorization);
  const tx=prepared.transaction;
  const hash=await provider.request({method:'eth_sendTransaction',params:[{from:tx.from,to:tx.to,data:tx.data,value:`0x${tx.value.toString(16)}`} ]});
  if(typeof hash!=='string' || !/^0x[0-9a-f]{64}$/i.test(hash))throw new Error('Wallet did not return a transaction hash');
  onHash(hash as Hex);
  const client=createPublicClient({transport:custom(provider)});
  const receipt=await client.waitForTransactionReceipt({hash:hash as Hex,timeout:120000});
  if(receipt.status!=='success')throw new Error('The acquisition transaction reverted');
  // Receipt success plus state at that block, not a local UI flag.
  const options={address:COMPLETE_CONTRACT,abi:readAbi,blockNumber:receipt.blockNumber} as const;
  const [owner0,owner5,root]=await Promise.all([client.readContract({...options,functionName:'ownerOf',args:[0n]}),
    client.readContract({...options,functionName:'ownerOf',args:[5n]}),client.readContract({...options,functionName:'designatedArchiveCommitment'})]);
  if(owner0.toLowerCase()!==tx.from.toLowerCase() || owner5.toLowerCase()!==tx.from.toLowerCase()
    || root.toLowerCase()!==authorization.message.archiveCommitment.toLowerCase())throw new Error('Receipt needs manual ownership review');
  return receipt;
}
