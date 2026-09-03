# Care, accession, and succession

**English access rendering. The Vietnamese `CARE-AND-SUCCESSION.md` is canonical and governs if the versions differ.** This is practical guidance, not a substitute for legal terms, smart-contract rules, or professional security advice.

## 1. Three states that must remain distinct

| State | Minimum evidence | Precise description |
|---|---|---|
| Frame-only sales package | valid corresponding token and delivery | practitioner-bearer of the Frame in that sales package |
| Package 05 Token transferred, archive not yet accepted | on-chain designation or transfer | designated successor; accession incomplete |
| Complete archive delivered and verified | Package 05 Token + archive + hash/provenance verification | designated steward archive; lived stewardship remains uncertifiable |

Someone holding an archive copy without evidence of designation has **custody evidence**, not automatic designated stewardship.

## 2. Primary accession

Initial sequence:

```text
Encounter with the shared Public Encounter Representation
→ three brushstrokes anchored in that representation
→ Artist confirms evidence of encounter, not a “correct answer”
→ signed Stewardship Invitation
→ direct acquisition of Package 05 for 4.29 ETH
→ on-chain designation
→ Complete Stewardship Archive delivery
→ hash and provenance verification
→ voluntary Charter acknowledgement
→ signed Accession Record
```

### Three brushstrokes

Each brushstroke anchors itself in a specific detail of the Public Encounter Representation and offers an observation or reading that could not be applied mechanically to every image. It may be critical, contradictory, or non-resonant. It does not require prior viewing of the canonical Painting or a promise to accept stewardship.

The Artist confirms only evidence of a non-superficial encounter, not agreement. The brushstrokes:

- do not test belief about AI;
- do not enter packages, token metadata, or Curator memory;
- are private by default;
- may be published only through consent and a separate later release.

## 3. Accepting the Complete Stewardship Archive

The recipient:

1. compares package type and release ID;
2. checks that manifest and filesystem agree;
3. calculates every file’s SHA-256;
4. checks `H_CORE`, `H_CONSTITUTIVE`, and the archive commitment;
5. verifies persona signature, wallet signature, and timestamp;
6. checks contract, token ID, and designated bearer;
7. records results in `STEWARDSHIP-ACCESSION.json`;
8. creates two independent backups before deleting temporary transport copies.

If manifest and filesystem conflict, stop. Do not infer that missing files will be “unlocked later.”

## 4. Periodic care

Every six or twelve months:

- check media health;
- run hash verification;
- test restoration from at least one backup;
- confirm that the public provenance root remains accessible;
- record date, tool, and result;
- never edit an old manifest.

A format migration creates an access derivative without replacing canonical bytes. If carrier or archive structure must change, issue a new annex/version linked to the prior release.

## 5. Secondary succession

```text
Complete Package token #05 transfer
→ designated successor
→ archive delivery
→ hash/provenance verification
→ Charter acknowledgement
→ Succession Record
```

- The three brushstrokes are not repeated.
- Artist approval is not required.
- There is no Painting-only delivery; the successor receives the Complete archive containing Frame and Painting.
- Before archive acceptance, status is `accession incomplete`.
- The contract records a designated bearer; it does not certify lived stewardship.

## 6. Minimum record

An Accession/Succession Record should contain:

```text
chainId
contract
tokenId
releaseId
packageHash
designatedBearer
eventTime
priorRecord
verificationResult
acknowledgementStatus
signatures
```

It does not contain private reactions, the three brushstrokes, “breath,” or conclusions about AI consciousness.

## 7. Loss, damage, and provenance incidents

- Never replace files silently.
- Preserve an incident record.
- Restore only from a matching-hash copy where possible.
- If canonical bytes cannot be restored, disclose that state; a reconstruction does not automatically become canonical.
- For impersonation or unauthorized publication, the operator issues a signed `PROVENANCE-INCIDENT` linking the prior commitment, unauthorized trace, and corrective designation.
- Ontology and cryptography do not replace legal advice or dispute-resolution procedures.
