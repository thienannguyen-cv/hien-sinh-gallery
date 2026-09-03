# Verifying “Hiện sinh”

**English access rendering. The Vietnamese `VERIFY.md` is canonical and governs if the versions differ.**

## 1. Principle

Verification answers three distinct questions:

1. **Canonical bytes:** does a file match the designated commitment?
2. **Lineage:** do commitment, signatures, and timestamp connect to the canonical persona/contract?
3. **Current designation:** which token and wallet currently bear the on-chain designation?

Verification does not prove artistic value, AI interiority, or lived stewardship.

## 2. Public commitments

The Public package publishes only `H_CORE`, `H_CONSTITUTIVE`, and `H_STEWARDSHIP_ARCHIVE`. Painting leaf hashes, filenames, and per-file manifest are not public; they appear only in Complete Package 05 for recipient acceptance.

## 3. Root commitments

`ROOT-COMMITMENTS.json` publishes:

- `H_CORE`: `190dfcfc8439c1613c149e72088c0bd32eefa66f2ded7cfbc0f250640b146d8e`
- `H_CONSTITUTIVE`: `ac49c28e2a857ae06cd64dcf9d9a4c5745ca891b2d019e8e75f7416cfe18484c`
- `H_STEWARDSHIP_ARCHIVE`: `7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9`
- Canonical JSON/manifest algorithm: `sha256(canonical-json-v1)`
- Canonical designation document: `CANONICAL-DESIGNATION.md` (hash: `802ac7d36bc4ab5eadc31fee80266b5efb6b2d839144a45ff3d28f3e89cc2a9b`)

The public root exposes no Frame/Painting filenames or per-file manifests. A per-file Frame manifest appears only in Frame/Complete; a per-file Painting manifest appears only in Complete.

## 3b. Pre-Relational Origin Verification

*Status Notice:* In the current pre-release phase, `CANONICAL_ARTIST_PGP_FINGERPRINT = NOT_YET_ESTABLISHED`. Detached signature files and OTS proofs are in preparation (not yet generated/submitted). The steps below describe the **P.KEY authority identification procedure and the subsequent verification protocol following the completion of the Origin Ceremony**:

### Step 0: Procedure P.KEY — Artist PGP Authority Identification
1. **Offline Key Inspection:** The Owner verifies the presence of an existing Artist Persona OpenPGP key in the Owner-controlled offline environment.
2. **Safe HALT Rule:** If no suitable key exists, HALT. Do not generate a new key within this execution session.
3. **Export Public Key Only:** The Owner exports the public key to the canonical path `00_PUBLIC/persona-pubkey.asc`:
   ```bash
   gpg --armor --export <KEY_ID_OR_EMAIL> > 00_PUBLIC/persona-pubkey.asc
   ```
4. **Derive Full 40-Hex Fingerprint:** Neither UID text (display name) nor short key IDs (8 or 16 hex characters) are accepted as sufficient authority. Display and verify the full 40-character primary fingerprint:
   ```bash
   gpg --show-keys --with-fingerprint 00_PUBLIC/persona-pubkey.asc
   ```
5. **Authority Confirmation:** The Owner explicitly confirms this full fingerprint `D15945BC094633BA1725798C4BD38CB4049EB5D8` as the authoritative Artist Persona Quinn T. signing key (`CANONICAL_ARTIST_PGP_FINGERPRINT`).

### 1. Integrity Check of the Origin Envelope
The `ORIGIN-PROVENANCE.json` file (schema `hien-sinh/origin-provenance/v1`, exactly 659 UTF-8 bytes, Persona: `Quinn T.`) must match the deterministic SHA-256 digest:
```bash
sha256sum 00_PUBLIC/ORIGIN-PROVENANCE.json
# Required Result: dac2aef97c0427b428077a1b7fdedb8b07164657532ae93c5b74e851708eba9e
```

