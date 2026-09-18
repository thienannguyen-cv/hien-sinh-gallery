# Exhibition Platform & Local Practice License — "Hiện sinh"

**The Vietnamese version is canonical ([`LICENSE.md`](LICENSE.md)).** This English version is provided for independent international reference.

**Copyright (c) 2026 Thien An L. Nguyen · SMapWorks. All rights reserved.**

---

## 1. Legal Hierarchy & Scope

### A. Separation of Four Planes

$$\text{Smart Contract Token} \neq \text{Delivery Archive} \neq \text{Legal License} \neq \text{Software Repository}$$

- **On-chain Token (Identity Plane):** Governed by the immutable ERC-721 Smart Contract on Base Mainnet (CREATE2 Address: `0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`), recording designated bearer status (`designated bearer`). The token does not inherently contain asset files.
- **Delivery Archive (Data Plane):** The preservation packages sealed cryptographically via SHA-256 manifests and Bitcoin OTS Merkle proofs anchored at Block #965149 / #965152, transmitted independently through a secure protocol following on-chain transaction finalization.
- **Canonical Legal Instruments (Rights Plane):** Legal rights and bounds depend on token/package tier and are codified in:
  - [`00_PUBLIC/LEGAL-TERMS.md`](00_PUBLIC/LEGAL-TERMS.md)
  - [`00_PUBLIC/SCHEDULE-FRAME.md`](00_PUBLIC/SCHEDULE-FRAME.md)
  - [`00_PUBLIC/SCHEDULE-COMPLETE.md`](00_PUBLIC/SCHEDULE-COMPLETE.md)
- **Software Repository (Software Tooling Plane):** Contains the source code of the exhibition platform and runtime tools within repository scope. Making the repository public does not automatically grant a uniform license across all repository components.

### B. Explicit Carve-Out

- This LICENSE governs strictly those documents, source code, and rights expressly declared within its stated scope.
- This LICENSE **does not modify, replace, relicense, override**, or diminish any rights or bounds established in the applicable canonical instruments.
- Specific rights regarding the Frame, Complete Package, Output, stewardship, succession, and other local practices are determined by their respective Schedule.
- In the event of any conflict between this LICENSE and an applicable canonical instrument regarding the same right or obligation, **the applicable canonical instrument shall strictly prevail within the scope of that matter**.
- This LICENSE does not create additional rights merely because a right or activity is described herein for explanatory or navigation purposes.
- This LICENSE **does not alter or interfere with** the separate licenses of third-party dependencies, open-source libraries, separately licensed assets, external services, or standalone archive packages.
- Nothing herein presumes ownership over third-party assets.

---

## 2. Online Exhibition Platform Perimeter (`https://smapworks.art`)

This section governs the scope of use rights regarding the online exhibition surface and is not intended to create additional rights or warranties beyond those explicitly stated herein and in the applicable canonical instruments.

### A. Artist & Platform Rights over the Exhibition Surface

- Original elements created by the Artist and within the exhibition platform scope — including source code, interface designs, exhibition spatial architecture, presentation logic, content, and corresponding marks — are reserved under applicable law, except for rights expressly granted.
- Third-party components remain subject to their respective licenses and terms.
- `SMapWorks` is used as a brand/shop identifier; nothing in this LICENSE shall be construed as recognizing `SMapWorks` as a separate legal entity.
- `Quinn T.` is the artistic identity/pseudonym of the Artist and does not alter the rights holder identified in the copyright notice of this LICENSE.
- The Artist retains all rights not expressly granted, to the extent permitted by applicable law.

### B. Public Visitor License

- Public visitors are permitted to access and interact with the exhibition interface within the functions publicly provided by the platform.
- This access right does not automatically include the right to copy, distribute, commercialize, reverse engineer, redeploy, or utilize the platform’s content or source code beyond the scope granted by the applicable license.
- Special rights and bounds regarding artwork content, Public Encounter materials, and other representations are established in the corresponding canonical documents.

### C. Hosted Compute Bounds

