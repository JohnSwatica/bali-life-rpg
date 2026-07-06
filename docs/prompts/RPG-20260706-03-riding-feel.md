```
PACKET ID: RPG-20260706-03
PROJECT:   Bali Life RPG
TARGET:    Codex
TITLE:     Riding feel v1 — acceleration, lean, brake-drift, near-miss feedback (GDD layer L4 first slice)
PR TAG: [RPG-20260706-03]

===== BEGIN PACKET RPG-20260706-03 =====

ROLE & SCOPE
RIDE is the first verb in GAME_DESIGN.md and the GDD calls Delivery Riding
"the single biggest build in the game." Today riding is hold-W at constant
velocity plus occasional checkpoint timing-taps. This packet makes the base
act of riding feel physical BEFORE any more checkpoint content is added.
Phase 1 packet 3 of the 2026-07-06 review. This is the largest packet of the
phase — treat it as its own branch and PR.

HARD CONSTRAINTS
- Feel changes must not break delivery balance: effective average travel
  speed across a typical delivery route should stay within ~10% of current,
  so existing `timeLimitMin` values and payout math stay fair. Measure
  current straight-line traversal time first and assert the envelope in a
  test against the new movement model's constants.
- The movement model must be extracted as a pure helper
  (`src/systems/ride/RideModel.ts`): given input state + current velocity +
  surface/weather flags, return new velocity/lean/drift state. GameScene
  applies it; tests exercise it directly. Follow the repo's established
  pure-seam pattern.
- Scooter tier and bikeCondition may modulate feel parameters (the rattletrap
  accelerates slower, wobbles at top speed — extending the existing cosmetic
  `ScooterAnimation.ts` tier logic) but must NOT change wear/economy math.
- Keyboard and existing touch joystick both drive the same model.
- No save-schema change.

DELIVERABLES
1. `src/systems/ride/RideModel.ts`: acceleration curve (reach top speed over
   ~0.6-0.9s, not instantly), braking/coast deceleration, a slight
   grip/drift factor on sharp direction changes at speed, and top-speed
   modulation by scooter tier + condition.
2. Camera: subtle speed-based lookahead (camera leads the travel direction
   slightly at speed) using existing camera helpers; must respect interior
   mode and existing camera bounds/clamps.
3. Lean rendering: feed the model's lean state into the existing
   `src/systems/animation/ScooterAnimation.ts` seam instead of its current
   velocity-only inference.
4. Near-miss feedback: when passing within a tight radius of ambient traffic
   or pedestrians at speed WITHOUT collision, fire a small whoosh flourish
   (screen-edge pulse or brief speed-line burst via
   `InteractionFlourishes.ts` patterns; audio cue if RPG-20260706-01 landed).
   Near-misses have zero mechanical effect in this packet — feedback only,
   no reward loop yet (that's a later design decision).
5. Rain hook: `RideModel` accepts a `slick` flag reducing grip. Wire it to
   the existing Satu-Satu rain-window delivery condition when active. Keep
   the effect gentle — texture, not punishment (fail-forward tone rule).

DEFINITION OF DONE
- `npm test -- --run` and `npm run build` pass; new tests cover RideModel
  acceleration/deceleration curves, tier/condition modulation, drift state,
  slick-flag behavior, and the average-speed envelope vs. the old constant
  velocity.
- Manual acceptance note in the PR: ride BAKED -> villa dropoff and Ibu Sari
  -> BAKED on a fresh save; state plainly whether the delivery timer still
  feels comfortable.
- STATE.md bullet + DECISIONS.md entry (movement-model constants are a
  product decision worth logging).

DO NOT
- Do not add new checkpoint minigames, races, or ride content — this packet
  is exclusively about how the base verb feels.
- Do not change collision consequences, reckless-riding reputation logic, or
  traffic-hit feedback.
- Do not let the drift factor make precise stopping at pickup/dropoff
  markers frustrating — interaction radii stay as-is; if needed, kill drift
  below a low speed threshold.

===== END PACKET RPG-20260706-03 =====
```