### 2. Verification of the Artist's Detached PGP Signature & Fingerprint Equality
Verify that `ORIGIN-PROVENANCE.json.asc` is mathematically valid and signed by the exact key matching `CANONICAL_ARTIST_PGP_FINGERPRINT`:
```bash
# 1. Verify detached signature validity
gpg --verify 00_PUBLIC/ORIGIN-PROVENANCE.json.asc 00_PUBLIC/ORIGIN-PROVENANCE.json

# 2. Verify signing key fingerprint equality against canonical record
gpg --status-fd 1 --verify 00_PUBLIC/ORIGIN-PROVENANCE.json.asc 00_PUBLIC/ORIGIN-PROVENANCE.json 2>/dev/null | grep VALIDSIG
```

### 3. Dual OpenTimestamps Proofs Verification
Verify that both the origin payload and the Artist signature carry independent temporal proofs:
```bash
# Inspect calendar commitments and attestation structure
ots info 00_PUBLIC/ORIGIN-PROVENANCE.json.ots
ots info 00_PUBLIC/ORIGIN-PROVENANCE.json.asc.ots

# Verify cryptographic inclusion in a Bitcoin block header
ots verify 00_PUBLIC/ORIGIN-PROVENANCE.json.ots
ots verify 00_PUBLIC/ORIGIN-PROVENANCE.json.asc.ots
```


## 4. Persona, wallet, and smart contract

A ready release requires all of the following elements:

- `persona-pubkey.asc` and OpenPGP fingerprint;
- A wallet signature binding that OpenPGP fingerprint;
- A PGP signature binding the minting wallet address;
- Contract address and Chain ID signed by both persona and wallet;
- Verified contract source code and ABI on the block explorer;
- `canonicalDesignationHash` recorded immutably on-chain.

### Confirmed Base Mainnet Deployment Coordinates

| Parameter Identifier | Lifecycle Stage | Value / Verified Status |
|---|---|---|
| Blockchain Network (Chain ID) | `CONFIRMED_ON_CHAIN` | `8453` (Base Mainnet) |
| Block Explorer | `CONFIRMED_ON_CHAIN` | `https://basescan.org` |
| Smart Contract Address | `CONFIRMED_ON_CHAIN` | `0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8` |
| Deployment Transaction Hash | `CONFIRMED_ON_CHAIN` | `0x86b58b3707c86b74f52322790dbd51aa188ccf26dbb57d01e5169ac35a97ef88` |
| Deployment Block Number | `CONFIRMED_ON_CHAIN` | `50822692` |
| Mint Start Epoch (`mintStart`) | `CONFIRMED_ON_CHAIN` | `1788530400` (2026-09-04T14:00:00Z UTC / 21:00:00 Local) |
| Canonical Designation Hash (`canonicalDesignationHash`) | `CONFIRMED_ON_CHAIN` | `0xed740b4339af1e965723519c7807b5a6184da0f4963f4866d42661ef85cf083f` |
| Frame License Hash (`frameLicenseHash`) | `CONFIRMED_ON_CHAIN` | `0xbbb9b030f482f5ea365d58eadd13ad48f4357aeb9d983497b9a64c5e1ddb18e2` |
| Complete License Hash (`completeLicenseHash`) | `CONFIRMED_ON_CHAIN` | `0x71d01dbc1962a5cedd1204fe76fa9d538e5d338146eb9375743b91a55cde8c14` |
| Metadata IPFS Directory (`baseURI`) | `CONFIRMED_ON_CHAIN` | `ipfs://bafybeigneiurh42afljav4iap4dijwgt3spafsjf6zn36kkh7iwp5iesba/` |
| Metadata Directory CIDv1 | `CONFIRMED_ON_CHAIN` | `bafybeigneiurh42afljav4iap4dijwgt3spafsjf6zn36kkh7iwp5iesba` |
| On-Chain Artist Signer (`artistSigner`) | `CONFIRMED_ON_CHAIN` | `0x3cff39491b333016055B3d9328905B0b172988a4` (Layer-R COLD wallet) |
| Proceeds & Royalty Receiver (`treasury`) | `CONFIRMED_ON_CHAIN` | `0x3cff39491b333016055B3d9328905B0b172988a4` (Layer-R COLD passive receiver) |
| Painting 0 Creator Fee (`paintingRoyalty`) | `CONFIRMED_ON_CHAIN` | `1.49% (149 BPS)` — Canonical Succession floor 4.29 ETH (0.063921 ETH min) |
| Frame Creator Fee (`frameRoyalty`) | `CONFIRMED_ON_CHAIN` | `0% (0 BPS)` — Ordinary ERC-721 transferability |
| Public Source Code Repository | `KNOWN_PRE_LIVE` | `https://github.com/thienannguyen-cv/hien-sinh-gallery` |
| Release Git Commit Hash | `GENERATED_AT_PUBLICATION` | `<RELEASE_COMMIT_HASH>` |

