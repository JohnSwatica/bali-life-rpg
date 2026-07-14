```
PACKET ID: RPG-DRAFT-W4-02 (assign + pin SHA at issue)
STATUS:    DRAFT — do not ferry until issued
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · Medium — build architecture (code-split) + load budget; regression risk is app-wide
PREREQ:    merged main after W4-01 (SHA at issue)
TITLE:     Launch W4-02 — code-split, load budget, mobile browser pass
MAP DELTA: none
PR TAG: [<assigned ID>]

===== BEGIN PACKET RPG-DRAFT-W4-02 =====

THE WORK
1. CODE-SPLIT: the single ~2.0MB (500KB gzip) bundle splits so first
   paint → title screen needs only a lean core (target: <250KB gzip for
   the initial chunk; Phaser and the world load behind the title). Use
   Vite dynamic imports at natural seams (title/menu vs GameScene vs dev
   modules — dev already splits).
2. LOAD BUDGET: title interactive in <3s on a throttled "Fast 3G"
   profile; measure and record in the proof (Bali tourist wifi is the
   real target).
3. MOBILE BROWSER PASS: iOS Safari + Android Chrome via the Pages URL:
   audio unlock behavior, touch controls, viewport/safe-area, no
   double-tap zoom traps, orientation handling (portrait shows the
   existing rotate/format guidance if landscape-only). Fix what's cheap;
   list what isn't with severity.
4. CI: the Pages workflow builds the split bundle; smoke + beat-proof
   scripts still pass against it.

HARD CONSTRAINTS
- No gameplay/logic changes; pure build/loading/input-surface work.
- The full smoke must pass against the split build (proof, not assumption).

DEFINITION OF DONE
- Tests/build green; smoke green on the split build; initial-chunk size
  + load timings in the proof; device-pass findings table (fixed vs
  deferred). Proof doc; STATE.md; DECISIONS.md (load budget of record).

DO NOT
- No service worker/offline scope creep; no asset pipeline rework; no
  engine swap talk.

===== END PACKET RPG-DRAFT-W4-02 =====
```
