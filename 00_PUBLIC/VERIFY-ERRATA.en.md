# Public Errata — Verification Document

**Original document being corrected:** `VERIFY.md` / `VERIFY.en.md` (Sections 3, 3b and 7).

**Governance notice:** The Vietnamese version of this errata (`VERIFY-ERRATA.md`) is canonical. This English version is provided for access only and does not govern in case of discrepancy.

**Nature of this document:** This is an additive-only errata log. Each future correction to the verification document will append a new, dated entry below; no entry is ever deleted or overwritten. The original text of `VERIFY.md` / `VERIFY.en.md` is left unchanged; where it differs from this errata on the points below, this errata governs. The effect of each entry on the provenance milestones is stated separately at the head of that entry.

---

## Entry — 2026-10-20

**Method producing this entry:** Recomputing SHA-256 digests from the files in the public repository and comparing them with `ROOT-COMMITMENTS.json`, the on-chain table in Section 4 of VERIFY, the OpenPGP signature and the OpenTimestamps proofs; cross-reading the text of the documents against one another; and scanning every tracked file and the full commit history of the `main` and `for-safe-buy-only` branches. The review was carried out in an AI-assisted session (Claude). Line numbers below refer to `main` at commit `983c740` (2026-10-18).

**Effect on provenance:** None. The provenance milestones stand and can be re-checked with the steps in Section 3b of VERIFY (for the timestamp of the detached signature, see correction 3): `ORIGIN-PROVENANCE.json` (659 bytes, SHA-256 `dac2aef97c0427b428077a1b7fdedb8b07164657532ae93c5b74e851708eba9e`) matches its OpenTimestamps proof; the OpenPGP signature is valid for key `D15945BC094633BA1725798C4BD38CB4049EB5D8`; both `.ots` files carry Bitcoin attestations at blocks 965149 and 965152. The three corrections below amend only descriptive and procedural text in VERIFY, which is not one of the two sealed objects (`ORIGIN-PROVENANCE.json` and its detached signature). The two incorrect values (corrections 1 and 2) entered the public repository only after the sealing: commit `68e02dd` on 2026-09-03 and commit `44a16bf` on 2026-09-21, whereas the sealing took place on 2026-09-02. This errata therefore does not alter, replace or weaken the sealed provenance.

### 1. Hash of `CANONICAL-DESIGNATION.md` (Section 3)

**As published:** `VERIFY.md:27` and `VERIFY.en.md:27` — in the list of values said to be published by `ROOT-COMMITMENTS.json` — give the hash of `CANONICAL-DESIGNATION.md` as `802ac7d36bc4ab5eadc31fee80266b5efb6b2d839144a45ff3d28f3e89cc2a9b`.

**Correction:** The SHA-256 of `CANONICAL-DESIGNATION.md` is `ed740b4339af1e965723519c7807b5a6184da0f4963f4866d42661ef85cf083f`. This is the value (a) published by `ROOT-COMMITMENTS.json` at `canonical_designation.sha256`, (b) listed in the table in Section 4 of VERIFY itself as the on-chain `canonicalDesignationHash` (`0xed740b43…083f`), and (c) obtained by hashing the file directly. The value `802ac7d3…` is a mistake: it does not correspond to any revision of the file (nor to a line-ending variant of it) and is withdrawn.

**Unaffected:** `CANONICAL-DESIGNATION.md`, `ROOT-COMMITMENTS.json` and the value recorded on-chain.

**Scope:** In the public repository, `802ac7d3…` appears only on the two lines above. It was added in commit `68e02dd` (2026-09-03) and has not changed since; it is present in commit `c08a9f24e3d17bd93007bb45dd332b72b46043f0` (the commit that Section 4 of VERIFY lists as the Release Git Commit Hash) and on both the `main` and `for-safe-buy-only` branches. No other tracked file contains this value.

**Resulting standard practice:** Verifiers use `ed740b43…` as the hash of `CANONICAL-DESIGNATION.md`:

```bash
sha256sum 00_PUBLIC/CANONICAL-DESIGNATION.md
# ed740b4339af1e965723519c7807b5a6184da0f4963f4866d42661ef85cf083f
```

and compare it with `canonicalDesignationHash()` on-chain using the `cast call` command in Section 4 of VERIFY. Any reference to `802ac7d3…` is to be treated as no longer in force.

### 2. `H_STEWARDSHIP_ARCHIVE` in Section 7, step 5

**As published:** `VERIFY.md:185` and `VERIFY.en.md:185` (Section 7, step 5) give `H_STEWARDSHIP_ARCHIVE` as `7689f75005b45a230ca30e14db8cb580e0c0349a6566d5bf8284534fce1ec77d`.

**Correction:** The value of `H_STEWARDSHIP_ARCHIVE` is `7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9`, as given by `ROOT-COMMITMENTS.json`, Section 3 of VERIFY, `PROVENANCE` and `INDEPENDENT-OPERATION`. The value in Section 7 is withdrawn. The controlling reference remains `ROOT-COMMITMENTS.json`, as the first sentence of step 5 already states.

**Scope:** The incorrect value was added in commit `44a16bf` (2026-09-21), after the release commit `c08a9f24` named in correction 1; it is present on `main` and absent from `for-safe-buy-only`. No other tracked file contains it.

**Resulting standard practice:** When accepting Package 05 Complete, compare the reconstructed package root with `H_STEWARDSHIP_ARCHIVE` in `ROOT-COMMITMENTS.json` (and, after primary acquisition, with `designatedArchiveCommitment()` on-chain), not with the value in parentheses in step 5.

### 3. Timestamp of the detached signature `ORIGIN-PROVENANCE.json.asc` (Section 3b, step 3)

**Stands:** The Bitcoin attestations at blocks 965149 and 965152 in both `.ots` files, the OpenPGP signature (key `D15945BC094633BA1725798C4BD38CB4049EB5D8`) and `ORIGIN-PROVENANCE.json` (659 bytes, SHA-256 `dac2aef97c0427b428077a1b7fdedb8b07164657532ae93c5b74e851708eba9e`) are as published.

**Addition:** Step 3 of Section 3b instructs running `ots verify 00_PUBLIC/ORIGIN-PROVENANCE.json.asc.ots` without stating that this proof stamps the form of the detached signature with CRLF line endings (273 bytes, SHA-256 `d3f752ec79be616ac720a2e429919e243950d15d69fb0df91da8abb55c845f95`). The copy stored in the Git repository uses LF line endings (265 bytes, SHA-256 `183dcba8b80e17030b4f228425a239fe2b0a16634bd6b2d9946549ca3da28b85`), so a checkout that preserves LF (as on Linux) will not match the stamped digest when `ots verify` is run. The OpenPGP signature is valid in both forms; only the digest that the OpenTimestamps proof stamped differs.

**Resulting standard practice:** To check the timestamp of the detached signature, rebuild the CRLF form in a temporary directory and then run `ots verify`:

```bash
mkdir ots-check
cp 00_PUBLIC/ORIGIN-PROVENANCE.json.asc.ots ots-check/
perl -pe 's/\n/\r\n/' 00_PUBLIC/ORIGIN-PROVENANCE.json.asc > ots-check/ORIGIN-PROVENANCE.json.asc
sha256sum ots-check/ORIGIN-PROVENANCE.json.asc
# d3f752ec79be616ac720a2e429919e243950d15d69fb0df91da8abb55c845f95
ots verify ots-check/ORIGIN-PROVENANCE.json.asc.ots
```

---

*Future entries will be appended below in chronological order; no existing entry above is ever overwritten.*
