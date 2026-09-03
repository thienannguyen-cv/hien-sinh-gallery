# Independent Operation and Direct Interaction — “Hiện sinh”

**English access rendering. The Vietnamese `INDEPENDENT-OPERATION.md` is canonical and governs if the versions differ.**

## 1. Nature and Boundaries of Independent Operation

This guide provides technical instructions for visitors, practitioners, and collectors who wish to independently run the gallery interface, operate a private Curator instance using personal compute/credentials, or interact directly with the smart contract on Base without using the hosted website at `hiensinh.com`.

### Invariant Canonical Boundaries:

1. **Exhibition Surface Reproducibility (`EXHIBITION_SURFACE_REPRODUCIBLE = YES`):** The static client source code is fully open and can be independently built and served in any local environment.
2. **Curator Semantics Reproducibility (`CURATOR_SEMANTICS_REPRODUCIBLE = YES`):** Public Curator prompt contexts are public in the repository with verified SHA-256 hashes; Frame Curator practice substrates and mediation envelopes are delivered as purchaser-held materials with the corresponding package. Both can be loaded into any compatible AI model without relying on gallery servers.
3. **Local vs. Production Security Behavior (`PRODUCTION_SECURITY_BEHAVIOR = QUALIFIED`):** The local dev-adapter is designed for single-user local study and does not enforce production CORS origin boundaries, dual-RPC consensus checks, or HMAC signed cookies implemented in production Edge Functions.
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

---

## 4. Direct On-Chain Smart Contract Interaction

Collectors can execute Frame or Complete Package acquisitions directly on Base Mainnet without connecting a wallet to the web interface.

### Cryptographic Safety Warning:
> **NEVER** paste raw private keys into command shells, untrusted scripts, or web forms. Always use hardware signers (Ledger/Trezor), interactive CLI signing (`cast send --interactive`), or verified Block Explorer interfaces (BaseScan Write Contract).

### A. Acquiring a Standalone Frame (Frames 01–04, 06–09)
Each standalone Frame has a fixed consideration of **0.081 ETH**. The `mintFrame(uint256 tokenId)` function is publicly open and requires no Artist signature:

```bash
# Using Foundry Cast with interactive secure key / hardware signer
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "mintFrame(uint256)" <TOKEN_ID> \
  --value 0.081ether \
  --rpc-url https://mainnet.base.org \
  --interactive
```
*(Replace `<TOKEN_ID>` with the designated token number `1` through `9`, excluding token `5` which is reserved for Complete).*

### B. Acquiring Complete Package 05 (Package 05)
Package 05 has a fixed consideration of **4.29 ETH** and requires a **valid EIP-712 countersignature from the Artist** (`artistSignature`) bound to your wallet address:

```bash
# Execute only after receiving valid EIP-712 authorization from the Artist
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "acquireCompletePackage(bytes32,bytes32,bytes32,uint256,uint256,bytes)" \
  <CANONICAL_DESIGNATION_HASH> \
  <DESIGNATED_ARCHIVE_COMMITMENT> \
  <COMPLETE_LICENSE_HASH> \
  <DEADLINE_TIMESTAMP> \
  <NONCE> \
  <ARTIST_EIP712_SIGNATURE_HEX> \
  --value 4.29ether \
  --rpc-url https://mainnet.base.org \
  --interactive
```

*Authority Boundary:* Submitting the on-chain transaction is an independent technical right of the purchaser; however, the EIP-712 authorization signature is a constitutive authority belonging solely to the Artist and cannot be independently manufactured or forged.

---

## 5. Purchaser-Held Practice Continuation

In accordance with the [Work Ontology](WORK-ONTOLOGY.en.md), once the practice materials and corresponding Curator substrate have been delivered:
- **Zero Gallery Compute Dependency:** The holder continues the practice and curatorial dialogues within their own chosen compute and model environment;
- **No Perpetual Hosted API Obligation:** The gallery carries no ongoing obligation to provide perpetual compute or hosted APIs for completed handoffs;
- **Hosted Support Scope:** Hosted re-transmission or recovery facilities (if provided) remain gallery-hosted infrastructure, while local custody of delivered materials and autonomous practice continuation remain with the holder within the granted license scope.

---

## 6. Verification Cross-Reference

To verify contract bytecode integrity, root commitment hashes, or delivered package manifests, refer to:

→ See the verification hub: [VERIFY.en.md](VERIFY.en.md)
