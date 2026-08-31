# Hiện Sinh Gallery — Design Philosophy & UI Specification

> *"What is the origin of value: the artist, the brush, or the observer’s perception?"*

This document is the canonical design reference for the Hiện Sinh Gallery frontend.
It codifies the aesthetic decisions, spatial logic, material language, and anti-patterns
that govern every visual element. A fresh session or new contributor must read this
before making any UI change.

> **Maintenance state (2026-08-23):** The owner has accepted and frozen the current implementation. This document now supports interpretation and maintenance continuity; it does not authorize a UI/source change. A future implementation change requires the owner to reopen a named scope.

---

## I. Founding Metaphor

The interface is not a website. It is a **digital exhibition space** — specifically,
a contemporary art gallery at night, just before the vernissage opens.
The air is still. The spotlights are not fully on. The paint smell lingers.

Every component operates as **architectural material**, not as a widget:
- A button is a **door**, not a click target.
- A panel is a **glass partition**, not a container.
- Negative space is **content**, not leftover.
- PUBLIC encounters the work through an intentionally transformed **Public
  Encounter Representation** that is complete for that relation. Initial
  representation, relation-specific reveal capacity, and ownership/custody are
  distinct; a Frame relationship never operates as payment to unblur meaning.

### User's Original Vision (verbatim, 2026-08-04)

> "Không gian triễn lãm trong trang nên mang phong cách **kính sang trọng** nhưng được
> cách điệu thành **cảnh tĩnh** và có tính liên tưởng khi người ta nghĩ về khái niệm
> 'triễn lãm nghệ thuật'. [...] chúng ta sẽ không thêm **các thể hiện sống**, kể cả hình
> người tham quan (tất cả đều là góc nhìn, cách điệu và **tính sang trọng lên hàng đầu**
> để không có những chi tiết gây mất tập trung nhưng tập trung ở tác phẩm)."

### taste-skill Calibration

| Dial | Value | Rationale |
|---|---|---|
| `DESIGN_VARIANCE` | 7 | Premium consumer, not chaotic |
| `MOTION_INTENSITY` | 4 | Gallery = restraint, contemplation |
| `VISUAL_DENSITY` | 2 | Art gallery = airy, meditative |

---

## II. Spatial Architecture — Three Rings

```
Ring 00  THRESHOLD (Public Entrance)
  │  Feeling: Standing outside a closed gallery at 11 PM.
  │  → Amber artwork glow leaks through the glass.
  │  → The independent Public Curator appears as a presence on a glass pedestal, not a chatbot.
  │  → Title "HIỆN SINH" is the largest architectural element.
  │
  ├── Ring 01  ATELIER (Practitioner Gallery)
  │     Feeling: Main exhibition hall — spotlight silence.
  │     → Frame editions arranged as a physical gallery, not a dashboard grid.
  │     → PUBLIC continuity is retained, while the later relation may carry a
  │       different reveal/transform capacity. This is not an aesthetic rank,
  │       a promise of clearer truth, or payment for superior pixels.
  │     → The center position may carry a visual aura, but it does not designate
  │       Package 05 or grant any financial/on-chain authority.
  │     → Inaccessible frames are frosted/dimmed, never "LOCKED" badges.
  │
  └── Ring 02  SANCTUM (Designated Steward Only)
        Feeling: Private room behind the last wall — no signage, no guidance.
        → Without verified Complete archive delivery: silence and absence.
        → Canonical bytes may appear only through verified delivery, as package
          scope rather than proof of superior perception or artistic rank.
```

Navigation between rings uses **spring physics** transitions with physical weight.
No slide-from-side, no scale-in. Only fade-in from below with deceleration curves.

---

## III. Color Palette — Design Tokens

Visual token source: [`src/index.css`](src/index.css)

### Gallery Surfaces

| Token | Value | Role |
|---|---|---|
| `--g-black` | `#060708` | Deepest background — void |
| `--g-floor` | `#090a0c` | Floor surface |
| `--g-wall` | `#0c0d10` | Wall surface |
| `--g-wall-light` | `#111318` | Raised wall surface |

