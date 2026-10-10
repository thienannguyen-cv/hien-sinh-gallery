# Public Errata — Security Audit Disclosure

**Original document being corrected:** `SECURITY-AUDIT-DISCLOSURE.md` / `SECURITY-AUDIT-DISCLOSURE.en.md`, and Section 8.3.2 of the *Hiện Sinh — Whitepaper / Protocol Dossier*.

**Governance notice:** The Vietnamese version of this errata (`SECURITY-AUDIT-DISCLOSURE-ERRATA.md`) is canonical. This English version is provided for access only and does not govern in case of discrepancy.

**Nature of this document:** This is an additive-only errata log. Each future periodic audit will append a new, dated entry below; no entry is ever deleted or overwritten. The original "Threat Score 98.5/100 — LOW RISK" conclusion and the original False Positive / Architectural Intent / Security Pinning classifications in the corrected document are **not reversed** by any entry below — these corrections add completeness and precision; they do not negate the core conclusions.

---

## Entry — 2026-10-08

**Method producing this entry:** Zero-Priming Protocol (a supplementary independent review), using an isolated-context AI review session, cross-referenced against the original SolidityScan findings and the resolutions published in Section 8.3.2 above.

**Full session record (verbatim instructions and responses):** [INSERT SESSION SHARE LINK HERE]

### 1. C001 — "CONTROLLED LOW-LEVEL CALL" (addition, not a reversal)

**Stands:** The False Positive conclusion is correct for the risk it evaluated — no arbitrary-address redirection is possible, since `treasury` is immutable and the other leg always pays the actual `currentOwner` (`msg.sender`).

**Addition:** This conclusion does not address a separate, independent risk at the same locations (`withdraw()`, and both `.call{value: ...}("")` legs in `executeSuccession()`): if `treasury` or a successor's wallet cannot receive a plain ETH transfer (no working `receive()`/`fallback()`), the corresponding call reverts, with **no fallback mechanism or recovery path**. Because ordinary transfers of Token 0 (the Painting) are disabled once `paintingPrimaryReleased = true`, the consequence for `executeSuccession()` can be a **permanent inability to transfer the Painting again**, for as long as the affected address remains in that state.

**Resulting standard practice:** The Buyer Operational Safety Checklist should add a verification step — before calling `executeSuccession()`, the current owner should confirm the recipient's wallet can successfully receive a plain ETH transfer; before holding Token 0 in a smart-contract wallet, confirm it has a working `receive()`/`fallback()`. This should become a standard precondition for every future succession, not a one-time note.

### 2. C002 — "ERC721 SAFEMINT REENTRANCY" (rationale correction, conclusion unchanged)

**Stands:** The safety conclusion is correct for 2 of the 4 `_safeMint` call sites — in `mintFrame()` and `acquireCompletePackage()` — for the reasons originally given (CEI, `nonReentrant`, `FrameAlreadyMinted`).

**Correction:** The published rationale **does not apply** to the remaining two sites — the two `_safeMint` calls in the constructor (Token 0 and Token 6, at deployment). The constructor carries no `nonReentrant` guard, and `totalMinted` is only set after both mints complete, so `FrameAlreadyMinted` offers no protection there either. These two sites are nonetheless safe, for a different reason: during constructor execution the contract itself has no deployed runtime code, so any reentrant callback (via `onERC721Received`) reaches an address with no code and cannot execute.

**Resulting standard practice:** When a single finding spans multiple code sites with different protective properties, future periodic audit reports should state the applicable safety rationale separately per site, rather than applying one combined justification across all instances.

### 3. C003 — "INCORRECT ACCESS CONTROL" (description correction, conclusion unchanged)

**Stands:** The "Architectural Intent" conclusion — no contract-level admin/owner role — is accurate and remains the correct description of the overall design.

**Correction:** The published "permissionless" label is accurate for `mintFrame()` (callable by any address paying the correct amount) but **not accurate** for `executeSuccession()`, which requires `msg.sender == currentOwner` and reverts for any other caller with `UnauthorizedSuccessorCaller()`. `executeSuccession()` is caller-gated; what is genuinely absent is a contract-level *admin* role able to override that gate — these are two distinct claims.

**Resulting standard practice:** Future disclosure tables should distinguish "no privileged admin/owner role" from "no caller-level access control," to avoid conflating the two.

### 4. H001 — "REENTRANCY" (description correction, core conclusion unchanged)

**Stands:** `nonReentrant` correctly prevents `executeSuccession()`/`acquireCompletePackage()` from reentering each other or themselves; no path to unauthorized fund extraction was found through this route.

**Correction:** The "strictly locked" description overstates the scope of protection — `withdraw()` and `mintFrame()` do not carry `nonReentrant`. A traced cross-function path exists: a callback triggered during `executeSuccession()`'s first payment leg (to `treasury`) can call `withdraw()`, sweeping the contract's balance — including the seller's not-yet-paid proceeds — before the second leg runs; the second leg then fails (insufficient balance), reverting the whole transaction, including the reentrant withdrawal. No value is actually extracted through this path, but it can be repeated to reliably block every `executeSuccession()` attempt — a denial-of-service on Painting succession, contingent on `treasury`'s own callback behavior.

**Resulting standard practice:** `treasury` should be maintained as a plain receiving address, without custom logic capable of triggering unrelated contract calls on receipt — an operational constraint recommended for whoever controls that address, not a code change.

---

*Future entries, from subsequent periodic audits, will be appended below in chronological order; no existing entry above is ever overwritten.*
