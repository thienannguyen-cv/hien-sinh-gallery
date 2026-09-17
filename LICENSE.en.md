# Exhibition Platform & Local Practice License — "Hiện sinh"

**The Vietnamese version (`LICENSE.md`) is canonical.** This English translation is provided for international transparency and reference.

**Copyright (c) 2026 Thien An L. Nguyen · SMapWorks. All rights reserved.**

---

## 1. Legal Hierarchy & Scope

### A. Separation of Four Planes
$$\text{Smart Contract Token} \neq \text{Delivery Archive} \neq \text{Legal License} \neq \text{Software Repository}$$

- **On-chain Token (Identity Plane):** Managed by the immutable ERC-721 smart contract on Base Mainnet (CREATE2 address: `0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`), recording the designated bearer. Tokens do not contain data files.
- **Delivery Archive (Data Plane):** Archive packages cryptographically sealed via SHA-256 manifests and OTS Merkle proofs on Bitcoin Blocks #965149 / #965152, transmitted independently over authenticated delivery channels upon on-chain transaction finalization.
- **Canonical Legal Schedules (Rights Plane):** Governed by `00_PUBLIC/LEGAL-TERMS.md` and two dedicated schedules:
  - `00_PUBLIC/SCHEDULE-FRAME.md` (On-chain pinned SHA-256 hash: `bbb9b030f482f5ea365d58eadd13ad48f4357aeb9d983497b9a64c5e1ddb18e2`);
  - `00_PUBLIC/SCHEDULE-COMPLETE.md` (On-chain pinned SHA-256 hash: `71d01dbc1962a5cedd1204fe76fa9d538e5d338146eb9375743b91a55cde8c14`).
- **This Software Repository (Exhibition Tool Plane):** Strictly serves as the software exhibition interface for the digital gallery and the independent local execution runtime.

### B. Explicit Carve-Out
- This License governs only those materials, codebases, and rights declared within its explicit scope.
- This License **does not modify, replace, relicense, or override** any content or cryptographic hashes of the on-chain pinned schedules (`SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`) or the master framework in `LEGAL-TERMS.md`.
- This License **does not alter or interfere with** separate licenses governing third-party dependencies (`node_modules`), open-source libraries, separately licensed assets, or independent delivery archives.
- Nothing in this document presumes ownership over third-party assets or libraries.

---

## 2. Online Exhibition Platform Perimeter (`https://smapworks.art`)

This section governs the terms of access and use for public visitors and automated agents accessing the online exhibition platform:

### A. Rights in the Exhibition Surface
- The overall user interface, front-end architecture, spatial layout (Threshold, Atelier, Frame Interior, Sanctum), aesthetic phenomena (optical waveguide, progressive unmasking, typography), and brand identity of `SMapWorks` are the intellectual property of the Artist (Thien An L. Nguyen).
- The Artist retains all copyright and related rights recognized by law, except for permissions explicitly granted herein.

### B. Public Visitor Access License
- Public visitors receive a personal, non-commercial, non-exclusive, revocable license to view the public exhibition and interact with the Public Curator and Frame Curator via the web interface.
- Access is provided equally, free of charge, with no requirement to connect a wallet merely to view the exhibition.

### C. Zero-Tracking Privacy Guarantee
- The platform enforces **Zero Cookies** and **Zero Session Tracking**. No session cookies, tracking cookies, or intrusive fingerprinting mechanisms are deployed.
- Token ownership verification (for image access or documentation retrieval) is executed via a **Stateless Blockchain Handshake** directly within the serverless function RAM, persisting zero bytes of wallet address or personal data into databases.

### D. Hosted Compute Bounds & Curatorial Relationship
- Hosted Curator access on platform servers is a finite curatorial accompaniment:
  - Bounded to a maximum of three (03) completed dialogue pairs $(U_i, R_i)$ per session;
  - Bound to a 16 KiB maximum request payload with rate limiting to prevent denial-of-service abuse.
- An exchange is strictly defined as a completed pair $(U_i, R_i)$. Network delays, timeouts, or provider capacity unavailability (`HOSTED_CURATOR_CAPACITY_UNAVAILABLE`) **never deduct from visitor quota and never seal the session**.

### E. Anti-Scraping & Anti-AI Training Prohibition
- **Anti-Scraping:** Automated bots, crawlers, spiders, or scrapers are strictly prohibited from bulk-extracting exhibition images, vectors, audio, source code, or Curator API endpoints (`/api/curator-interaction`, `/api/frame-curator-image`).
- **STRICT ANTI-AI TRAINING PROHIBITION:** It is strictly prohibited to use any artwork, text documents, prompts, seed configurations, codebases, or Curator dialogues from `smapworks.art` to train, fine-tune, distill, benchmark, or evaluate any artificial intelligence (AI), large language model (LLM), or machine learning system without explicit written authorization from the Artist.

