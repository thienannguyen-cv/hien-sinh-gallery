# Independent Operation and Direct Interaction — "Hiện sinh"

**English access rendering. The Vietnamese `INDEPENDENT-OPERATION.md` is canonical and governs if the versions differ.**

## 1. Nature and Boundaries of Independent Operation

This guide provides technical instructions for visitors, practitioners, and collectors who wish to independently run the gallery interface, operate a private Curator instance using personal compute/credentials, or interact directly with the smart contract on Base without using the hosted website at `https://smapworks.art/gallery`.

### Invariant Canonical Boundaries:

1. **Exhibition Surface Reproducibility (`EXHIBITION_SURFACE_REPRODUCIBLE = YES`):** The static client source code is fully open and can be independently built and served in any local environment.
2. **Curator Semantics Reproducibility (`CURATOR_SEMANTICS_REPRODUCIBLE = YES`):** Public Curator prompt contexts are public in the repository with verified SHA-256 hashes; Frame Curator practice substrates and mediation envelopes are delivered as purchaser-held materials with the corresponding package. Both can be loaded into any compatible AI model without relying on gallery servers.
3. **Local vs. Production Security Behavior (`PRODUCTION_SECURITY_BEHAVIOR = QUALIFIED`):** The local dev-adapter is designed for single-user local study and does not enforce production CORS origin boundaries, dual-RPC consensus checks, or tiered cryptographic state-seals implemented in production Edge Functions.
4. **Private Archive Delivery Infrastructure (`PRIVATE_DELIVERY_INFRASTRUCTURE = NO`):** The hosted signed URL issuance service for downloading the Complete archive from private storage belongs to gallery infrastructure; an independent operator who has received the package holds the archive directly on their local drive.
5. **No Conveyance of Canonical Release Authority (`SELF_HOSTABILITY ≠ CANONICAL_RELEASE_AUTHORITY`):** The ability to run the interface or local Curator does not confer authority to mint canonical tokens, sign on behalf of the Artist, or alter the historical provenance of the artwork on Base (`INDEPENDENT_EXECUTION ≠ INDEPENDENT_CANONICALIZATION`).

---

## 2. Operating the Local Exhibition Surface

### Prerequisites:
- Node.js version 20 or higher;
- `npm` package manager.

### Execution Procedure:
```bash
# 1. Clone the public repository
git clone https://github.com/thienannguyen-cv/hien-sinh-gallery.git
cd hien-sinh-gallery

# 2. Install dependencies
npm install

# 3. Verify contract interface projection and production security checks
npm run security:test

# 4. Build static distribution bundle
npm run build

# 5. Launch local preview server (serves on http://localhost:4173)
npm run preview
```

---

## 3. Operating the Local Curator Adapter

Users can run private Curator dialogues using their own Gemini API key without transmitting dialogue text to gallery servers.

### Execution Procedure:
1. Create a `.env.development.local` file in the project root:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
2. Start the local mediation adapter:
   ```bash
   node dev-adapter.mjs
   ```
3. Start the development UI server:
   ```bash
   npm run dev
   ```
The application at `http://localhost:5173` will automatically route `/api/curator-interaction` queries to the local adapter (port `3001`). Dialogue text is transmitted directly from your machine to the model provider (Gemini API) using canonical, hash-verified prompt contexts.

### Purchaser-Held Reference Documents

The local Curator may consult the following operational documents as contextual reference — they do not expand the stable Curator core prompt but serve as independent normative sources:

- `INDEPENDENT-OPERATION.md` / `INDEPENDENT-OPERATION.en.md` — Independent operation and on-chain interaction guide (this document).
- `ACQUISITION-RETRIEVAL.md` — Complete archive retrieval procedure via hosted channel.
- `SUCCESSION-PROCEDURE.md` — Step-by-step succession for each token type.
- `CARE-AND-SUCCESSION.md` — Care, accession, and succession.
- `VERIFY.md` / `VERIFY.en.md` — Contract integrity, commitment, and package verification.
- `SCHEDULE-FRAME.md` / `SCHEDULE-COMPLETE.md` — Legal rights by token type.

Boundary: `OPERATIONAL_DOCUMENT = NORMATIVE_SOURCE` · `LOCAL_CURATOR = CONTEXTUAL_GUIDE` · `CURATOR ≠ TRANSACTION_AUTHORITY`

---

## 4. Direct On-Chain Smart Contract Interaction

Collectors can execute Frame or Complete Package acquisitions directly on Base Mainnet without connecting a wallet to the web interface.

**Contract address (Base Mainnet, Chain ID 8453):**
`0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`

### Cryptographic Safety Warning:
> **NEVER** paste raw private keys into command shells, untrusted scripts, or web forms. Always use hardware signers (Ledger/Trezor), interactive CLI signing (`cast send --interactive`), or verified Block Explorer interfaces (BaseScan Write Contract).

