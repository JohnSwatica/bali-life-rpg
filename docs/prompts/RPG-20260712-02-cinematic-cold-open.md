```
PACKET ID: RPG-20260712-02
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · High — rewires Act 0 onboarding, the game's most product-critical flow; correctness is behavioral, and PLAYTEST_01 proves this is where players are lost
CODEX-PREREQ: run after RPG-20260712-01 (needs NusaDrop/v4 names in copy)
TITLE:     Cinematic cold-open + the 3-minute hook — v4 Act 0 opening with a first meaningful choice
MAP DELTA: small bus drop-off pocket at the Canggu Station street edge (arrival point for the cold-open; wired into bounds/collision/minimap; MAP_CHANGELOG entry)
PR TAG: [RPG-20260712-02]

===== BEGIN PACKET RPG-20260712-02 =====

ROLE & SCOPE
PLAYTEST_01 problems 1+2: no cinematic opening, no agency, no hook inside
3 minutes. Rebuild the Act 0 opening as STORY_BIBLE v4 §D Act 0 specifies,
using the EXISTING cutscene kit (letterbox, scripted walk, camera pan, act
cards — all built in RPG-20260706-07). Target: a stranger reaches real
stakes (a ticking timed delivery) in under 3 minutes from New Game.

THE NEW OPENING (authoritative sequence)
1. COLD-OPEN CUTSCENE (~45-60s, skippable): letterbox. Night/dawn. A bus
   pulls away from the new drop-off pocket; the player character sits on a
   backpack. Phone buzz: the kos reservation is a scam (short message card).
   Scripted walk: Ibu Sari emerges from the warung, crosses to the player.
   Two dialogue beats in her existing voice, ending with the offer: her late
   husband's smoke-belching scooter, on credit — IF a catering box reaches
   Milk & Madu in 15 minutes.
2. FIRST CHOICE (the Pokemon-starter beat, uses the existing
   RelationshipChoiceScene primitive): Ibu offers the deal; the player picks
   HOW to take it. Two options, both real per the bible's choice rule, e.g.
   accept humbly (+affinity, standard payout) vs. negotiate a fee
   (+money on completion, small Relational/Trust penalty, Ibu remembers).
   No decline path — the story needs the scooter; the choice is character,
   not refusal.
3. THE HOOK MISSION: the catering run starts immediately as a timed delivery
   (visible countdown chip) using the existing delivery machinery. Fail-
   forward: missing the window still completes but costs the bonus + an Ibu
   line; making it lands the payout celebration.
4. THEN the existing loop opens (NusaDrop signup framed as the next step,
   existing meal/sleep beats compress to follow).

HARD CONSTRAINTS
- Reuse: cutscene primitives, RelationshipChoiceScene, delivery system,
  payout celebration, cargo care. Build NO new engine systems; this is
  staging + act-progression rewiring.
- Skippable at every step (ESC/tap), never soft-locks, never saves
  mid-sequence — same rules the cutscene kit already enforces.
- Old saves mid-Act-0 must not break: migrate/fast-forward them past the new
  opening safely (no schema bump if avoidable; if truly unavoidable, STOP and
  flag in the PR rather than bumping unilaterally).
- Act 0 step model may be restructured, but `npm run smoke` MUST be updated
  in the same PR to drive the new sequence — the smoke harness is the
  regression gate for exactly this flow.
- The 3-minute budget is a DoD item: from clicking New Game to the timed
  delivery being live must be under 3 minutes including unskipped cutscene.

DEFINITION OF DONE
- `npm test -- --run`, `npm run build`, and updated `npm run smoke` all green.
- Timed proof in the PR: timestamped log/screenshots showing New Game → live
  ticking delivery in <3:00, and the full new opening beat-by-beat.
- The first-choice writes affinity/memory/axis state and Ibu references it in
  at least one later line.
- MAP_CHANGELOG line + before/after shots of the bus pocket.
- STATE.md bullet; DECISIONS.md entry (Act 0 restructure is architecture).

DO NOT
- No voice acting, music files, or imported cinematic assets — procedural/
  tween grammar only.
- Do not implement the kos-deposit midpoint or the three-rain-deliveries beat
  yet (later packet); this packet ends where the open loop begins.
- Do not touch Act 1+ content.

===== END PACKET RPG-20260712-02 =====
```
