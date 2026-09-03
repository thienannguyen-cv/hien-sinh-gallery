# Legal Terms — "Hiện sinh"

**English access rendering. The Vietnamese `LEGAL-TERMS.md` is canonical and governs if the versions differ.**
Effective date: [canonical contract deployment date].

This document was self-authored by the Artist based on open-source practices, international intellectual property standards, and the radical-transparency principles of blockchain technology. It has not been formally reviewed by specialist legal counsel; the Artist has made reasonable efforts to ensure clarity, honesty, and fairness. This document is not legal advice. Participants should independently assess risk and seek independent counsel if needed.

## 1. Document structure

The artistic relation is described in `WORK-ONTOLOGY.en.md` and `STEWARDSHIP-CHARTER.en.md`. Those documents do not replace these legal terms.

Legal permissions depend on token/package type:

- Frame: `SCHEDULE-FRAME.en.md`;
- Complete: `SCHEDULE-COMPLETE.en.md`.

If artistic language and legal terms conflict on a legal right, duty, or transaction, the legal terms govern that legal question. Stewardship language may not obscure price, fees, risk, or license scope.

## 2. Definitions

- **Artist**: the issuing persona cross-bound through the public PGP key, minting wallet, and canonical contract in the release registry.
- **Work**: the whole work "Hiện sinh" under its canonical designation.
- **Frame Token**: one of 8 standalone ERC-721 tokens #01–04 or #06–09 in `FRAME_ONLY` state.
- **Complete Package Token**: token #05, representing Package 05 containing Frame 05 + Painting and recorded by the contract as `DESIGNATED_STEWARD`.
- **Canonical Painting**: the canonical embodiment named in the designation; not the token.
- **Archive**: the file package authenticated by the release manifest and commitment.
- **Holder/Licensee**: the person lawfully controlling the wallet holding the relevant token, subject to applicable law and authoritative orders.
- **Output**: a new result a person creates by practising the Frame, not a copy or repackaging of the Frame/Work.

## 3. Transaction and on-chain record

