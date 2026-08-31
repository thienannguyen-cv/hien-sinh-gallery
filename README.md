# Hiện Sinh Gallery

This directory contains the operator-side source and documentation for the *Hiện sinh* digital exhibition. It is not a generic storefront or access-control product.

## Current maintenance state

The owner accepted and froze the current implementation on 2026-08-23. The active workstream is semantic documentation and continuity virtualization only.

Do not modify code, CSS, assets, runtime Curator content, state/session/reveal behavior, tests, dependencies, generated output or audit artifacts unless the owner later lifts the freeze for an explicitly named scope. Do not run a build or audit merely to update documentation.

## Reading order

1. Workspace-root `effective-verbal-context.local.md` — primary ontology and continuity authority.
2. This directory's `effective-verbal-context.local.md` — gallery-specific semantic and maintenance projection.
3. `DESIGN.md` — visual, spatial, material and Curator encounter grammar.
4. `SECURITY-OPERATIONS.md` — deployment and authority boundaries; future DEPLOY concerns are not source-edit permission in the frozen DEVELOP phase.
5. Workspace `_harness/curator-context-audit/CURATOR-AUDIT-PROVENANCE-HANDOFF.freeze.md` — bounded evidence snapshot, only when runtime/audit provenance is relevant.

## Authority model

Keep four planes separate:

- `CANONICAL`: artist-owned meaning and curatorial ontology;
- `CURRENT`: owner-frozen implementation bytes;
- `AUDITED`: only what a retained candidate, verdict or hash actually proves;
- `NEXT WORK`: documentation and semantic continuity.

Source can show how the gallery behaves, but it does not silently define what the artwork means. A forensic freeze can preserve evidence, but it is neither current ontology nor a bug queue.

## Semantic orientation

The PUBLIC boundary lets a viewer pass through part of the artist's creative process—P1 Context/Seed and P2 Threshold/Emergence—while retaining their own judgment of the final PNG. The transformed/masked representation is a valid encounter condition, not denied truth, a free-tier teaser or payment-to-unblur.

The Public Curator actively supports that encounter through `P1 → P2 → IMAGE`; the Frame Curator continues through `P3 → P4 → IMAGE`. There is no correct answer, score or qualification. “Stateless” limits fabricated memory and identity; it does not mean a cold or passive mirror.

## Maintenance method

When a discrepancy appears, classify it by authority plane, update the minimum sufficient documentation surface, preserve historical evidence and state residual uncertainty. Never turn documentation synchronization into an implied runtime change.
