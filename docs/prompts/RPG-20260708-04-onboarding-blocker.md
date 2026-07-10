```
PACKET ID: RPG-20260708-04
PROJECT:   Bali Life RPG
TARGET:    Codex
REASONING: high — Act 0 guidance logic; the first-90-seconds onboarding path where a wrong target silently blocks every new player, and TS passes regardless
TITLE:     Fix the broken first objective — point the marker at Ibu Sari, add an exit cue when the objective is outside the current interior
PR TAG: [RPG-20260708-04]

===== BEGIN PACKET RPG-20260708-04 =====

ROLE & SCOPE
An automated playthrough (docs/AI_PLAYTHROUGH_2026-07-08.md, BUG-1/BUG-2)
proved the game's FIRST objective misdirects the player. Two linked defects:

BUG-1: Inside Warung Sari, the Act 0 "meet_ibu_sari" objective marker points
at the meal counter (the venue's station), not at Ibu Sari. Following the
arrow as instructed lands on an empty counter; pressing E says "Nothing in
reach here yet" while a toast insists "Ibu Sari is waiting for you first -
follow the arrow." Evidence: tmp/playtest-2026-07-08/A-ibu-inside.png,
06-at-baked.png.

BUG-2: After the Ibu conversation grants the scooter + first delivery, the
objective flips to "Ride to BAKED" while the player is still INSIDE the
Warung, with no marker or cue pointing at the exit mat. Players get stranded
in the room. Evidence: 08-at-villa.png.

Fix both. This is the highest-priority bug in the build.

HARD CONSTRAINTS
- No new guidance SURFACE (the review froze "a sixth guidance system"). This
  is a correctness fix to the EXISTING field-objective/interior-retarget
  logic, plus reuse of the existing exit-mat rendering for a cue.
- No save-schema change. No economy/delivery/act-state changes — the act
  still advances exactly as it does now once Ibu is reached.
- Keep the debug snapshot fields `objectiveTargets` and `interiorExit` (added
  2026-07-08 for automated testing) working; this packet should make a
  follow-your-marker autopilot succeed through Act 0.1.

DELIVERABLES
1. Interior objective retarget fix: when the active Act 0 step targets an NPC
   (Ibu Sari) and that NPC is inside the current interior, the objective
   marker + `objectiveTargets` resolve to the NPC's live position, not the
   venue station. When the target NPC is NOT in the room, keep pointing at
   the entrance/exit as appropriate. Look at `getFieldObjectiveTargets()` and
   the interior objective-retarget logic in GameScene.
2. Remove the contradiction: while Ibu is the objective and she is in the
   room, the "Nothing in reach here yet" / "waiting for you - follow the
   arrow" toasts must not fire when the player is standing on the (now
   correct) marker within her talk radius. Reaching the marker must put the
   player in E-range of Ibu.
3. Exit cue (BUG-2): when the current field objective's target is OUTSIDE the
   interior the player is standing in, render the existing exit-mat with an
   active objective treatment (reuse the objective-marker triangle/pulse on
   the exit mat) and set `objectiveTargets[0]` to the exit mat until the
   player leaves. So "Ride to BAKED" first visibly points at the door.
4. Regression tests: (a) with Ibu scheduled into Warung Sari, the Act 0.1
   objective target resolves within her interaction radius; (b) when a
   delivery objective points to an exterior venue while the player is in an
   interior, the resolved objective target equals the exit mat.

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` pass; new regression tests included.
- Manual/automated proof in the PR: a "walk to objectiveTargets[0], press E"
  loop completes Act 0.1 (meet Ibu, get scooter) AND then leaves the Warung
  by following the retargeted exit cue — i.e. the exact autopilot that failed
  on 2026-07-08 now succeeds. Screenshot the corrected in-Warung marker
  sitting on Ibu.
- STATE.md bullet; DECISIONS.md entry (onboarding-critical behavior).

DO NOT
- Do not add a new tutorial system, arrow, or hint layer — fix the target
  resolution the existing arrow already uses.
- Do not change what talking to Ibu grants or the act progression.
- Do not touch other acts' objective logic beyond what the interior-retarget
  fix generically improves (note any spillover in the PR).

===== END PACKET RPG-20260708-04 =====
```
