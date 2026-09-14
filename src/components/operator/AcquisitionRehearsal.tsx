import { useState } from 'react';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { completeDigest, completeTransaction, completeWalletPayload, type CompleteAcceptance } from '../../services/completePackageProtocol';
import { rehearseArtistAuthorization } from '../../services/artistCompleteSigning';

// DEV-only operator view: synthetic state/wallets; no injected wallet or broadcast.
export function AcquisitionRehearsal() {
  const [fixture] = useState(() => {
    const artist = privateKeyToAccount(generatePrivateKey()), buyer = privateKeyToAccount(generatePrivateKey());
    const now = BigInt(Math.floor(Date.now()/1000));
    const message: CompleteAcceptance = {canonicalDesignationHash:`0x${'11'.repeat(32)}`,archiveCommitment:`0x${'22'.repeat(32)}`,
      licenseHash:`0x${'33'.repeat(32)}`,paintingTokenId:0n,frameTokenId:5n,designatedBearer:buyer.address,nonce:0n,deadline:now+3600n};
    return {artist,buyer,message,now};
  });
  const [signed,setSigned] = useState<Awaited<ReturnType<typeof rehearseArtistAuthorization>> | null>(null);
  const [notice,setNotice] = useState('Ready with temporary test wallets.');
  const [busy,setBusy] = useState(false);
  const [transaction,setTransaction] = useState('');
  async function sign() {
    setBusy(true); setSigned(null); setTransaction('');
    try {
      const approval = await rehearseArtistAuthorization({message:fixture.message,
        readState:async m=>({artist:fixture.artist.address,designation:m.canonicalDesignationHash,license:m.licenseHash,
          nonce:0n,paintingOwner:fixture.artist.address,packageId:0n,mintStart:fixture.now-1n,
          timestamp:BigInt(Math.floor(Date.now()/1000)),digest:completeDigest(m)}),
        wallet:{request:async ({method,params})=>{
          if(method==='eth_accounts') return [fixture.artist.address];
          if(method==='eth_chainId') return '0x2105';
          if(method!=='eth_signTypedData_v4' || !params) throw new Error('Only test typed-data signing is available');
          return fixture.artist.signTypedData(JSON.parse(String(params[1])));
        }},
      });
      setSigned(approval); setNotice('Test authorization verified. Inspect the buyer transaction next.');
    } catch(error) {setNotice(error instanceof Error ? error.message : 'Rehearsal failed');}
    finally {setBusy(false);}
  }
  return <main style={{height:'100dvh',overflowY:'auto',background:'#101214',color:'#ece8df',padding:'clamp(20px,5vw,64px)',fontFamily:'sans-serif'}}>
    <div style={{maxWidth:850,margin:'0 auto',lineHeight:1.7,overflowWrap:'anywhere'}}>
      <p>LOCAL ACQUISITION REHEARSAL · TEST WALLETS ONLY</p>
      <h1>Package 05 signing and buyer verification</h1>
      <p>This demonstrates signing capability after Artist approval. It does not record a real Three Brushstrokes CONFIRM,
        reserve Package 05 or submit a transaction. These temporary wallets and commitments have no production authority.</p>
      <p>Test Artist: {fixture.artist.address}<br/>Test buyer: {fixture.buyer.address}<br/>Painting 0 + Frame 5 · transaction value 4.29 ETH</p>
      <details><summary>Inspect exact typed data</summary><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(JSON.parse(completeWalletPayload(fixture.message)),null,2)}</pre></details>
      <button type="button" disabled={busy} onClick={()=>void sign()} style={{padding:14,margin:'20px 12px 20px 0'}}>SIGN WITH TEMPORARY TEST ARTIST</button>
      <button type="button" disabled={!signed || busy} style={{padding:14}} onClick={()=>{
        if(signed) {setTransaction(JSON.stringify(completeTransaction(signed.message,signed.signature),(_k,v)=>typeof v==='bigint'?v.toString():v,2));setNotice('Buyer transaction prepared. Nothing was broadcast.');}
      }}>PREPARE BUYER TRANSACTION</button>
      <p role="status" aria-live="polite">{notice}</p>
      {signed && <p>Verified digest: {signed.digest}</p>}
      {transaction && <pre aria-label="Prepared buyer transaction" style={{whiteSpace:'pre-wrap',background:'#1b1e20',padding:16}}>{transaction}</pre>}
      <p><a href="/operator/three-brushstrokes/review" style={{color:'#d9bf8b'}}>Return to local Artist review</a></p>
    </div>
  </main>;
}
