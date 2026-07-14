```
PACKET ID: RPG-20260714-02
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · High — first Act 1 turning point: story gating + a new recurring premium order line touch economy behavior, not just compilation
PREREQ:    branch from main at 8721a64 or later (RPG-20260714-01 merged)
TITLE:     Act 1 TP1 — Kadek's rush-hour run and the priority list
MAP DELTA: none — staged at existing BAKED. Berawa venue/interior
PR TAG: [RPG-20260714-02]

===== BEGIN PACKET RPG-20260714-02 =====

ROLE & SCOPE
docs/ACT1_BACKBONE_2026-07-14.md is the contract; this packet is Beat 1.
STORY_BIBLE.md v4: "You accept a high-fragility delivery from BAKED. Berawa,
where Kadek notices your dedication and adds you to his priority driver
list." Kadek's §C profile: head baker, chronic perfectionist, burnout,
secretly moonlighting for a corporate rival to pay his brother's debts.

THE BEAT

1. THE OFFER: after Leo's rate-cut encounter has resolved, a one-time
   feed-flagged special order appears (reuse the opportunity-feed/board
   pattern with clear special styling): a BAKED. "rush hour" ingredient run —
   high fragility, tight window, visibly better pay than normal board runs.
   The player can ignore it; it persists/reoffers until taken (no missable
   story).
2. THE RUN: a normal steering delivery with the fragile-cargo condition —
   reuse the existing cargo-care machinery. No new ride mechanics. Rush-hour
   flavor: denser ambient traffic on this run if the existing traffic system
   exposes a cheap density knob; if it doesn't, skip — do NOT build one.
3. KADEK'S SCENE (the felt moment): on clean-enough completion (fail-forward:
   a rough run still completes — Kadek's lines acknowledge the state of the
   box instead), a full-dialogue-panel scene with Kadek at BAKED (portrait,
   established voice: precise, tired, warm underneath). He adds the player to
   his PRIORITY LIST, hands over a pastry — the Focus Buffer item (his §C
   mechanical hook: freezes Focus decay for 3 in-game hours; reuse the
   existing item/buff machinery if present, otherwise a simple timed flag the
   meters system reads). Exactly ONE line hints the secret ("The corporate
   people pay triple for these same hands. Don't ask why I know.") — plant,
   no arc.
4. RESIDUE: priority-list membership unlocks a recurring premium BAKED order
   line on the board (better base pay, always fragile, gated on the flag),
   and Kadek's ambient/venue dialogue acknowledges the player thereafter.
   The one-time scene never re-fires.

CARRY-OVER RIDER (from RPG-20260714-01 review)
Fix the z-order defect where the player/scooter sprite renders over act-card
body text (visible at the landlord-ultimatum beat): card scrim + text must
draw above world sprites in all modes. One-line-scale fix; include a
regression screenshot in the proof.

HARD CONSTRAINTS
- Reuse only: opportunity feed/board, delivery/cargo-care/steering machinery,
  full dialogue panel + portraits, existing item/buff or flag patterns. No
  new engine systems, no new minigame, no new map geometry.
- Economy: the premium line's pay must sit above normal board runs but below
  the Act 0 villa setpiece's effective rate; it must not let a player hit the
  Rp 600 move-out earnings target materially faster than ~5 runs (state the
  chosen numbers and the check in the PR). Rate-cut multiplier applies to it
  like any board delivery.
- Story flags follow the existing one-time-flag patterns; no save-schema
  bump (v11). If truly unavoidable, stop and flag in the PR.
- Do not touch: Act 0, the rate-cut/Leo seam, Leo's race, Made/Bungalow
  Living, the move-out milestone math (Beat 5 owns that), Warung Rush.
- Kadek gets NO other beats here — no burnout arc, no sourdough lab, no
  brother. One scene, one plant line, one unlock.

DEFINITION OF DONE
- npm test -- --run + npm run build green. Tests: offer gates on the Leo
  encounter flag and persists until taken; scene fires once on completion;
  priority flag unlocks the premium line; Focus Buffer applies and expires;
  premium-line pay respects the economy bounds above.
- Smoke or headless proof: drive Act 1 to the offer, complete the run,
  screenshot the feed offer, the ride with fragile chip, Kadek's scene, the
  pastry/buff feedback, and the premium line on the board afterward. Plus
  the z-order regression shot at an act card with the player centered.
- Proof doc docs/RPG-20260714-02_KADEK_PRIORITY_PROOF.md; STATE.md bullet;
  DECISIONS.md entry (TP1 in; note Beats 2-6 pending per the backbone doc).

DO NOT
- Do not implement Made's offer, the breakdown, the tip dilemma, or the
  finale — sequential packets per the backbone doc.
- Do not reveal Kadek's secret beyond the single plant line.
- Do not rebalance existing board deliveries.

===== END PACKET RPG-20260714-02 =====
```
