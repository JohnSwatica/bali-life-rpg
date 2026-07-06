```
PACKET ID: RPG-20260706-02
PROJECT:   Bali Life RPG
TARGET:    Codex
TITLE:     Make the payout moment feel like a reward — money count-up, star punch, condition-aware celebration
PR TAG: [RPG-20260706-02]

===== BEGIN PACKET RPG-20260706-02 =====

ROLE & SCOPE
The delivery payout is the dopamine core of the entire Act 0-1 loop, and it
currently lands as a text toast. Phase 1 packet 2 of the 2026-07-06 review
(`CLAUDE_PROJECT_REVIEW_2026-07-06.md` §2 bottleneck "systems-rich,
sensation-poor"). Build a short celebratory payout sequence layered on the
existing completion path — presentation only, zero math changes.

HARD CONSTRAINTS
- `completeDelivery(...)` in `src/systems/hustle/DeliverySystem.ts` and every
  payout/rating number stay byte-identical in behavior. This packet renders
  what already happens; it never changes what happens.
- Use the existing camera-zoom-safe UI layer patterns (see the HUD layer and
  zoom-compensated container helpers in `GameScene.ts` recorded in STATE.md's
  P4a/HUD-fix entries). Do not reintroduce the Phaser `setScrollFactor(0)`
  zoom bug class this repo already fixed twice.
- Sequence must be skippable/instant-completing on any input, and short
  enough (~1.2s max) that repeat deliveries never feel slowed down.
- No save-schema change. No new dependency.
- If RPG-20260706-01 (audio) has landed, call its `payout` cue; if it hasn't,
  leave a single clearly-marked call-site comment so wiring is one line
  later. Do not block on it.

DELIVERABLES
1. `src/systems/animation/PayoutCelebration.ts` — a pure spec/state helper
   (tween timings, count-up steps, star display tiers) so it's unit-testable
   without Phaser, following the same pattern as
   `src/systems/animation/InteractionFlourishes.ts`.
2. GameScene wiring: on delivery completion, show (a) "Rp +<amount>" counting
   up over ~600ms near the player or in the status-chip area, (b) the star
   rating delta with a small punch/scale tween when rating moved, (c) the
   existing toast retained as the plain-text record after the flourish.
3. Performance tiers: when the delivery had a performanceScore (ride
   checkpoints), scale the celebration subtly — great runs get a slightly
   bigger count-up flourish. Read the existing score seam; do not modify it.
4. Rent-milestone variant: when a payout crosses the "you can now afford
   rent" threshold (player.money crosses world.life.hustle.rentAmount from
   below), append one extra beat — e.g. the money readout briefly glows —
   using the existing `getRentPressureState()` read model.

DEFINITION OF DONE
- `npm test -- --run` and `npm run build` pass; new unit tests cover the
  PayoutCelebration spec helper (tier selection, count-up step math,
  rent-crossing detection from plain state inputs).
- No existing test changes behavior.
- Screenshot proof: capture the celebration mid-count-up at 1280x800 into
  `tmp/` per this repo's established screenshot-acceptance habit.
- STATE.md bullet added.

DO NOT
- Do not add confetti/particle systems requiring new assets — tweens,
  existing procedural textures, and text objects only.
- Do not touch payout math, rating math, or delivery state.
- Do not make the celebration blocking for input or movement.

===== END PACKET RPG-20260706-02 =====
```
