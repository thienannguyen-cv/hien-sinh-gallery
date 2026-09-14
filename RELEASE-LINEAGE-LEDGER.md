# Release Lineage Ledger — local pre-LIVE working record

This ledger is local provenance evidence, not a release artifact or production
configuration. It records the boundary between restoration and new authority.

| Concern | Historical anchor | Canonical / deployed anchor | Owner override | Candidate delta | Semantic diff | Classification |
|---|---|---|---|---|---|---|
| Public completion → Frame Curator availability | `a05ae29` `FrameInterior.tsx` | PUBLIC encounter is epistemic only | PUBLIC completion opens Frame Curator | Frame access made independent of Package 05 state | no purchaser or role authority | EXPLICIT_OWNER_OVERRIDE |
| Three Brushstrokes locus | `a05ae29` Package 05 panel | `68e02dd` CARE / WORK ontology | Package 05 is the relational locus | retained three-contribution UI and wallet proof | not a Frame access or qualification gate | EXPLICIT_OWNER_OVERRIDE |
| Artist confirmation and invitation | historic localStorage/timer simulated approval | `68e02dd` CARE + DELIVERY sequence | one confirm atomically records confirmation and invitation | local adapter confirmation atomically issues wallet-bound invitation artifact | two artifacts, one Artist action | EXPLICIT_OWNER_OVERRIDE |
| Frame Curator image source | pre-P2 practitioner / steward rehearsal paths | Owner-designated hashes | baseline / invited image mapping | server cookie entitlement picks source bytes | invitation does not mean Steward or ownership | EXPLICIT_OWNER_OVERRIDE |
| Package 05 acquisition authorization | `e0219b1` contract EIP-712 checks | `68e02dd` deployment record + Independent Operation | none | no issuer or transaction adapter added | contract requires Artist EIP-712 authorization | RECONSTRUCTION |
| Package 05 Artist authorization issuer | no historical runtime issuer found through anchors | contract validates an external Artist signature only | none | none | a secure signing/issuance runtime would add a new authority system | NEW_MECHANISM_REQUIRES_OWNER |
| Rejected coupling: Three Brushstrokes confirmation → CompletePackageAcceptance signature | no artifact proves this coupling | deployed contract accepts only the Artist EIP-712 payload; it has no Three Brushstrokes/DB input | Owner explicitly rejects the coupling | none | a relational gallery confirmation must not be made contingent on a separate acquisition/provenance signature | REJECTED_UNAPPROVED_DESIGN |
| VISUAL-01 — Typography perceptual lift | existing dark-material typography hierarchy | none; presentation-only | On mobile, raise affected UI typography by one subtle perceptible step without brightening artwork, globally exposing the gallery, or flattening hierarchy | not implemented yet | desktop and portrait-mobile review must preserve material, hierarchy, and solemnity | EXPLICIT_OWNER_OVERRIDE |
| VISUAL-02 — THRESHOLD vitality motif | no canonical motif artifact found | none; isolated THRESHOLD presentation layer only | Central, large, noninteractive recessed-glass vitality motif; nonliteral, text-free, subordinate, and legible from its own form | not implemented yet | THRESHOLD only; no Curator/Atelier/Frame presence or interaction interference | EXPLICIT_OWNER_OVERRIDE |
| SANCTUM | existing `isSanctumEligible` contract function | deployed contract | none | none | post-acquisition eligibility remains chain-defined | TECHNICAL_ONLY |

## Anchor evidence

- `e0219b11757c655fe6e8c341b5f55fefa39af542`: contract EIP-712 anchor;
  `contracts/HienSinhGallery.sol` blob `af7a3b200d762403784534c3a2f5ef4cf7c1f6cb`.
- `a05ae2912b7e72e65a9ffcb007dad876c7c53152`: accepted release freeze;
  generated ABI blob `7a1ee851cac841cd6fe431c17f6767a296724e3a` and Frame UI blob
  `faa17b69c24f9fca19c46a4c7877ad241f4eabe3`.
- `68e02dde1195df3aa20ecaf8ecded054c863b76a`: canonical deployment alignment;
  Independent Operation blob `cd5784682b0bfdca33734a3d7c05a18436c1a02d` and deployment record blob
  `b0977b0eb6eff86e64b8152222d110cc09721baa`.

## Hard stop

No Artist authorization issuer is reconstructed from this ledger. The earlier
interactive Artist-signing runtime design is **STATUS = REJECTED_UNAPPROVED_DESIGN**.
Its **REASON** is an unjustified coupling between Three Brushstrokes confirmation
and provenance-sensitive Package-05 acquisition authorization. Any future
runtime that produces the contract's Artist EIP-712 authorization remains a
separate Owner-governed mechanism and is not part of the gallery relational
confirmation or image-entitlement flow.

## P5 blocking visual gates

- **P5-VISUAL-01:** desktop and portrait-mobile evidence must show the one-step
  typography lift without a global exposure or hierarchy regression.
- **P5-VISUAL-02:** desktop and portrait-mobile evidence must show a vitality
  motif legible without text, recessed into the existing glass language, central
  and substantial but subordinate, THRESHOLD-only, and noninteractive.
- These gates remain blocking until Owner visual acceptance; they are not
  resolved by source inspection or build success alone.