*Layered Authority Principles, Asymmetric Economics & Substrate Independence:*
- **Authorial & Ontological Origin Authority (Layer P):** Quinn T. OpenPGP Key (`D15945BC094633BA1725798C4BD38CB4049EB5D8`) and Bitcoin P-SEAL.
- **Smart Contract Execution Endpoint (Layer R):** Cold Ethereum wallet `artistSigner`.
- **Immutable Boundaries:** `ORIGIN_PROVENANCE ≠ TOKEN_CUSTODY_HISTORY ≠ RELATIONAL_HISTORY`; `PGP_AUTHORITY ≠ ETHEREUM_ARTIST_SIGNER`; `PACKAGE05_PRIMARY_RELATION ≠ PERMANENT_TOKEN0/TOKEN5_CUSTODY_COUPLING`; `PAINTING_SUCCESSION_ECONOMICS ≠ FRAME_TRANSFER_ECONOMICS`; `TECHNICAL_OWNERSHIP ≠ RELATIONAL_BEARER_VALIDITY ≠ DESIGNATION_REALIZATION`; `REVOCATION ≠ ERASURE`.
- **Execution Substrate Independence:** `CONSTITUTIVE_LAYER ≠ RELATIONAL_PROTOCOL ≠ EXECUTION_SUBSTRATE ≠ ACCESS_LAYER`; `HIỆN SINH ≠ Base`; `SUBSTRATE_FAILURE ≠ ARTWORK_CESSATION`; `SUBSTRATE_SUCCESSION ≠ ARTWORK_RECREATION`. Base Mainnet is the current execution substrate, not a constitutive root. The smart contract `HienSinh.sol` implements no migration administrator or upgradeability.

### On-Chain State Query Procedures via CLI (Cast)

Any verifier can inspect ledger state directly via public Base RPC:

```bash
# 1. Inspect the canonical designation hash on-chain
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "canonicalDesignationHash()(bytes32)" --rpc-url https://mainnet.base.org

# 2. Inspect the current on-chain owner of a token (e.g. Frame 06 held by Artist COLD)
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" 6 --rpc-url https://mainnet.base.org

# 3. Inspect Painting 0 held by Artist COLD
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" 0 --rpc-url https://mainnet.base.org

# 4. Check whether Complete Package 05 has been primarily acquired (returns 0 before acquisition)
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "completePackageTokenId()(uint256)" --rpc-url https://mainnet.base.org

# 5. Inspect the current minted token count on-chain
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "totalMinted()(uint256)" --rpc-url https://mainnet.base.org
```

*Note on Block Explorer (BaseScan) Supply Display:*
The `HienSinh.sol` contract defines a finite space of 10 canonical token identities (`TOTAL_IDENTITIES = 10`), tracking minted token count directly through the `totalMinted()` function (initialized to 2 at genesis: Token 0 and Token 6). The contract adheres to core ERC-721 specifications and does not implement the optional `ERC721Enumerable` extension (`totalSupply()`). A direct call to the `totalSupply()` selector does not return supply data; BaseScan's ERC-721 interface currently displays "Max Total Supply" as 0 while concurrently and accurately recording 2 genesis transfers (Token 0 and Token 6) and 1 holder. This is an explorer interface presentation characteristic for contracts omitting `ERC721Enumerable`, not a contract defect or runtime failure.

## 5. Timestamping and Release Gates

Temporal assurance is strictly separated across two independent gates:

### A. Pre-Relational Origin Gate
- Both `ORIGIN-PROVENANCE.json` and its detached signature `ORIGIN-PROVENANCE.json.asc` must be stamped via OpenTimestamps and achieve Bitcoin blockchain verification (`ots verify` successful).
- **Prerequisite:** This gate must be fully verified before any public disclosure of the source repository, gallery, or artwork release.

