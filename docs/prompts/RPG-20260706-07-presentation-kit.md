```
PACKET ID: RPG-20260706-07
PROJECT:   Bali Life RPG
TARGET:    Codex
TITLE:     L2 presentation kit — act cards, letterbox cutscene grammar, scripted-walk primitive
PR TAG: [RPG-20260706-07]

===== BEGIN PACKET RPG-20260706-07 =====

ROLE & SCOPE
Phase 2 packet 1. GAME_DESIGN.md §5 defines the cutscene grammar: "letterbox
bars + scripted walk + camera pan (existing tweens). Used for act cards, the
6 finale setpieces, first meetings." None of it exists — act transitions are
currently HUD copy changes. This packet builds the reusable primitives plus
their first two productions. PREREQUISITE: run after RPG-20260706-01/02
(audio + payout juice) so cues exist to reuse; independent of 03-06.

HARD CONSTRAINTS
- Primitives live as a small scripting seam (`src/systems/cutscene/`), with
  a pure sequencer helper (step list -> timed step states) that is
  unit-testable without Phaser, and a GameScene runner that consumes it.
- A cutscene NEVER soft-locks: ESC/tap always skips to the end state; every
  scripted sequence has a hard timeout; the runner restores the exact prior
  scene mode (world/interior) and input state on completion or skip. Given
  this repo's history of overlay/zoom regressions, letterbox bars and card
  text must use the established zoom-safe UI-layer pattern.
- Save safety: never save mid-cutscene; if a save/autosave triggers, defer
  until the runner exits. Cutscene state is never persisted (no schema
  change) — on reload, a cutscene that didn't finish simply re-derives from
  act state or is skipped.
- Act-card triggers derive from EXISTING act-progress transitions in
  `ActProgression.ts` / `HustleMilestones.ts` — no new progression state.

DELIVERABLES
1. Primitives: (a) letterbox in/out (tweened top/bottom bars), (b) act card
   (title + subtitle over a dimmed frame, e.g. "ACT 1 — THE HUSTLE"),
   (c) scripted-walk (move player/NPC sprite along waypoints with input
   suspended), (d) camera pan/hold/return.
2. Production 1 — Act 0 -> Act 1 card: first sleep completion plays
   letterbox + "ACT 1 — THE HUSTLE / Rent: Rp <rentAmount> by Day
   <rentDueDay>" card into the existing morning-hand flow.
3. Production 2 — Act 1 -> Act 2 transition: on move-out threshold, a short
   sequence (letterbox, camera pan toward the beach direction, "ACT 2 —
   FINDING YOUR PEOPLE" card) replacing today's text-only chapter turn.
4. Both productions skippable; both leave the world exactly as the current
   non-cutscene path does (same objectives, same state).

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` pass; sequencer tests cover step
  timing/order, skip-to-end from any step, timeout behavior, and the
  "morning hand still opens after the Act 1 card" ordering.
- `firstHourProof.test.ts` passes unchanged (read models unaffected).
- Screenshots of both act cards at 1280x800 under `tmp/`.
- STATE.md bullet + DECISIONS.md entry (cutscene grammar is architecture).

DO NOT
- Do not build any of the six finale setpieces or first-meeting cutscenes —
  primitives + two act cards only; more productions come per-packet.
- Do not add dialogue trees/choices inside cutscenes.
- Do not gate any mechanical progress behind watching (vs. skipping) a
  cutscene.

===== END PACKET RPG-20260706-07 =====
```
