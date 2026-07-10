```
PACKET ID: RPG-20260708-02
PROJECT:   Bali Life RPG
TARGET:    Codex
REASONING: high — cross-system touch-input behavior where TypeScript passes but the product loop can still be broken on a phone; requires investigation, not just edits
TITLE:     Mobile playability pass — Act 0 completable by touch, link-preview polish
PR TAG: [RPG-20260708-02]

===== BEGIN PACKET RPG-20260708-02 =====

ROLE & SCOPE
The public URL will be shared in WhatsApp; most Canggu recipients will open it
on a phone. Touch controls exist and were bounds-checked long ago, but every
surface added since (interiors, morning hand, day ledger, cutscene skip,
relationship-choice panels, the race, the payout celebration, the meter-diet
reveal, RPG-20260708-01's title screen if it has landed) has never been proven
under touch. If the first stranger hits a wall in minute two on an iPhone, the
whole outside-feedback plan dies silently. Audit, then fix.

HARD CONSTRAINTS
- No gameplay/economy/schema changes. This is input, viewport, and
  presentation repair only. Where a real gameplay blocker is found that can't
  be fixed input-side, document it in the PR rather than redesigning systems.
- Test viewports: 390x844 (iPhone-class) and 360x800 (Android-class),
  portrait, via browser device emulation; note honestly in the PR that real-
  device verification by a human is still pending.
- Keep desktop behavior byte-identical where code paths are shared.

DELIVERABLES
1. AUDIT FIRST, fixes second: walk the full Act 0 path (boot -> Ibu Sari ->
   BAKED pickup -> villa dropoff -> cafe station -> sleep) plus one Act 1
   morning (hand -> board delivery -> ride checkpoints -> payout) under touch
   emulation at both viewports. Produce a findings table (surface, works/
   broken, fix applied) in the PR description.
2. Fix every touch-blocking finding: unreachable/overlapping controls,
   panels exceeding viewport, dialogue/cutscene advance and skip without a
   keyboard, race concede without ESC, joystick vs. new overlay conflicts.
3. Viewport hardening in index.html/CSS: correct viewport meta, safe-area
   insets, disable double-tap zoom and pull-to-refresh rubber-banding over
   the canvas, sane orientation-change/resize behavior (a "rotate for best
   experience" hint is acceptable; a broken canvas is not).
4. Link-preview polish so the shared URL looks intentional in WhatsApp:
   proper <title>, meta description, theme-color, a procedural favicon
   (finally kills the known 404), and static og:title/og:description +
   one committed og:image (a real screenshot of the game street — our own
   asset, so no art-rule conflict).
5. Any pure-logic fixes (layout helpers, hit-zone math) get unit tests;
   interaction fixes get before/after screenshots at the two viewports under
   `tmp/mobile-pass-2026-07-08/`.

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` pass.
- Findings table in PR shows Act 0 + one Act 1 morning fully completable by
  touch at both emulated viewports, with zero keyboard dependencies.
- Screenshots archived; STATE.md bullet; DECISIONS.md entry only if a
  surface had to change behavior to be touch-viable.

DO NOT
- Do not add a mobile-specific UI redesign, virtual buttons beyond what
  exists, or gesture systems — repair the current control scheme.
- Do not attempt native wrappers, PWA install prompts, or service workers.
- Do not touch delivery/economy/ride math while fixing input.

===== END PACKET RPG-20260708-02 =====
```