---

### A. Acquiring a Standalone Frame (Frames 01–04, 06–09)

Each standalone Frame has a fixed consideration of **0.081 ETH**. The `mintFrame(uint256 tokenId)` function is publicly open and requires no Artist signature:

```bash
# Using Foundry Cast with interactive secure key / hardware signer
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "mintFrame(uint256)" <TOKEN_ID> \
  --value 0.081ether \
  --rpc-url https://mainnet.base.org \
  --interactive
```
*(Replace `<TOKEN_ID>` with the designated token number `1` through `9`, excluding token `5` (Complete Package) and token `6` (Artist Genesis Frame, already minted at genesis).)*

**Post-transaction verification:**
```bash
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" <TOKEN_ID> \
  --rpc-url https://mainnet.base.org
```

---

### B. Acquiring Complete Package 05 (Package 05)

Package 05 has a fixed consideration of **4.29 ETH** and requires a **valid EIP-712 countersignature from the Artist** (`artistSignature`) bound to your wallet address.

#### B.1 Independent Parameter Discovery

Before requesting the EIP-712 authorization from the Artist, the purchaser can read all fixed parameters directly from the on-chain contract:

```bash
CONTRACT=0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8
RPC=https://mainnet.base.org

# canonicalDesignationHash (bytes32, immutable since deployment)
cast call $CONTRACT "canonicalDesignationHash()(bytes32)" --rpc-url $RPC

# completeLicenseHash (bytes32, immutable since deployment)
cast call $CONTRACT "completeLicenseHash()(bytes32)" --rpc-url $RPC

# Confirm Painting (Token 0) is still held by the Artist (precondition for acquireCompletePackage)
cast call $CONTRACT "ownerOf(uint256)(address)" 0 --rpc-url $RPC

# Read current nonce for your wallet address (used in EIP-712 struct)
cast call $CONTRACT "nonces(address)(uint256)" <YOUR_WALLET_ADDRESS> --rpc-url $RPC

# Confirm Package 05 has not yet been acquired (== 0 means not yet)
cast call $CONTRACT "completePackageTokenId()(uint256)" --rpc-url $RPC
```

On-chain confirmed values (see also `VERIFY.en.md §4`):
- `canonicalDesignationHash`: `0xed740b4339af1e965723519c7807b5a6184da0f4963f4866d42661ef85cf083f`
- `completeLicenseHash`: `0x71d01dbc1962a5cedd1204fe76fa9d538e5d338146eb9375743b91a55cde8c14`
- `frameTokenId` (COMPLETE_PACKAGE_ID): `5`
- `paintingTokenId` (PAINTING_TOKEN_ID): `0`

`archiveCommitment` (`H_STEWARDSHIP_ARCHIVE`): `7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9` — published in `ROOT-COMMITMENTS.json`; the Artist includes this value in the EIP-712 struct when issuing the countersignature.

#### B.2 Independent EIP-712 Signature Verification

Before submitting the transaction, you can independently verify the Artist's EIP-712 signature using the public view function `hashCompletePackageAcceptance()`. Parameter order for the view function: `designationHash, archiveCommitment, licenseHash, paintingTokenId, frameTokenId, designatedBearer, nonce, deadline`.

```bash
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "hashCompletePackageAcceptance(bytes32,bytes32,bytes32,uint256,uint256,address,uint256,uint256)(bytes32)" \
  <CANONICAL_DESIGNATION_HASH> \
  <ARCHIVE_COMMITMENT> \
  <COMPLETE_LICENSE_HASH> \
  0 \
  5 \
  <YOUR_WALLET_ADDRESS> \
  <NONCE> \
  <DEADLINE_TIMESTAMP> \
  --rpc-url https://mainnet.base.org
```

The returned `bytes32` is the EIP-712 struct hash. Verify that the Artist's signature resolves to this hash and that the signing address matches `artistSigner` (`0x3cff39491b333016055B3d9328905B0b172988a4`).

#### B.3 Transaction Execution (8 positional arguments, verified ABI)

The `acquireCompletePackage` function takes exactly **8 positional arguments**. Calling with the wrong argument count will revert at ABI encoding.

```bash
# Execute only after receiving valid EIP-712 authorization from the Artist
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "acquireCompletePackage(bytes32,bytes32,bytes32,uint256,uint256,uint256,uint256,bytes)" \
  <CANONICAL_DESIGNATION_HASH> \
  <DESIGNATED_ARCHIVE_COMMITMENT> \
  <COMPLETE_LICENSE_HASH> \
  0 \
  5 \
  <DEADLINE_TIMESTAMP> \
  <NONCE> \
  <ARTIST_EIP712_SIGNATURE_HEX> \
  --value 4.29ether \
  --rpc-url https://mainnet.base.org \
  --interactive
```

