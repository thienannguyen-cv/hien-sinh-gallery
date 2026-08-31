# Hiện Sinh — gallery security operations

Canonical project policy is [`../docs/security_operations.md`](../docs/security_operations.md).
This runbook cannot weaken that policy. Neither document is emitted by Vite or
included in a buyer package.

## 1. Active authority boundaries

- Canonical Solidity source: `../contract/src/HienSinh.sol`.
- Generated contract projections: `npm.cmd --prefix ../contract run abi`.
- Browser build: presentation only. It contains no wallet, ownership, mint,
  accession, invitation-verification, or transaction adapter.
- Browser Curator transport: unavailable in this release. The legacy public
  model relay is retained only in operator history and must not be deployed.
- Local presentation environment: signed startup verification plus an explicit
  loopback `?role=` are both required. It is removed from production builds,
  renders no badge, and has no authority over assets or transactions.
- Archive transmission: separate server-only protocol backed by canonical
  contract state. It cannot mint, transfer, designate, or change a license.

No credential or state may cross these boundaries by implication.

## 2. Public build environment

Production browser builds accept no security, wallet, archive, contract or
review configuration through `VITE_*`. Retired `VITE_EXPERIENCE_REVIEW_*`
variables make a production build fail. Never place a Supabase key, API key,
wallet key, mnemonic, contract authority, or service-role credential in a
Vite variable.

## 3. Archive database and storage

Use a dedicated Supabase project. Apply migrations `01`, `02`, and `03` in
order. Migration `03_archive_security_lockdown.sql` deliberately aborts if an
unrelated bucket exists; it removes all prior policies on the archive tables and
`storage.objects`, revokes browser roles, forces RLS, and pins
`stewardship-private-archive` to `public=false`.

Do not weaken this by adding an `anon` or `authenticated` policy. The Edge
Function alone uses the service-role credential.

## 4. Archive runtime configuration

Configure server-side secrets only:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
BASE_RPC_URL_PRIMARY
BASE_RPC_URL_SECONDARY
HIEN_SINH_CONTRACT_ADDRESS
HIEN_SINH_CONTRACT_CODE_HASH
HIEN_SINH_CANONICAL_DESIGNATION_HASH
ALLOWED_ARCHIVE_ORIGINS=https://gallery.example
```

The two HTTPS RPC endpoints must be independent and must not be identical. The
contract address, runtime code hash, and designation hash come from the signed,
verified deployment record—not from UI configuration.

## 5. Archive transmission protocol

1. The client creates a 32-byte base64url nonce and signs the exact
   challenge-request message, proving wallet control before server state is
   allocated.
2. The server checks owner/Complete state at one common finalized Base block
   observed identically by both RPC providers.
3. Both providers must agree on block hash, runtime code hash, owner, Complete
   token, relationship state, designation hash, and archive commitment.
4. The signed request nonce becomes the one-time challenge; its database
   primary key prevents replay.
5. The collector signs the server-issued origin/chain/contract-bound message.
6. The server repeats the dual-provider finalized-state check, verifies the
   private asset record against the on-chain archive commitment, and atomically
   consumes the challenge.
7. A private-storage URL is issued for at most 60 seconds. The audit record
   includes the finalized authorization block number and hash.
8. Downloaded bytes must be hash-verified before canonical use.

Authorization means “owner at the recorded finalized block.” It is not lived
stewardship and is not an assertion about unfinalized transfers.

## 6. Financial integration gate

There is currently no active financial adapter. Adding one is a new security
boundary, not a UI flag. It may be introduced only after a canonical deployment
record exists and must:

- obtain chain, address, code identity, ABI and current values from canonical
  evidence;
- simulate immediately before sending;
- show wallet-native chain, contract, function and exact ETH value;
- reject wrong network/address/value/signer/nonce/deadline/replay;
- verify receipt status, contract address and expected event;
- never infer archive delivery from a transaction receipt.

Fake timeouts, mock callbacks and browser role flags are forbidden transaction
implementations. Local role presentation is permitted only because it cannot invoke
a transaction or reach archive bytes.

## 7. Required local checks

```powershell
npm.cmd --prefix ../contract run abi
npm.cmd --prefix ../contract run verify:interface
npm.cmd run security:test
npm.cmd run lint
npm.cmd run build
```

`build` recompiles the canonical contract, verifies build-info/source binding,
compares every generated projection byte-for-byte, rejects forbidden active
financial/fallback markers, and scans the final artifact. Supabase/Deno checks,
database migration rehearsal, independent RPC testing and end-to-end archive
tests remain separate external gates.
