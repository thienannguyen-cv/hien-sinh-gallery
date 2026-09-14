import test from 'node:test';
import assert from 'node:assert/strict';
import { createTransmissionService } from '../../supabase/functions/_shared/transmission-service.ts';
const a='0x1111111111111111111111111111111111111111';
const b='0x2222222222222222222222222222222222222222';
const root=`0x${'c'.repeat(64)}`;
const zero=`0x${'0'.repeat(64)}`;
function fixture({owners=new Map([[0,a],[6,a],[5,b]]),prePrimary=false,archive=root,assetRoot=root,published=root,wrongAsset=false}={}) {
  let count=0;const reads=[];
  const service=createTransmissionService({
    now:()=>new Date('2026-09-09T00:00:00.000Z'),
    readOnChainAccess:async tokenId=>{reads.push(tokenId);return{
      owner:owners.get(tokenId)??b,completePackageId:5,completePackageTokenId:prePrimary?0:5,
      canonicalDesignationHash:`0x${'d'.repeat(64)}`,archiveCommitment:archive,
      authorizationBlockNumber:'1',authorizationBlockHash:`0x${'e'.repeat(64)}`};},
    getAsset:async(tokenId,assetType)=>({tokenId:wrongAsset?9:tokenId,assetType,
      assetHash:'f'.repeat(64),archiveCommitment:assetRoot,filePath:'synthetic/item.bin'}),
    createSignedUrl:async()=>{count++;return'https://storage.example/synthetic';},
    writeAuditLog:async()=>{},
    hasAcquisitionAuthorization:async(addr)=>addr.toLowerCase()===a.toLowerCase(),
  },{origin:'https://gallery.example',chainId:8453,contractAddress:b,publishedArchiveCommitment:published});
  return{service,reads,count:()=>count};
}
async function request(f,address,tokenId,assetType){
  return f.service.transmit({address,tokenId,assetType});
}
test('Artist0+6 can retrieve Painting and Frame06 before primary with zero on-chain archive lock',async()=>{
  const f=fixture({prePrimary:true,archive:zero});
  assert.equal((await request(f,a,0,'H_CORE')).status,'TRANSMISSION_GRANTED');
  assert.equal((await request(f,a,6,'H_FRAME_PACKAGE')).status,'TRANSMISSION_GRANTED');
  assert.deepEqual(f.reads,[0,6]);
});
test('Frame05-only gets its Frame package but cannot request Painting through5 or0',async()=>{
  const f=fixture();
  assert.equal((await request(f,b,5,'H_FRAME_PACKAGE')).status,'TRANSMISSION_GRANTED');
  await assert.rejects(request(f,b,5,'H_CORE'),e=>e.code==='ASSET_TOKEN_MISMATCH');
  await assert.rejects(request(f,b,0,'H_CORE'),e=>e.code==='NOT_CURRENT_OWNER');
  assert.equal(f.count(),1);
});
test('Painting-only holder gets Painting core/scar and not Frame practice',async()=>{
  const f=fixture({owners:new Map([[0,a],[1,b],[5,b],[6,b]])});
  assert.equal((await request(f,a,0,'H_CORE')).status,'TRANSMISSION_GRANTED');
  assert.equal((await request(f,a,0,'H_CONSTITUTIVE_SCAR')).status,'TRANSMISSION_GRANTED');
  assert.equal((await request(f,a,0,'H_PAINTING_PACKAGE')).status,'TRANSMISSION_GRANTED');
  await assert.rejects(request(f,a,0,'H_FRAME_PACKAGE'),e=>e.code==='ASSET_TOKEN_MISMATCH');
  await assert.rejects(request(f,a,1,'H_FRAME_PACKAGE'),e=>e.code==='NOT_CURRENT_OWNER');
});
test('published and object hash prefixes normalize without changing the commitment',async()=>{
  const f=fixture({published:root.slice(2),assetRoot:root.toUpperCase().replace('0X','0x')});
  assert.equal((await request(f,a,0,'H_PAINTING_PACKAGE')).status,'TRANSMISSION_GRANTED');
});
test('transfer removes former owner access',async()=>{
  const owners=new Map([[0,a]]);const f=fixture({owners});
  assert.equal((await request(f,a,0,'H_CORE')).status,'TRANSMISSION_GRANTED');
  owners.set(0,b);
  await assert.rejects(request(f,a,0,'H_CORE'),e=>e.code==='NOT_CURRENT_OWNER');
});
test('all9 Frame IDs use their own holder; genesis and standalone Frames also work before primary',async()=>{
  for(let i=1;i<=9;i++){
    // Frame05 is only minted at primary; the other Frames do not depend on it.
    const f=fixture({owners:new Map([[i,a]]),prePrimary:i!==5,archive:i===5?root:zero});
    assert.equal((await request(f,a,i,'H_FRAME_PACKAGE')).status,'TRANSMISSION_GRANTED');
  }
});
test('unreviewed RITUAL mapping and out-of-range tokens fail closed',async()=>{
  for(const id of[0,5])await assert.rejects(request(fixture(),a,id,'H_CONSTITUTIVE_RITUAL'),e=>e.code==='ASSET_MAPPING_REVIEW_REQUIRED');
  for(const id of[-1,10])await assert.rejects(request(fixture(),a,id,'H_CORE'),e=>e.code==='INVALID_TOKEN');
});
test('missing published anchor, mismatched chain/object root, zero or wrong object cannot issue URL',async()=>{
  for(const options of[{published:zero},{archive:zero},{archive:`0x${'b'.repeat(64)}`},
    {assetRoot:`0x${'b'.repeat(64)}`},{assetRoot:zero},{wrongAsset:true}]){
    const f=fixture(options);await assert.rejects(request(f,a,0,'H_CORE'));assert.equal(f.count(),0);
  }
});