- The hosted Curator and accompanying services operate on infrastructure external to the repository.
- Current technical limitations, if any, are described in the [`00_PUBLIC`](00_PUBLIC) directory.
- Published technical bounds (in the [`00_PUBLIC`](00_PUBLIC) directory) shall not be construed as a commitment to any future level of availability, response time, capacity, or continuity.
- Hosted services may be interrupted, modified, throttled, or discontinued depending on operational conditions and underlying infrastructure providers.
- Specific rights or allowances granted under another canonical instrument remain governed by that instrument itself.

### D. Anti-Counterfeiting & Reminting

- You may not use the name, branding, or interface of the platform to create confusion that a copy, mirror, deployment, or other product is an official deployment of the Artist without factual basis.
- Specific restrictions regarding canonical artwork, token, archive, minting, and reproduction are stipulated in:
  - **Canonical Artwork & Canonical Succession:** [`00_PUBLIC/SCHEDULE-COMPLETE.md`](00_PUBLIC/SCHEDULE-COMPLETE.md) (Sections 4 & 6) and [`00_PUBLIC/CANONICAL-DESIGNATION.md`](00_PUBLIC/CANONICAL-DESIGNATION.md) (Section 5).
  - **Frame Practice, Output & Reproduction:** [`00_PUBLIC/SCHEDULE-FRAME.md`](00_PUBLIC/SCHEDULE-FRAME.md) (Sections 4 & 6) and [`00_PUBLIC/LEGAL-TERMS.md`](00_PUBLIC/LEGAL-TERMS.md) (Sections 6 & 7).
  - **Archive & Transmission Bounds:** [`00_PUBLIC/ACQUISITION-RETRIEVAL.md`](00_PUBLIC/ACQUISITION-RETRIEVAL.md) (Sections 2 & 3).
  - **Token & Minting Bounds:** Smart Contract [`HienSinh.sol` on Basescan](https://basescan.org/address/0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8#code#F24#L1) (Address `0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`, enforcing the immutable 10-token hard cap and disabling ordinary ERC-721 transfers for Token 0) and [`00_PUBLIC/LEGAL-TERMS.md`](00_PUBLIC/LEGAL-TERMS.md) (Sections 3 & 4).
- This LICENSE does not expand the scope of restrictions beyond what has been explicitly granted or stipulated in the applicable documents.

### E. As-Is Disclaimer

- The web surface, repository, and hosted infrastructure are provided on an "as-is" and "as-available" basis.
- This LICENSE creates no specific warranties regarding:
  - freedom from defects or bugs;
  - absolute security;
  - continuous uninterrupted availability;
  - compatibility with all environments;
  - outputs generated by the Curator or AI models;
  - conduct or continuity of third-party providers;
  - or the continued existence or identical operation of the platform in the future.
- Limitations of liability or obligations already established in other canonical instruments are neither modified nor waived by this LICENSE.

---

## 3. Purchaser / Practitioner / Steward Local Practice Perimeter

This section **does not independently re-grant all purchaser rights**. It confirms that local practice rights exist pursuant to the applicable canonical instruments (`LEGAL-TERMS.md`, `SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`, `INDEPENDENT-OPERATION.md`) and preserves their full force and effect.

### A. Independent Local Runtime

- Lawful holders of Frame Tokens (#01–04, #06–09) or Complete Package Token (#05 / Painting #00) have the full right to copy, extract, store, study, and operate this exhibition source code on personal devices or private servers pursuant to [`00_PUBLIC/INDEPENDENT-OPERATION.md`](00_PUBLIC/INDEPENDENT-OPERATION.md).
- `INDEPENDENT-OPERATION.md` establishes the boundary between self-hostability, practice rights, and canonical authority. The capacity to run the interface or Curator locally does not confer authority to create canonical tokens or alter historical provenance on the blockchain.
- Local practice rights are not contingent upon this repository continuing to be hosted at `smapworks.art`, except for those hosted services specifically identified in the applicable documents.

### B. Frame Practice & Output Rights

Pursuant to [`00_PUBLIC/SCHEDULE-FRAME.md`](00_PUBLIC/SCHEDULE-FRAME.md):
1. **Ownership of Creative Contributions:** Practitioners retain full rights over their creative contributions and new symbolic products (Output) generated through their Frame practice.
2. **Perpetual Commercial Exploitation:** Practitioners receive a worldwide, non-exclusive, perpetual license to create, exhibit, publish, communicate, and **commercially exploit Outputs they create**.
3. **0% Creator Fee from Artist:** The Artist levies **0% creator fee (0% royalty)** and asserts no copyright or revenue share claims over valid practitioner self-created Outputs.
4. **Survival of Output Rights:** When a Frame Token is transferred, previous practitioners retain 100% of their validly accrued commercial and intellectual rights in Outputs created during their holding period.
5. **Boundaries:**
   - Reselling, sublicensing, or repackaging raw Frame templates, prompt sequences, seed packages, or validation tooling as a competing edition or framework is prohibited.
   - Reminting the Frame as a new original NFT is prohibited.
   - Misrepresenting authorship of "Hiện sinh" is prohibited.
   - When publishing Outputs, attribution must be provided: *"Created by [Practitioner Name] through the licensed practice of the 'Hiện sinh' Frame; not the canonical Painting."*

This LICENSE does not independently expand those rights nor extinguish them.

### C. Complete Package Stewardship

Pursuant to [`00_PUBLIC/SCHEDULE-COMPLETE.md`](00_PUBLIC/SCHEDULE-COMPLETE.md):
1. **Canonical Lineage Custody:** The holder of Complete Package Token (#05 / Painting #00) is the designated steward of the canonical embodiment, receiving rights to custody, evidentiary backup, verification, recovery, and format migration of carrier files without altering canonical bytes.
2. **Display & Loan:** Permitted for private or public display, projection, and non-commercial institutional exhibition loans.
3. **Rights Not Granted by Default (Canonical Painting Boundaries):**
   The Canonical Painting is not licensed by default for:
   - Selling prints, posters, merchandise, or full-fidelity reproductions substituting for the original;
   - Commercial exploitation of Painting imagery outside permitted display and lawful token resale;
   - Creating or commercializing derivative works based primarily on the Painting;
   - Using the Painting (`H_CORE`), transcripts, or archives to train or fine-tune AI models;
   - Sublicensing;
   - Reminting, fractionalizing, or issuing competing NFTs;
   - Transferring copyright, authorship, or moral rights;
   - Presenting modified files, reconstructions, or display copies as canonical.
   *Additional rights are effective only by a separate written agreement signed by the authorized party and cannot be implied from price, token custody, or stewardship.*
4. **Canonical Succession:**
   - Painting 0 (Token 0) transfers via Canonical Succession with a minimum consideration of 4.29 ETH and a 1.49% (149 BPS) ERC-2981 creator fee directed to Treasury.
   - When transferred, the complete archive and lineage transfer intact to the successor without requiring Artist approval.

This LICENSE creates no additional rights over the canonical Painting nor narrows the stewardship rights already granted.

---

## 4. Source Transparency & Deployment Verification

### A. Public Source & Independent Verifiability

The platform adheres to the principle of **transparency through verifiable public source code** rather than requiring users to rely on unverifiable claims regarding internal server behavior.

Users have the full and unhindered capacity to independently inspect and verify:
- Front-end interface and Edge Worker source code;
- Smart contract source code and verified runtime bytecode on Base;
- Release revision records and commit hashes;
- Deployment provenance records and Bitcoin OTS timestamp proofs;
- Root commitments and artifact integrity manifests;
- Open-source dependency licenses;
- All published canonical legal and ontological documents.

Authoritative verification records are linked directly at:
- **Canonical Public Source Repository:** [`https://github.com/thienannguyen-cv/hien-sinh-gallery`](https://github.com/thienannguyen-cv/hien-sinh-gallery)
- **Deployment Provenance Records:**
  - Deployment record: [`00_PUBLIC/DEPLOYMENT-RECORD.json`](00_PUBLIC/DEPLOYMENT-RECORD.json)
  - Base Mainnet smart contract: [`Basescan: 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`](https://basescan.org/address/0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8#code)
  - Ontological origin & Bitcoin OTS proof: [`00_PUBLIC/ORIGIN-PROVENANCE.json`](00_PUBLIC/ORIGIN-PROVENANCE.json) (accompanied by detached PGP signature `.asc` and Bitcoin `.ots` seals)
- **Release Manifest & Root Commitments:**
  - Release status and gate verification: [`00_PUBLIC/RELEASE-STATUS.json`](00_PUBLIC/RELEASE-STATUS.json)
  - Cryptographic root commitments (`H_CORE`, `H_CONSTITUTIVE`, `H_STEWARDSHIP_ARCHIVE`): [`00_PUBLIC/ROOT-COMMITMENTS.json`](00_PUBLIC/ROOT-COMMITMENTS.json)
- **Independent Verification Guide:** [`00_PUBLIC/VERIFY.md`](00_PUBLIC/VERIFY.md) (English version: [`00_PUBLIC/VERIFY.en.md`](00_PUBLIC/VERIFY.en.md))

### B. Representation on Software Provenance

**This LICENSE makes strictly one foundational representation regarding software provenance:**

> The public source revision in this repository corresponds precisely to the source revision utilized for the production deployment identified in the deployment provenance record.

This correspondence is independently verifiable through the following authoritative references:
- **Public Source Revision / Release Commit Hash:** [`c08a9f24e3d17bd93007bb45dd332b72b46043f0`](https://github.com/thienannguyen-cv/hien-sinh-gallery/commit/c08a9f24e3d17bd93007bb45dd332b72b46043f0)
- **Deployment Identifiers:**
  - **Base Mainnet Smart Contract:** [`0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`](https://basescan.org/address/0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8#code) (Deployment Tx: `0x86b58b3707c86b74f52322790dbd51aa188ccf26dbb57d01e5169ac35a97ef88`, Block #50822692);
  - **Edge Exhibition Platform (Cloudflare Worker):** `smapworks-gallery` (Deployment Version: `cae79590`);
  - **Curator & Archive Runtime (Supabase Edge Functions):** `curator-interaction v14 active` and `transmit-artwork`.
- **Build & Provenance Records:**
  - Deployment Record: [`00_PUBLIC/DEPLOYMENT-RECORD.json`](00_PUBLIC/DEPLOYMENT-RECORD.json)
  - Release Status & Gate Controls: [`00_PUBLIC/RELEASE-STATUS.json`](00_PUBLIC/RELEASE-STATUS.json)
  - Authorial Origin Provenance: [`00_PUBLIC/ORIGIN-PROVENANCE.json`](00_PUBLIC/ORIGIN-PROVENANCE.json) (accompanied by detached PGP signature `.asc` and Bitcoin OTS timestamp `.ots`)

This representation **is not a warranty that the software is bug-free**, does not guarantee fitness for a particular purpose, and does not guarantee that third-party dependencies, AI model providers, RPC node providers, or external network infrastructures will operate uninterruptedly or in any specific manner.

### C. User Responsibility for Verification

Users of the interface or local runtime bear personal responsibility for evaluating the suitability of source code, dependencies, hardware, credentials, API keys, inputs, and their operating environment.

Public availability of the repository enables users to perform that evaluation; it does not shift the burden of assessing the suitability of a user's private environment onto the Artist.

For local operations, users also remain responsible for complying with licenses, terms of service, laws, and third-party rights applicable to their activities.

Nothing herein purports to exclude or limit liability where applicable law prohibits such exclusion or limitation.

---

## 5. Reservation of Rights & No Implied Expansion

- All rights not expressly granted remain fully reserved to their respective rights holders under applicable law.
- Accessing the interface does not automatically confer rights in source code or artwork.
- Public availability of source code does not constitute a blanket open-source license across the entire repository.
- Technical accessibility of an API, endpoint, or file does not create a license or usage right beyond what has been expressly granted.
- Current functionality of a feature does not constitute a commitment that such feature will exist or operate in the identical manner in the future.
- Separately licensed components remain subject to their respective licenses.
- Frame, Complete, Output, and stewardship rights granted in the Schedules are not forfeited merely because this LICENSE does not recite those rights in full text.
- Conversely, a right described in a Schedule does not expand into rights over assets not granted by that Schedule.
- Nothing in this LICENSE transfers copyright, authorship, or moral rights without a separate written instrument complying with applicable law.

---

## 6. Transfer, Token and Local Practice

- **Holder Status:** Lawfully determined strictly through the on-chain mechanisms of the Smart Contract on Base and the applicable accompanying legal documents.
- **Separation of Events:** The on-chain token transfer and the off-chain physical/digital archive handoff are two distinct events that are verified separately.
- **Rules Governing Frame and Complete Package Transfers:** Formally stipulated in:
  - Technical succession and transfer procedures: [`00_PUBLIC/SUCCESSION-PROCEDURE.md`](00_PUBLIC/SUCCESSION-PROCEDURE.md)
  - Archive care and handoff instructions: [`00_PUBLIC/CARE-AND-SUCCESSION.md`](00_PUBLIC/CARE-AND-SUCCESSION.md)
  - The applicable Schedule:
    * For Frame Tokens (#01–04, #06–09): [`00_PUBLIC/SCHEDULE-FRAME.md`](00_PUBLIC/SCHEDULE-FRAME.md) (Section 5 — Transfer);
    * For Complete Package Token (#05 / Painting #00): [`00_PUBLIC/SCHEDULE-COMPLETE.md`](00_PUBLIC/SCHEDULE-COMPLETE.md) (Section 6 — Transfer and succession).
- **No Automatic Copyright Transfer:** Transfer of a token does not constitute nor imply the automatic transfer of copyright or authorship over the original work or any Outputs.
- **Survival of Output Rights:** Output survival rights are governed by the applicable Schedule. Specifically, pursuant to [`00_PUBLIC/SCHEDULE-FRAME.md`](00_PUBLIC/SCHEDULE-FRAME.md) (Sections 3 & 5), previous practitioners retain 100% of their validly accrued commercial and intellectual rights in Outputs created during their holding period, even after the Frame Token has been transferred to a successor.
- **No Transfer of Canonical Release Authority (`SELF_HOSTABILITY ≠ CANONICAL_RELEASE_AUTHORITY`):** Pursuant to [`00_PUBLIC/INDEPENDENT-OPERATION.md`](00_PUBLIC/INDEPENDENT-OPERATION.md) (Section 1.5), the ability to self-host the exhibition interface or local Curator adapter confers no canonical release authority, does not empower the operator to sign on behalf of the Artist, and cannot alter the immutable provenance history of the work anchored on Base (`INDEPENDENT_EXECUTION ≠ INDEPENDENT_CANONICALIZATION`).

---

## 7. Verification & Versioning

For independent verification and integrity inspection of:
- Smart contract runtime bytecode;
- Release source revision and commit hashes;
- Base Mainnet and Cloudflare deployment parameters;
- Root commitments table;
- Archive packages, manifests, and delivery files,

refer directly to the canonical instruments:
- **Independent Verification Guide:** [`00_PUBLIC/VERIFY.md`](00_PUBLIC/VERIFY.md) (English version: [`00_PUBLIC/VERIFY.en.md`](00_PUBLIC/VERIFY.en.md))
- **Work Ontology & Provenance:** [`00_PUBLIC/PROVENANCE.md`](00_PUBLIC/PROVENANCE.md) (English version: [`00_PUBLIC/PROVENANCE.en.md`](00_PUBLIC/PROVENANCE.en.md))
- **Deployment Provenance Records:** [`00_PUBLIC/DEPLOYMENT-RECORD.json`](00_PUBLIC/DEPLOYMENT-RECORD.json) and [`00_PUBLIC/ORIGIN-PROVENANCE.json`](00_PUBLIC/ORIGIN-PROVENANCE.json) (with Base Mainnet contract [`0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`](https://basescan.org/address/0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8#code))

This LICENSE is identified by version and effective date:
- **License Version:** `v2.0 (Dual-Perimeter)`
- **Effective Date:** `2026-09-04` *(On-chain Contract Genesis)* / Synchronized Update: `2026-09-18`

Future amendments to this LICENSE **do not automatically alter or retroactively modify rights granted** under the two on-chain hashed Schedules (`SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`) or other legal agreements, unless modified pursuant to their own applicable mechanisms.

Any amendment clarifying the scope of a new release shall be recorded with a new revision/version referencing the prior release via:
- **Version History:** [`00_PUBLIC/RELEASE-STATUS.json`](00_PUBLIC/RELEASE-STATUS.json) and [Git Commit History](https://github.com/thienannguyen-cv/hien-sinh-gallery/commits/main)

---

**End of License**