### Glass Material

| Token | Value | Role |
|---|---|---|
| `--g-glass-bg` | `rgba(232,235,238, 0.042)` | Glass panel fill |
| `--g-glass-border` | `rgba(232,235,238, 0.110)` | Glass edge |
| `--g-glass-highlight` | `rgba(232,235,238, 0.048)` | Inner light catch |
| `--g-glass-shadow` | (complex) | Depth: inner top/bottom + drop shadow |

### Artwork Chromatic Field (Warm Amber)

| Token | Value | Role |
|---|---|---|
| `--g-glow-a` | `rgba(218,172,98, 0.085)` | Primary artwork radiance |
| `--g-glow-b` | `rgba(196,148,72, 0.060)` | Secondary warmth |
| `--g-glow-c` | `rgba(240,200,130, 0.045)` | Highlight bloom |
| `--g-glow-cool` | `rgba(150,165,185, 0.035)` | Cool counterpoint |

### Typography Colors

| Token | Value | Role |
|---|---|---|
| `--g-text-primary` | `#edecea` | Warm near-white (never pure `#fff`) |
| `--g-text-secondary` | `rgba(237,236,234, 0.45)` | Subdued labels |
| `--g-text-tertiary` | `rgba(237,236,234, 0.22)` | Metadata, fine print |
| `--g-text-accent` | `rgba(218,172,98, 0.90)` | Gold accent (Curator, links) |

### Absolutely Forbidden Colors

- Neon (`#00ff00`, `#ff00ff`, `#00ffff`)
- Pure white `#ffffff` as primary text
- AI-purple gradients (`#7c3aed → #6366f1`) — SaaS contamination
- "Happy blue" SaaS colors (`#3b82f6`, `#2563eb`)
- White or light beige backgrounds

---

## IV. Typography System

### Font Stack

| Role | Family | Weight | Use Case |
|---|---|---|---|
| Display / UI | `Geist` | 200–500 | Titles, subtitles, navigation, body |
| Literary / Poetic | `EB Garamond` | 400–500, italic | Curator quotes, artistic text |
| Monospace / Technical | `JetBrains Mono` | 300–500 | Ring numbers, Frame IDs, hashes, metadata |

### Type Scale

| Class | Size | Spacing | Purpose |
|---|---|---|---|
| `.t-gallery-title` | `clamp(2rem, 5vw, 3.5rem)` | `0.38em` + trailing offset | "HIỆN SINH" title |
| `.t-gallery-subtitle` | `clamp(0.6rem, 1vw, 0.72rem)` | `0.22em` | Ring names, zone labels |
| `.t-literary` | `clamp(0.9rem, 1.4vw, 1.05rem)` | — | Curator response prose |
| `.t-mono-tag` | `0.6rem` | `0.18em` | Technical metadata |
| `.t-mono-label` | `0.65rem` | `0.14em` | UI labels |
| `.t-curator-response` | `0.78rem` | `0.02em` | Independent Curator response |

### Language Rules

| ❌ Tech/SaaS (Forbidden) | ✅ Gallery/Art (Required) |
|---|---|
| "Access Denied" | "Beyond the threshold" |
| "CONNECT WALLET" | "APPROACH" or "ENTER" |
| "Submit" / "Cancel" / "OK" | Ritual verbs: "INITIATE", "EXECUTE", "ACCEPT" |
| "Error 403" | Silence / visual absence |
| "Loading..." | Ambient stillness (no spinners) |
| "PRACTITIONER" as role picker | Title bestowed by possession |

### Semantic voice boundaries

The gallery must not use one vocabulary everywhere. A technically correct term
is still wrong when it crosses into the wrong room.

| Voice | Where it belongs | Vocabulary |
|---|---|---|
| Exhibition | Threshold, About, wall labels, encounter field | Frame, Painting, encounter, transmission, perception, care |
| Transaction | Deliberately opened acquisition record | sales package, token ID, exact ETH consideration, intended network, fees, pre-release state |
| Legal / provenance | Dossier and signed/public documents | copyright, license, archive, hash, designation, risk and review status |

