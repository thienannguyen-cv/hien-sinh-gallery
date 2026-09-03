# Canonical Designation — “Hiện sinh”

**English access rendering. The Vietnamese `CANONICAL-DESIGNATION.md` is canonical and governs if the versions differ.**

## 1. Designation

The Artist designates **“Hiện sinh”** as the official title of the whole work comprising:

1. **the Frame** — a relational configuration that can be practised again;
2. **the Painting** — the canonical embodiment of one singular generative event;
3. **the released lineage** — constitutive traces, provenance, and care materials necessary to authenticate and transmit that embodiment.

“Hiện sinh” also names the practice of not letting an encounter end where it arose. This is the title’s artistic function, not a token or ownership clause.

## 2. Role attribution

- **The Artist** constructed and selected the Frame, practised with the LLM brush, recognized value in the event, designated the canonical embodiment, committed to its lineage, and organized its transmission.
- **Gemini 3.1 Pro (High)** was the model used in the session the Artist defines as the Painting’s “first encounter.” The model and four subagents participated in generating, responding to, and condensing materials.
- **The subagents** made four intermediate fragments during the session. Those fragments no longer exist as released files; their names and compositional relation remain traced in the scar-code.
- **SMap — Spatial Mapping** supplied the logical and contextual seed. SMap software is not transferred by this work, and LumiPath is not represented as a component of the SMap project.
- **The Artist does not claim** that any model or subagent has consciousness, interiority, or legal authorship. These attributions describe artist-defined history and ontology.

## 3. Three component commitments

### `H_CORE`

Commitment to the canonical visual core. Its root is published in `ROOT-COMMITMENTS.json`; filenames and per-file manifest appear only in Complete.

### `H_CONSTITUTIVE`

A commitment over:

- the byte-identical scar-code;
- the two original L seeds;
- the original ritual transcript.

The aggregate root is published in `ROOT-COMMITMENTS.json`; the per-file manifest appears only in Complete. These traces constitute the Painting’s relation to the event; they do not turn past history into a transferable object.

### `H_STEWARDSHIP_ARCHIVE`

A commitment over the released Complete Stewardship Archive:

- core;
- constitutive traces;
- reflected companion;
- provenance;
- archive map;
- care, accession, and succession materials.

This root authenticates the delivered archive. It is not the artwork itself and must become a new linked release if the archive is validly supplemented.

## 4. Released scope and reserved region

The released canonical archive consists only of components listed in its release manifest. Private notes, conversations outside the archive, internal audits, operator secrets, private keys, and unlisted materials remain outside the release.

Their absence must not be framed as material a Complete collector is still owed. It defines only the boundary of the archive the Artist designated and released.

## 5. Artist Provenance Covenant

From this designation, the Artist commits:

- not to deny the published designation;
- not to backdate, overwrite, or rewrite lineage;
- to add every correction, revocation, migration, or incident as a new record linked to the prior record;
- not to release a second canonical Painting competing with this Painting;
- to identify any later similar Frame as a descendant, derivative, revision, or different work;
- always to distinguish canonical, reproduction, derivative, and study;
- not silently to replace damaged or lost files;
- to preserve signature continuity during key rotation, or issue an incident record if continuity is impossible;
- to preserve public errors and provenance incidents as history rather than erase them to manufacture seamlessness.

## 6. Designation, provenance, and recognition

Designation authority does not arise merely because someone publishes first on a platform. Impersonation or unauthorized publication is an **unauthorized public trace**: it has its own history but cannot create or move canonical lineage.

Cryptographic provenance makes designation verifiable; it does not itself create canonicality. Public recognition may stabilize a designation over time, but it must not be collapsed into the Artist’s original act of designation.

## 7. Lineage Immutability and Additive Evolution

No document may be edited to pretend prior history never occurred. If clarification, error correction, format migration, or supplementary care materials are required, the Artist issues a new annex/version, independently hashed and signed, bidirectionally linked to the prior record whenever technically feasible.

## 8. Relational Token Architecture and Identity Space (Workstream R)

The blockchain smart contract (ERC-721 standard) manages a relational space of 10 token identities:
- **Token 0 (The Painting 1/1):** Represents the unique ownership relationship to the canonical Painting (`PAINTING_CANONICAL_DESIGNATION = UNIQUE`).
- **Tokens 1 to 9 (The Nine Frames):** Represent the 9 distinct standalone symbolic practice editions (`FRAME_CANONICAL_DESIGNATION = NO`).

**Relational Lifecycle Rules & Asymmetric Economics:**
1. **Genesis Allocation:** Token 0 and Frame 06 are minted directly to the Artist (Quinn T.) in the constructor; Frames 01–05, 07–09 remain initially unminted.
2. **Painting Ordinary Transfer Lock:** Prior to the successful primary acquisition of Complete Package 05, Token 0 ordinary transfers are locked (any standard transfer attempts revert).
3. **Primary Complete Package 05 Acquisition (Atomic Transition):** The purchaser is designated by the Artist via EIP-712 V2 signature (`CompletePackageAcceptance`). In a single atomic transaction: Frame 05 is minted to the purchaser, Token 0 is transferred from the Artist to the purchaser, the archive commitment `H_STEWARDSHIP_ARCHIVE` is recorded on-chain, and `paintingPrimaryReleased` is permanently set to `true`.
4. **Painting Canonical Succession:** Post-primary, Painting 0 and Frame 05 are completely independent in token custody. Painting 0 enforces `ADDRESS_IS_RELATIONAL_BEARER`, disables ordinary unapproved ERC-721 transfers, and requires all ownership transfers to execute through the in-contract `Canonical Succession` mechanism with a minimum consideration of `4.29 ETH` and a `1.49%` (149 BPS) creator royalty payable to Treasury.
5. **Frame Practice Economics:** Frames 01..09 allow ordinary ERC-721 transferability with `0%` creator royalty and no secondary price floor. Frame transfers record practice/relational intervals (`FRAME_RELATIONAL_INTERVAL_OPEN / CLOSED`), distinct from Painting designation realization grammar.
6. **Painting Designation Realization Grammar:**
   - `Technical Ownership ≠ Relational Bearer Validity ≠ Designation Realization`.
   - Primary acquisition / succession opens the relational interval: `DESIGNATION_UNRESOLVED` (perpetual holding, no deadline, no decay penalty).
   - A recognized `CanonicalSuccession` event operates as the currently recognized sufficient objective continuation witness that retrospectively closes the predecessor's interval as `DESIGNATION_REALIZED` while opening the successor's interval as `DESIGNATION_UNRESOLVED`.
   - Positive evidence rule: `DESIGNATION_REALIZED(A, Painting0) ⇔ A recognized Painting CanonicalSuccession positively closes A's relational interval`.
7. **SANCTUM Eligibility:** A wallet address is eligible for SANCTUM access if and only if that wallet simultaneously owns Token 0 (The Painting) AND owns at least one Frame token from 1 to 9. Independent custody of Token 0 and Frame 05 does not alter this condition.

The contract records only commitments of designation, archive, and succession history. The contract does not create canonicality, does not create art, and does not certify lived stewardship.