### F. Anti-Counterfeiting & Reminting
- Mirroring the exhibition interface to create competing or deceptive presentations is prohibited.
- Reminting public representation images (`intersection-public.png`, `intersection-frame.png`, `condensed_masterpiece_512.png`) as NFTs on any blockchain is prohibited.

### G. As-Is Disclaimer
- The web interface and hosted infrastructure are provided "as is", without warranty of any kind regarding uninterrupted network access, IPFS gateway availability, or third-party AI provider uptime.

---

## 3. Purchaser / Practitioner / Steward Local Practice Perimeter

This section faithfully reflects the local practice rights established in canonical documents (`LEGAL-TERMS.md`, `SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`, `INDEPENDENT-OPERATION.md`):

### A. Independent Local Runtime Autonomy
- Lawful holders of Frame Tokens (#01–04, #06–09) or Complete Package Token (#05 / Painting #00) have the full right to clone, extract, inspect, and run this exhibition codebase locally pursuant to [`00_PUBLIC/INDEPENDENT-OPERATION.md`](00_PUBLIC/INDEPENDENT-OPERATION.md).
- **Runtime Independence:** Practice rights are completely independent of the ongoing availability of `smapworks.art`. Practitioners have the right to supply personal API keys to operate the local Curator adapter (`dev-adapter.mjs`) privately.

### B. Frame Practice & Output Rights (per `SCHEDULE-FRAME.md`)
1. **Ownership of Creative Contributions:** Practitioners retain full rights over their creative contributions and new symbolic outputs (Output) generated through their Frame practice.
2. **Perpetual Commercial Exploitation:** Practitioners receive a worldwide, non-exclusive, perpetual license to create, exhibit, publish, and **commercially exploit Outputs they create**.
3. **0% Creator Fee from Artist:** The Artist levies **0% creator fee (0% royalty)** and asserts no copyright or revenue share claims over valid practitioner self-created Outputs.
4. **Survival of Output Rights:** When a Frame Token is transferred, previously generated valid Outputs remain fully owned and licensed to the practitioner who created them in perpetuity.
5. **Boundaries:**
   - Reselling or repackaging raw Frame templates, prompt sequences, seed packages, or validation tooling as a competing edition or framework is prohibited.
   - Reminting the Frame as a new original NFT is prohibited.
   - Outputs must be accurately attributed: *"Created by [Practitioner Name] through the licensed practice of the 'Hiện sinh' Frame; not the canonical Painting."*

### C. Complete Package Stewardship (per `SCHEDULE-COMPLETE.md`)
1. **Canonical Lineage Custody:** The holder of Complete Package Token (#05 / Painting #00) is the designated steward of the canonical embodiment, receiving rights to custody, evidentiary backup, verification, and format migration of carrier files without altering canonical bytes.
2. **Display & Loan:** Permitted for private or public display, projection, and non-commercial institutional exhibition loans.
3. **Canonical Painting Boundaries:**
   - Commercial mass reproduction, full-fidelity posters, or merchandise substituting for the canonical Painting (`H_CORE`) are not granted.
   - Using `H_CORE` or private archives for AI training is strictly prohibited.
   - Authorship and moral rights are non-transferable and remain with the Artist.
4. **Canonical Succession:**
   - Painting 0 (Token 0) transfers via Canonical Succession with a minimum consideration of 4.29 ETH and a 1.49% (149 BPS) ERC-2981 creator fee directed to Treasury.
   - License and complete archive lineage transfer intact to the successor without requiring Artist approval.

---

## 4. Self-Executing Protocol

This legal framework operates as a self-executing protocol accompanying tokens on the Base blockchain:
- Upon token transfer, all applicable local practice rights and restrictions transfer automatically to the new holder without modification or approval from the Artist.
- The new holder succeeds strictly to the rights and bounds established in the applicable Schedule.

---

## 5. Applicable Law & Dispute Resolution

- Constructed under international principles of digital intellectual property, digital contract protocols, and open-source practices.
- Priority resolution pathway:
  1. Good-faith negotiation within 60 days;
  2. Online mediation via an agreed independent third party;
  3. International arbitration under UNCITRAL Arbitration Rules (conducted online) as a final recourse.
- Language of proceedings: Vietnamese (canonical) or English at claimant's election.