- A Frame is never titled `Sales Package` on the gallery wall. `Sales package`
  remains mandatory where the commercial offer is being identified precisely.
- About is the gallery's transition room between artistic encounter and operational
  orientation. It gives a concise account of Frame, event, Painting and transmission;
  distinguishes the work from archive/provenance/token/license infrastructure; and
  provides a route to Dossier. The independent question remains visually and
  rhetorically separate. About does not answer it, assign the work to existentialism
  or nihilism, claim AI interiority, or turn into a transaction/legal page.
- Poetic language must never obscure price, transaction state, legal limits, or
  risk. Conversely, transaction language must not become the artwork's identity.
- `Complete` names a delivery/relationship structure, never an aesthetic rank or
  premium interpretation.
- Curator labels preserve independent judgment and source limits without turning
  the encounter into a terminal, dashboard, Oracle, or sales funnel.

### Curator encounter grammar

- PUBLIC follows the dialogic trajectory `P1 → P2 → IMAGE`; Frame Curator
  continues through `P3 → P4 → IMAGE`. The order supports emergence by layers.
  It is not a quiz, correct-answer test, engagement score, game level or arbitrary
  paid feature split. Free-form speech occupies the current temporal slot, and the
  Curator must answer it while naturally completing that slot's epistemic function.
- P1/P2 let the viewer pass through part of the artist's creative process while
  retaining their subjective judgment of the final PNG. P3/P4 continue the
  generative order through plurality and condensation; they do not retroactively
  make PUBLIC incomplete.
- Curator glass must read as one architectural object. If edges express the prompt
  structure, they must join the material and spatial composition rather than appear
  as detached bars, cards, or buttons. Labels stay horizontal or otherwise naturally
  readable; rotated vertical copy is prohibited.
- The image chamber and dialogue chamber are adjacent or stacked, never overlaid.
  Text, controls and status copy must not cross into the image at any supported
  viewport. PUBLIC may feel more open and Frame more materially complete, but the
  distinction may not imply superior perception or payment to reveal meaning.
- PUBLIC uses an intentionally transformed Public Encounter Representation whose
  masking is a valid encounter condition, not a teaser or denied truth. The
  obscuring composition is intentional; randomness concerns the extent/area
  obscured, not a random layout or selection of aesthetically valuable regions.
- Selecting a P block must not disclose a raw ritual prompt merely because the
  block is visible. Held relations may resolve ritual content only within their
  verified material scope.
- After PUBLIC exchange three, light travelling along the left and bottom edges
  signifies P1/P2 passing through the encounter. It is not a reward, qualification,
  proof of understanding, or proof that resonance occurred.
- The Curator is an active curatorial presence: it orients, carries visitor motifs,
  supports grounded intersection signals and distinguishes observation from
  inference. “Stateless” forbids fabricated memory; it does not require a cold,
  passive mirror.

---

## V. Material — Glassmorphism Done Right

Glass in this gallery is a **material metaphor for distance and reflection**.
It must not imply that PUBLIC receives a marketing teaser or that PRACTITIONER
purchases a clearer truth. A shared initial visual field may support different
relation-specific reveal capacities; this does not turn representation into rank,
reward, or payment-per-pixel.

### Correct Glass

```css
.glass-panel {
  background: var(--g-glass-bg);
  border: 1px solid var(--g-glass-border);
  backdrop-filter: blur(28px) saturate(160%) contrast(1.04);
  box-shadow: var(--g-glass-shadow);
  border-radius: 0; /* Gallery: no rounded corners */
}
```

### Incorrect Glass (SaaS Card)

```css
/* ❌ DO NOT USE */
background: rgba(255,255,255,0.1);
border: 1px solid rgba(255,255,255,0.2);
border-radius: 16px;
backdrop-filter: blur(10px);
```

