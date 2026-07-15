```
PACKET ID: RPG-20260715-02
STATUS:    ISSUED 2026-07-15
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · Medium — first crew content on the new core; scene staging + rotating line pools
PREREQ:    STACKED CONTINUATION: if origin/main already contains the [RPG-20260715-01] merge, branch from origin/main; otherwise branch from the head of the RPG-20260715-01 feature branch and note the stacked base in the PR body. Claude reviews/merges the stack in order; if review changes an earlier packet, rebase before merge
TITLE:     Act 2 W2-02 — Ari's Surf & Run Crew + the Sunset Beach Circle
MAP DELTA: expected none (existing berawa_beach area); if a small authored beach parcel is needed for the circle staging, declare it + MAP_CHANGELOG entry
PR TAG: [RPG-20260715-02]

===== BEGIN PACKET RPG-20260715-02 =====

ROLE & SCOPE
ACT2 contract beats 1–2. Ari (§C3: flaky bridge, conflict-averse, secretly
broke) leads the Berawa Surf & Run Crew: Wed/Fri sunset circle, Sun morning
run.

THE BEATS
1. INVITATION (contract beat 1): the first beach-adjacent delivery after
   the ACT 2 card ends with Ari at the dropoff — a scene, not a feed line:
   "Stay ten minutes. The ocean doesn't take tips." Joins the crew as
   invited; calendar lights up.
2. SUNSET CIRCLE SESSIONS (beat 2): Wed/Fri staged scene at the beach —
   the crew present (4-6 figures incl. named Ari), fire/boards dressing,
   nightQuiet-adjacent audio bed, a participation beat per session (a
   short TALK exchange with one rotating member — pools per the contract's
   no-verbatim-repeat rule for the first three attendances). Exactly ONE
   Ari secret plant across all sessions ("Client calls, man. So many
   client calls." — his laptop is closed.)
3. SUNDAY RUN: lighter variant session (morning, run staging along the
   beach edge), counts attendance equally.

HARD CONSTRAINTS
- All on W2-01's core; no new systems. Scenes use WorldScenes/dialogue
  panel patterns; sessions are the scheduler's events.
- Sensation layer reuse: sunset/dusk phases via the authored clock only
  inside session scenes if needed; no lighting forks.
- Ari voice: warm, evasive, never sleazy; the plant is one line, once.
- Fail-forward: sessions missed = nothing; arriving mid-window still
  counts.

DEFINITION OF DONE
- Tests: invitation gates on first post-card beach delivery; session
  scenes fire on the right days/windows; attendance counts; line pools
  rotate without repeats for 3 attendances; single plant line.
- Beat proof from "act2_entered": invitation scene, one Wed circle, one
  Sun run (clock-warped), attendance/regular progress — screenshots incl.
  the staged circle at dusk.
- Proof doc; STATE.md; DECISIONS.md.

DO NOT
- No Ari arc resolution; no second crew; no benefit implementation
  (W2-04); no new minigames (the run is staging, not a race).

===== END PACKET RPG-20260715-02 =====
```