- Frame mint price: **0.081 ETH** for each standalone Frame token (#01–04, #07–09).
- Primary acquisition consideration for Package 05: **4.29 ETH**, atomic transfer of Frame 05 + Painting 0; no additional 0.081 ETH charge.
- Gas, taxes, platform fees, and ETH price volatility are borne by the transacting party unless required otherwise by law.
- **Asymmetric Succession Economics:**
  - **The Painting (Token 0):** Must be transferred via in-contract `Canonical Succession` with a minimum consideration of **4.29 ETH** and a **1.49% (149 BPS)** ERC-2981 creator fee payable to Treasury (minimum **0.063921 ETH**). The 4.29 ETH threshold is strictly a canonical succession condition, not a market appraisal or valuation.
  - **The Frames (Tokens 1..9):** Free ordinary ERC-721 transferability, **0%** creator fee (`0 BPS`), no secondary floor.
- Tokens are not shares, debts, profit commitments, or investment products.
- No promises of liquidity, appreciation, marketplace listing, or resale capability.

## 4. Token, archive, and license are separate layers

The token records the designated bearer. The Archive is delivered data. The License states legal permissions. None substitutes automatically for another:

- a token does not itself contain files;
- an archive copy does not itself prove holder status;
- custody does not transfer copyright;
- stewardship does not expand the License;
- the License does not certify artistic value or inner experience.

Where token and Archive have not both been accepted, records must state the incomplete status rather than infer rights or lineage.

### 4b. Value resides in provenance and event, not in files

The legal and artistic value of "Hiện sinh" is bound to **authenticated provenance** — the symbolic birth event that has already occurred, the ontology confirmed by the Artist, and the unforgeable chain of designation — not to the data files that comprise the Archive.

PNG files, transcripts, seeds, and all other digital data are **carriers** of the canonical embodiment. A copy of a file does not carry provenance; a file leaked, copied, or re-minted by a third party with no link to the event recorded in the provenance token creates no canonical lineage and holds no designation value.

This means: the scarcity of "Hiện sinh" does not depend on concealing files, but on the **non-impersonability** of the event, the ontology, and the cryptographic chain of attestation anchored on the blockchain.

## 5. Copyright, authorship, and AI-assisted material

The Artist retains all copyright and related rights that applicable law recognizes and the Artist controls, except permissions expressly granted by the applicable Schedule.

Nothing guarantees that every AI-assisted component is copyrightable in every jurisdiction. Rights in AI-assisted output depend on applicable law, human contribution, model/platform terms, and third-party rights. The License grants only rights the Artist can lawfully grant.

Token sale does not transfer authorship, moral rights, or copyright without a separate written assignment satisfying applicable law.

## 6. Rights reserved by the Artist

Subject to the covenant not to release a competing canonical, the Artist retains the right to:

- document, research, and write about the Work;
- use reasonable images for authentication, curation, exhibition, press, and promotion;
- publish catalogues, books, and scholarship;
- display or exhibit through display copies;
- create clearly labelled studies, derivatives, and reproductions;
- sell **materially transformed derivatives** under the Etsy policy below;
- protect provenance, designation, and legal rights.

## 7. Etsy and reproduction policy

The Artist will not sell a full-fidelity copy of the Canonical Painting as a substitute product. Any Etsy product must:

- be materially transformed in form, function, or context;
- be labelled derivative/reproduction and not canonical;
- disclose AI use as required by current platform rules;
- disclose a production partner where applicable;
- avoid creating an edition reasonably confused with a second canonical Painting.

A new reproduction program requires a prospective public supplement. It does not retroactively amend a prior release's License or commitments.

## 8. Delivery, care, and technical risk

The package is provided "as is" after the recipient has an opportunity to verify hashes, signatures, and manifests. The Artist does not warrant that:

- any blockchain, marketplace, gateway, IPFS pin, or third-party software will operate forever;
- every file format will remain readable on future systems;
- the Public Encounter Representation cannot be captured, copied, or redistributed;
- ETH or the token will retain value.

Nothing excludes liability that mandatory law does not permit to be excluded. Backup, migration, and incident procedures are in `CARE-AND-SUCCESSION.en.md`.

### 8b. Radical transparency replaces security through obscurity

"Hiện sinh" applies radical transparency consistent with the spirit of blockchain technology:

- **Smart Contract:** The entire source code is verified and public on the block explorer. Anyone can read, inspect, and understand the transaction logic before participating.
- **Legal terms:** The full document set — `LEGAL-TERMS.md`, `SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`, `WORK-ONTOLOGY.md`, `STEWARDSHIP-CHARTER.md`, `TRANSACTION-DISCLOSURE.md`, `VERIFY.md`, `PROVENANCE.md` — is published openly, with hash authentication, before any transaction opens.
- **Verification mechanism:** The token, archive, and lineage verification procedures are fully described in `VERIFY.md` and can be independently checked by any third party.
- **Representative image:** A 512×512 reduced-scale version with anti-reversal modifications (`Public Encounter Representation`) is publicly available to support pre-transaction assessment. It is not the canonical Painting bytes.

The purpose of this transparency is to ensure that **all information necessary to assess risk, understand rights, and make an informed decision is available before any transaction occurs**. There is no hidden information affecting participants' legal rights or obligations that is not disclosed in this document set.

### 8c. Blockchain transactions are irreversible

Transactions on the Base Network blockchain are irreversible once finalized. The smart contract has no refund, pause, or token-revocation function. The Artist has no technical ability to reverse a finalized transaction.

If archive delivery encounters a technical failure after the on-chain transaction is finalized, the Artist commits to making reasonable efforts to complete delivery within 30 days. If delivery proves impossible, both parties will negotiate in good faith for an alternative resolution.

Participants confirm they understand this irreversibility before submitting a transaction.

### 8d. Liability limitation based on informed consent

By submitting a token purchase transaction, a participant confirms that:

1. they had access to the full public document set;
2. they had the opportunity to read and inspect the smart contract source code;
3. they understand the risks listed in `TRANSACTION-DISCLOSURE.md`;
4. they are making an informed decision and accept responsibility.

In all cases and to the extent permitted by applicable law, the Artist's total liability to any Holder in connection with the token, Archive, or License does not exceed **the ETH actually paid by the Holder to the Artist for the relevant token, valued at the time of the original transaction**.

This limitation reflects the principle: when all information has been disclosed transparently and the participant has had full opportunity to evaluate, **neither party may invoke an information asymmetry** to claim damages beyond the scope of the transaction.

## 9. Token transfer

The License follows holder status under the applicable Schedule. A Package 05 Token transferor should deliver the Archive and lineage to the successor. A secondary successor does not require Artist approval and does not repeat the three-brushstroke primary ritual.

A transferor must not continue to represent themselves as current holder. A private backup retained for legal or evidentiary need does not create designated status or permit exploitation beyond surviving rights.

### 9b. The legal framework is a protocol, not a bilateral contract

This legal document set is designed as a **self-executing protocol** that travels with the token:

- When a token is transferred, the legal framework passes intact to the new Holder without modification, re-signing, or Artist approval.
- A new Holder inherits exactly the rights and limitations specified in the applicable Schedule, no more and no less.
- No provision in this framework creates a dependency on the Artist for secondary transfers. The Artist is not a signing party to each transfer transaction.
- This framework, together with the smart contract source code and the public document set, provides sufficient information for any Holder to transfer the token with the same degree of transparency and legal assurance they received upon acquisition.

Goal: A Holder does not need to "reinvent" the legal framework or contact the Artist to resell. The framework operates like a blockchain protocol — once established, it runs autonomously through each transfer.

## 10. Governing law and dispute resolution

This document set was authored based on international intellectual property principles, open-source practices, and digital contract conventions, and is not bound exclusively to any single national legal system.

If a dispute arises, the parties shall prioritize:

1. **Good-faith negotiation** within 60 days from written notice of the dispute;
2. **Online mediation** through a mutually agreed third party, if negotiation fails;
3. **International arbitration** under the UNCITRAL Arbitration Rules or equivalent rules accepted by both parties, as a last resort.

The arbitration language shall be English or Vietnamese at the claimant's choice. The seat of arbitration is to be agreed by the parties; failing agreement, arbitration proceeds online.

Any post-release legal changes must be a new release with its own hash and signature, linked to the prior release under the additive-only principle in `PROVENANCE.md`.
