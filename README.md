# Hiện Sinh : Digital Exhibition Platform & Local Runtime

**English access rendering. The Vietnamese [README.vi.md](README.vi.md) is canonical and governs if the versions differ.**

This repository contains the source code for the digital exhibition platform of the artwork **"Hiện sinh"** (operating live at [`https://smapworks.art`](https://smapworks.art)), encompassing the interactive web interface, serverless relay services, and an independent local runtime environment.

---

## 1. Legal Perimeter & Disclaimer

> [!IMPORTANT]
> **SEPARATION OF FOUR PLANES:**
> $$\text{Smart Contract Token} \neq \text{Delivery Archive} \neq \text{Legal License} \neq \text{Software Repository}$$

1. **This Repository is a Software Exhibition Tool:**
   - Viewing, cloning, forking, or operating the source code in this repository does **NOT** constitute the acquisition, ownership, or transfer of copyright to the artwork *"Hiện sinh"*.
   - This repository does **NOT** mint, represent, or transfer any ERC-721 token on the Base blockchain (CREATE2 contract: `0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`).
2. **No Delivery Packages Included:**
   - This repository **EXPLICITLY DOES NOT CONTAIN**:
     - Independent Frame Practice Archives for Frames #01–04, #06–09;
     - The canonical Painting archive (`Complete Stewardship Archive` containing `H_CORE`, `H_CONSTITUTIVE`, scar-code, and the original ritual transcript);
3. **Artwork Delivery Protocol:**
   - The delivery of art package files is executed independently after an on-chain transaction is confirmed on Base Mainnet via a secure, cryptographically attested transmission protocol (see [`00_PUBLIC/ACQUISITION-RETRIEVAL.en.md`](00_PUBLIC/ACQUISITION-RETRIEVAL.en.md)).
4. **License Hierarchy & Explicit Carve-Out:**
   - [`LICENSE.md`](LICENSE.md) (English reference rendering: [`LICENSE.en.md`](LICENSE.en.md)) establishes rights and obligations for the `smapworks.art` exhibition surface (zero-tracking, anti-scraping, strict AI training prohibition) alongside independent local practice rights granted to the purchaser/steward.
   - This license **strictly does not replace, merge, or rewrite** the individual license of any component within the repository; it does not override on-chain commitments in `SCHEDULE-FRAME.md` and `SCHEDULE-COMPLETE.md`; and it does not imply that the entire source tree is governed under a single monolithic license.

---

## 2. Independent Local Operation

Adhering to the principles of radical transparency and artistic continuity, this repository enables viewers and collectors to freely run the exhibition on personal computers **entirely independent of the smapworks.art server infrastructure** (details in [`00_PUBLIC/INDEPENDENT-OPERATION.en.md`](00_PUBLIC/INDEPENDENT-OPERATION.en.md)):

- **Self-contained Architecture:** The exhibition interface compiles and operates fully offline.
- **Local Curator via Personal API Key:** Practitioners can configure personal API keys (such as model provider API keys) in `.env.development.local` to converse privately with the Curator via the local adapter `dev-adapter.mjs` without routing data through gallery servers.
- **Direct Blockchain Interaction:** Collectors can interact directly with the smart contract on Base Mainnet using standard client tools (Foundry `cast`, BaseScan) without relying on the web interface.

---

## 3. Public Dossier in `00_PUBLIC/`

The complete body of pre-transaction disclosures, ontological definitions, and cryptographic verifications is archived under [`00_PUBLIC/`](00_PUBLIC/):

| Document | Content & Evaluative Significance |
|---|---|
| [`00_PUBLIC/WORK-ONTOLOGY.en.md`](00_PUBLIC/WORK-ONTOLOGY.en.md) | Artwork ontology: Strict distinction between Idea $\to$ Frame $\to$ Generative Event $\to$ Painting $\to$ Encounter $\to$ Stewardship. |
| [`00_PUBLIC/LEGAL-TERMS.en.md`](00_PUBLIC/LEGAL-TERMS.en.md) | Framework legal terms: Radical transparency, irreversible blockchain transactions, and asymmetric succession economics. |
| [`00_PUBLIC/SCHEDULE-FRAME.en.md`](00_PUBLIC/SCHEDULE-FRAME.en.md) | Frame Practice rights: Freedom to commercially exploit self-generated output (Author commits to **0% royalty**). |
| [`00_PUBLIC/SCHEDULE-COMPLETE.en.md`](00_PUBLIC/SCHEDULE-COMPLETE.en.md) | Package 05 Complete rights: Preservation, care, and lineage custody of the canonical Painting. |
| [`00_PUBLIC/INDEPENDENT-OPERATION.en.md`](00_PUBLIC/INDEPENDENT-OPERATION.en.md) | Technical manual for self-hosting the gallery and running the local Curator adapter. |
| [`00_PUBLIC/VERIFY.en.md`](00_PUBLIC/VERIFY.en.md) | Independent verification methods for SHA-256 hashes, PGP signatures, OTS timestamps, and BaseScan bytecode. |
| [`00_PUBLIC/CARE-AND-SUCCESSION.en.md`](00_PUBLIC/CARE-AND-SUCCESSION.en.md) | File care protocols, disaster recovery backup, and secondary succession procedures. |
| [`LICENSE.md`](LICENSE.md) / [`LICENSE.en.md`](LICENSE.en.md) | Exhibition Platform & Local Practice License. |

---

## 4. Technical Architecture & Commands

### Directory Structure:
- `src/` - SPA front-end source code (React 19, TypeScript, Tailwind CSS, Framer Motion, Wagmi / Viem).
- `cloudflare/` - Cloudflare Worker proxy handling static routing, fail-closed image gateway, and SPA fallback.
- `supabase/` - Database migrations and Edge Functions orchestrating Curator dialogues.
- `archive_assets/` - Controlled intermediary visual representations (`intersection-frame.png`, `condensed_masterpiece_512.png`).
- `tests/security/` - Automated security test suite verifying cryptographic integrity and data boundaries.

### Development Commands:

```bash
# 1. Install dependencies
npm install

# 2. Run automated security test suite (139/139 PASS)
npm run security:test

# 3. TypeScript validation and clean production build (zero H_CORE leak)
npm run build

# 4. Launch local development server
npm run dev

# 5. Launch local Curator dialogue adapter (port 3001)
node dev-adapter.mjs
```

### Deployment Branch Architecture:

- **Branch `main` (Canonical Production):**  
  The official canonical branch of the repository. Powers the live online exhibition at [`https://smapworks.art`](https://smapworks.art) via a dual architecture combining Cloudflare Worker Edge Gateway (`smapworks-gallery`) and Supabase BaaS (Edge Functions, PostgreSQL RLS, storage).
- **Branch `for-safe-buy-only` (Standalone Vercel & Transparent Local Acquisition):**  
  Maintained on the remote GitHub repository ([`origin/for-safe-buy-only`](https://github.com/thienannguyen-cv/hien-sinh-gallery/tree/for-safe-buy-only)). This branch serves the goal of **transactional transparency**, allowing buyers to independently audit and execute purchases on their own standalone deployment (Vercel or local deploy) without relying on gallery Web2 infrastructure:
  - Integrates **On-Chain Authorization Discovery** directly via Base RPC `eth_getLogs` to the `HienSinhAuthorizationRegistry` contract.
  - EIP-712 signature verification and cryptographic commitment checks run 100% inside the buyer's browser RAM (no JSON file upload/paste required).
  - Strictly enforces the economic perimeter and the 4.29 ETH payment invariant of the canonical `HienSinh.sol` contract.
  - Maintained independently on GitHub remote and **never merged into `main`** to preserve the integrity of the canonical Cloudflare Worker architecture at `smapworks.art`.

---

## 5. Curatorial Principles

1. **Curatorial Equivalence:**
   The public encounter tier (`PUBLIC`) and the invited frame tier (`FRAME_INVITED`) share complete equality regarding the philosophical depth of Curator dialogues. The sole distinction is that `FRAME_INVITED` receives visual unmasking (revealing the core condensation `condensed_masterpiece_512.png` instead of the baseline mask).
2. **Completed Dialogue Pairs Invariant:**
   A valid dialogue turn strictly constitutes a completed pair $(U_i, R_i)$ comprising the visitor's prompt and the Curator's response. Network interruptions or model provider timeouts must never cause visitors to forfeit their dialogue turn.

---

© 2026 Thien An L. Nguyen · SMapWorks. All rights reserved.