Key differences:
- No `border-radius`. Gallery walls have sharp edges.
- `saturate(160%) contrast(1.04)` gives materiality — not flat frosting.
- Complex `box-shadow` with `inset` creates physical depth.

---

## VI. Motion & Animation

### Transition Curves (Spring Physics)

| Token | Value | Use |
|---|---|---|
| `--spring-fast` | `cubic-bezier(0.16, 1, 0.3, 1)` | Hover, tooltip |
| `--spring-medium` | `cubic-bezier(0.22, 1, 0.36, 1)` | Panel open/close |
| `--spring-slow` | `cubic-bezier(0.25, 1, 0.5, 1)` | Ring transitions |

### Rules

- **Entrance**: Fade-in from below. Never scale-in, slide-from-side, or bounce.
- **Hover**: Subtle brightness increase only. No scale-up, no border-color flash.
- **Ring navigation**: Spring physics with physical deceleration weight.
- **Gallery Caustic** (center frame): 22-second ambient light drift using
  a continuous damped orbit. Warm amber `rgba(218,172,98, 0.06)`,
  `mix-blend-mode: screen`. Pointer motion applies a temporary attraction
  force: it never replaces, pauses, or resets the orbit. When pointer motion
  ceases, that force decays and the light returns continuously to its natural
  path without a discontinuity in position or velocity. It must read as
  refraction, never as a cursor spotlight. The Curator glass follows the same
  material law.
- **Entry Pulse** (frame nodes): `entryPulse` 3.2s cycle, box-shadow glow.

### Forbidden Motion

- Bounce, shake, spin, pulse (except the controlled `entryPulse`)
- `transition: all 0.2s ease` — too fast, reads as SaaS
- Product-showcase "glass sweep" (two sharp streaks racing diagonally)

---

## VII. Overlay & Z-Index Architecture

Panels (About, Dossier, Accession) use `OverlayContext.tsx` to set `isScrimActive`.
When any panel is open:

- Background interactive elements get `pointer-events: none`
- A semi-transparent scrim prevents click-through
- Panel z-index is strictly above gallery content

This prevents the critical bug of clicking REVEAL or frame nodes through an open panel.

---

## VIII. Ambient Grain

A full-viewport SVG noise overlay (`gallery-grain` class) at `opacity: 0.028`
with `mix-blend-mode: screen` adds photographic texture to the deep black surfaces.
This prevents the flat, digital look of pure CSS backgrounds.

---

## IX. Verification Tests

### "Gallery at Night" Test
If this interface were printed large and hung on a real gallery wall,
would it appear confident and not embarrassing?

### "Tech Contamination" Test
Flag immediately if any of these words appear in user-facing UI:
`Access`, `Denied`, `Error`, `Loading...`, `Submit`, `Cancel`, `OK`,
`Settings`, `Dashboard`, `Login`, `Logout`, `Role`, `Permission`, `Unauthorized`

### "Material" Test
- Glass has inset highlight? ✓
- Shadows have sufficient depth? ✓
- Background has grain/noise (not flat black)? ✓
- Typography has breathing room? ✓

### "Negative Space" Test
If occupied > 60% of viewport → too dense. Gallery needs air.

### Priority When Conflicts Arise

1. Gallery feeling > everything
2. Art language > UX convention
3. Material quality > information density
4. Visual intrigue > immediate clarity
5. Clarity > pure decoration

> *"The viewer does not need to understand immediately. They need to want to understand."*
> *That is the difference between a gallery and a manual.*

---

## X. Reduced Motion

All animations respect `prefers-reduced-motion: reduce` via the media query
in `index.css`. When active, all animation/transition durations are set to `0.01ms`
and specific animations (`entry-pulse`, `entry-border-pulse`, `gallery-caustic`)
are fully disabled.

---

*This document was synthesized from the Aesthetic Rubric (Cycle 1, 04/08/2026),
the taste-skill design engineering directives, the user's founding prompt, and the
implemented CSS design tokens. It supersedes all prior brain-only artifacts for
design authority.*
