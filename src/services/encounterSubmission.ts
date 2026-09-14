export async function submitEncounterRequest(input: {
  address:string; contributions:string[];
  provider:{request(args:{method:string}):Promise<unknown>};
  fetcher?:typeof fetch;
}) {
  const accounts=await input.provider.request({method:'eth_accounts'});
  if(!Array.isArray(accounts) || typeof accounts[0]!=='string' || accounts[0].toLowerCase()!==input.address.toLowerCase()) {
    throw new Error('Your selected wallet changed. Review the address and submit again.');
  }
  if(input.contributions.length!==3 || input.contributions.some(v=>!v.trim() || v.length>4000)) {
    throw new Error('Enter three contributions, each no longer than 4000 characters.');
  }
  const response=await (input.fetcher??fetch)('/api/encounter-request',{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({action:'submit',walletAddress:input.address,contributions:[...input.contributions]})});
  if(!response.ok)throw new Error('Submission is currently unavailable. Your text has been kept; please try again.');
  let result: {requestId?: unknown; status?: unknown};
  try {
    result = await response.json();
  } catch {
    throw new Error('Submission response was invalid. Your text has been kept; please try again.');
  }
  if(result.status!=='PENDING_ARTIST_REVIEW' || typeof result.requestId!=='string')throw new Error('The submission was not acknowledged.');
  return result as {requestId:string;status:'PENDING_ARTIST_REVIEW'};
}
