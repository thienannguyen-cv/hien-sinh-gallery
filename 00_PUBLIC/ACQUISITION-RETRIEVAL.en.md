# Archive Acquisition & Retrieval Protocol — Hiện Sinh

**English access rendering. The Vietnamese `ACQUISITION-RETRIEVAL.md` is canonical and governs if the versions differ.**

## 1. Core Principles and Custody Boundaries

1. **Current Token Ownership → Current Hosted Retrieval Eligibility (`CURRENT_TOKEN_OWNERSHIP → CURRENT_HOSTED_RETRIEVAL_ELIGIBILITY`):**
   - For the **Complete Package (Painting 0 / Frame 05)**: The wallet address currently holding Token 0 (Painting) or Token 5 (Frame 05) on the Base blockchain at a finalized block and satisfying ownership/authorization criteria is eligible to request a Signed URL transmitting the Complete archive package (`H_PAINTING_PACKAGE`, file `Hien-Sinh-Painting.zip`).
   - For **Standalone Frames (Tokens 1, 2, 3, 4, 6, 7, 8, 9)**: The wallet address currently holding the corresponding Token ID (`ownerOf(frameId) == requester`) is eligible to request a Signed URL transmitting the Frame practice materials package (`H_FRAME_PACKAGE`, file `Hien-Sinh-Frame-XX.zip`).
   - When a token is transferred to a new owner, hosted retrieval eligibility automatically transitions to the successor. The previous holder loses hosted retrieval eligibility immediately upon the on-chain ownership update.
2. **Hosted Retrieval Eligibility ≠ Perpetual Hosting Guarantee (`RETRIEVAL_ELIGIBILITY ≠ PERPETUAL_HOSTING_GUARANTEE`):**
   The issuance of Signed URLs via the Supabase Edge Function is an operational gallery infrastructure convenience. The gallery does not warrant or guarantee perpetual server API availability.
3. **Downloaded Purchaser Copy = Durable Custody Form (`DOWNLOADED_PURCHASER_COPY = DURABLE_CUSTODY_FORM`):**
   Upon receiving and verifying files, storing them on personal hardware and maintaining a minimum of two independent offline cold backups is the standard custody responsibility and right of the Bearer/Steward.
4. **Repeatable Hosted Retrieval (`REPEATABLE_HOSTED_RETRIEVAL = YES`):**
   A valid token holder may request a new Signed URL at any time to re-download files, provided the hosted infrastructure remains active and the requester remains the verified on-chain owner of the corresponding Token ID.

---

## 2. Package Component Definitions

### A. Standalone Frame Packages (Tokens 1, 2, 3, 4, 6, 7, 8, 9)
The transmission service delivers:
- `H_FRAME_PACKAGE` (`Hien-Sinh-Frame-XX.zip`): The Frame practice package (Frame practice template `frame-template.md`, Frame dossier/metadata, Frame visual asset, local Curator mediation substrate, trajectory template, legal schedules, per-file Frame manifest). Contains the generalized Frame practice grammar (`GENERALIZED_FRAME_TEMPLATE_P1_TO_P4`), strictly excluding the artist's genesis text instance (`ARTIST_L_INSTANCE_P1_TO_P4`).

### B. Complete Stewardship Package (Token 0 / Frame 05)
The transmission service delivers:
- `H_PAINTING_PACKAGE` (`Hien-Sinh-Painting.zip`): The complete archive of the canonical Painting, containing:
  - `H_CORE`: The canonical condensed visual embodiment (`condensed_masterpiece.png`);
  - `H_CONSTITUTIVE_SCAR`: Constitutive scar & scripts (`The_Ritual_Prompts.md`, `condense_masterpiece.py`, SVG seed vectors);
  - `H_CONSTITUTIVE_RITUAL`: Practice materials, archive map `ARCHIVE-MAP.md`, care documentation, and complete package manifests.

---

## 3. Authoritative Transmission Protocol

The token holder submits a transmission request to the `transmit-artwork` endpoint with action `transmit` (triggered automatically via the `/materials` interface upon clicking the download button).

**Endpoint:** `POST https://smapworks.art/api/transmit-artwork` (or Supabase Edge Function URL)

**JSON Payload (Example: Standalone Frame 06):**
```json
{
  "action": "transmit",
  "tokenId": 6,
  "assetType": "H_FRAME_PACKAGE",
  "address": "<YOUR_WALLET_ADDRESS>"
}
```

**JSON Payload (Example: Painting 0 Package):**
```json
{
  "action": "transmit",
  "tokenId": 0,
  "assetType": "H_PAINTING_PACKAGE",
  "address": "<YOUR_WALLET_ADDRESS>"
}
```

**Server Verification & Delivery:**
- Verifies contract bytecode hash (`EXPECTED_CODE_HASH`) and `canonicalDesignationHash` via dual RPC consensus at finalized blocks on Base;
- Verifies current on-chain ownership: `ownerOf(tokenId) == address`;
- For Painting 0: Reconciles primary acquisition authorization records (`acquisition_authorizations`) and cross-checks published archive commitment hash (`publishedArchiveCommitment`);
- Generates a **Signed URL** from the private bucket `stewardship-private-archive` with a lifetime of **60 seconds** (`SIGNED_URL_LIFETIME_SECONDS = 60`);
- Writes immutable audit entries to `transmission_audit_logs`.

---

## 4. Acceptance and Durable Custody

After downloading files locally:
1. Verify SHA-256 hashes against the package manifest (see `VERIFY.en.md §7`).
2. For Complete 05: Record the accession acceptance record into `STEWARDSHIP-ACCESSION.json`.
3. Create at least two independent offline cold backups before clearing temporary download directories.