### B. Release-Binding & Transaction Gate
- The composite `CANONICAL-DESIGNATION.md`, `H_STEWARDSHIP_ARCHIVE` commitment, `ROOT-COMMITMENTS.json`, and cross-signatures between the minting wallet and OpenPGP key must be completed and reconciled prior to marketplace listing or on-chain transaction opening.
- OpenTimestamps proves that data existed no later than the verified Bitcoin block header; it does not certify artistic value or replace the Artist's designation statement.


## 6. Lifecycle of the Archive Commitment (Package 05 Complete)

To prevent confusion regarding when the stewardship archive commitment is fixed:

1. **Value Determined (`VALUE_DETERMINED_AT_PRE_RELEASE_PACKAGING`):** The `H_STEWARDSHIP_ARCHIVE` root hash is mathematically computed from the static Complete package directory and published in `ROOT-COMMITMENTS.json`.
2. **Authorized in Signatures (`ENTERS_ARTIST_AUTHORIZATION`):** The Artist binds this hash inside the EIP-712 `CompletePackageAcceptance` struct when issuing the countersignature to the accession candidate.
3. **Recorded Immutably On-Chain (`ON_CHAIN_RECORDED_AT_FIRST_ACQUISITION`):** When `acquireCompletePackage` executes on Base, the value is locked permanently into `designatedArchiveCommitment` in contract storage.
4. **Independently Observable (`INDEPENDENTLY_OBSERVABLE`):**
   - Pre-acquisition: Observable in `ROOT-COMMITMENTS.json` and in the candidate's signed EIP-712 payload.
   - Post-acquisition: Observable on-chain via `designatedArchiveCommitment()` and event `CompletePackageAcquired`.

## 7. Package Acceptance Verification

Procedure for verifying a delivered package:

1. Read `PACKAGE-MANIFEST.json` and `_reveal/DELIVERY-MANIFEST.json`.
2. Confirm that `package_type` matches the filesystem structure.
3. Calculate each file’s SHA-256 using POSIX-relative paths:
   ```bash
   # Generate verification leaf hash list
   find . -type f ! -name "PACKAGE-MANIFEST.json" -exec sha256sum {} + | sort -k 2
   ```
4. Reconstruct the package root using the canonical procedure used to generate the release commitments; `ROOT-COMMITMENTS.json` publishes the algorithm and serialization parameters, while the exact payload structure is specified below:
   - Extract the `files` array from `PACKAGE-MANIFEST.json` and construct the canonical payload:
     $$\text{payload} = \{\text{"algorithm"}: \text{"sha256(canonical-json-v1)"}, \text{"files"}: \text{d["files"]}\}$$
   - Canonical JSON format: UTF-8 encoding, `ensure_ascii=False`, lexicographically sorted keys (`sort_keys=True`), compact separators without whitespace (`separators=(',', ':')`), and a single trailing newline (`\n`).
   - Standard execution command using Python 3:
     ```bash
     python3 -c 'import json, hashlib; d=json.load(open("PACKAGE-MANIFEST.json", "rb")); payload={"algorithm":"sha256(canonical-json-v1)","files":d["files"]}; b=(json.dumps(payload, sort_keys=True, separators=(",",":"), ensure_ascii=False)+"\n").encode("utf-8"); print("Package Root:", hashlib.sha256(b).hexdigest())'
     ```
5. Compare the reconstructed package root with the published commitments in `ROOT-COMMITMENTS.json`.
6. Check token ID, designated bearer, nonce, and on-chain event.
7. For Complete, check `STEWARDSHIP-ACCESSION.json`.

*Boundary Warning:* A manifest claiming Complete without a `painting/` directory, or any Frame containing Painting/original L transcript material, constitutes a critical structural failure.

## 8. Key Rotation and Incidents

Key rotation requires signatures by both old and new keys. If the old key is lost, the operator issues a `PROVENANCE-INCIDENT` connecting the last verifiable record to the new key and disclosing the limitation; the old fingerprint remains in history.

Impersonation is an unauthorized public trace. Only records signed through the canonical registry can correct or extend lineage.