Argument order (matches deployed ABI):
1. `bytes32 designationHash` — `canonicalDesignationHash` read from contract
2. `bytes32 archiveCommitment` — `H_STEWARDSHIP_ARCHIVE` root hash
3. `bytes32 licenseHash` — `completeLicenseHash` read from contract
4. `uint256 paintingTokenId` — `0` (fixed)
5. `uint256 frameTokenId` — `5` (fixed)
6. `uint256 deadline` — Unix timestamp when the signature expires (provided by Artist)
7. `uint256 nonce` — current nonce for your wallet (read from `nonces(address)`)
8. `bytes artistSignature` — EIP-712 signature from the Artist (hex, starting with `0x`)

*Authority Boundary:* Submitting the on-chain transaction is an independent technical right of the purchaser; however, the EIP-712 authorization signature is a constitutive authority belonging solely to the Artist and cannot be independently manufactured or forged.

**Post-transaction verification:**
```bash
# Frame 05 minted and owned by your wallet
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" 5 \
  --rpc-url https://mainnet.base.org

# Painting (Token 0) transferred to your wallet
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" 0 \
  --rpc-url https://mainnet.base.org

# Archive commitment permanently recorded on-chain
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "designatedArchiveCommitment()(bytes32)" \
  --rpc-url https://mainnet.base.org
```

---

## 5. Independent Succession

### A. Standalone Frame Transfer (ERC-721)

Standalone Frames (Tokens 1–4, 6–9) and the Complete Package Frame (Token 5) are standard ERC-721 tokens. Transfer requires no Artist signature and carries no mandatory royalty:

```bash
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "safeTransferFrom(address,address,uint256)" \
  <SENDER_ADDRESS> \
  <RECIPIENT_ADDRESS> \
  <TOKEN_ID> \
  --rpc-url https://mainnet.base.org \
  --interactive
```

*Note on Package05:* When Token 5 transfers, the on-chain `designated bearer` changes with the token. The archive and lineage must be handed over off-chain. See `SUCCESSION-PROCEDURE.md` and `CARE-AND-SUCCESSION.md` for the complete handoff procedure.

*Note on Painting (Token 0):* Token 0 **cannot** be transferred via standard ERC-721 after primary acquisition. Canonical succession of the Painting requires calling `executeSuccession()` — see section B below.

### B. Canonical Succession of the Painting (Token 0)

`executeSuccession()` is the sole canonical transfer mechanism for Token 0 (The Painting). This call:
- Requires `msg.sender` to be the current owner of Token 0;
- Requires `msg.value ≥ 4.29 ETH` (minimum canonical succession consideration);
- Automatically splits: `1.49%` to Treasury, remainder to seller;
- Emits `CanonicalSuccession` event — objective on-chain witness of the succession;
- Prohibits self-succession (`recipient ≠ currentOwner`);
- Permissionless after primary acquisition (no Artist signature required).

**Critical distinction:**
- `Frame / Package05 Token transfer` → `safeTransferFrom()`, no mandatory consideration.
- `Painting (Token 0) succession` → `executeSuccession()` required, minimum `4.29 ETH`.
- `FRAME_TRANSFER_ECONOMICS ≠ PAINTING_SUCCESSION_ECONOMICS`

```bash
# msg.sender must be current owner of Token 0
# msg.value must be >= 4.29 ETH
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "executeSuccession(uint256,address)" \
  0 \
  <RECIPIENT_ADDRESS> \
  --value 4.29ether \
  --rpc-url https://mainnet.base.org \
  --interactive
```

**Post-transaction verification:**
```bash
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" 0 \
  --rpc-url https://mainnet.base.org
```

See `SUCCESSION-PROCEDURE.md` for the complete handoff procedure (archive delivery, records, SANCTUM eligibility).

---

## 6. Purchaser-Held Practice Continuation

In accordance with the [Work Ontology](WORK-ONTOLOGY.en.md), once the practice materials and corresponding Curator substrate have been delivered:
- **Zero Gallery Compute Dependency:** The holder continues the practice and curatorial dialogues within their own chosen compute and model environment;
- **No Perpetual Hosted API Obligation:** The gallery carries no ongoing obligation to provide perpetual compute or hosted APIs for completed handoffs;
- **Hosted Support Scope:** Hosted re-transmission or recovery facilities (if provided) remain gallery-hosted infrastructure, while local custody of delivered materials and autonomous practice continuation remain with the holder within the granted license scope.
- **Hosted Complete Archive Retrieval:** The Package05 holder may retrieve the archive via the hosted service while they remain the current token owner. See `ACQUISITION-RETRIEVAL.md` for the full procedure.

---

## 7. Verification Cross-Reference

To verify contract bytecode integrity, root commitment hashes, or delivered package manifests, refer to:

→ See the verification hub: [VERIFY.en.md](VERIFY.en.md)
