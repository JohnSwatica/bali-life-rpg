```
PACKET ID: RPG-20260715-10
STATUS:    ISSUED 2026-07-15
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · Medium — post-ending world state; save-correctness is the risk
PREREQ:    STACKED CONTINUATION: if origin/main already contains the [RPG-20260715-09] merge, branch from origin/main; otherwise branch from the head of the RPG-20260715-09 feature branch and note the stacked base in the PR body. Claude reviews/merges the stack in order; if review changes an earlier packet, rebase before merge
TITLE:     Post-ending free play + the Season 2 teaser hook
MAP DELTA: none
PR TAG: [RPG-20260715-10]

===== BEGIN PACKET RPG-20260715-10 =====

ROLE & SCOPE
docs/SEASON1_ENDING_2026-07-14.md §"Post-ending free play" + sequence
beat 6. The game does not end at the END card — Berawa continues.

THE WORK
1. WAKE: after credits, the next morning loads normally — same save, all
   systems live (deliveries, crews/sessions, races, shops, weather/day
   cycle). Exhausted story beats surface their residue lines; nothing
   dangles a "next objective" that doesn't exist.
2. GOALS: the Goals tab shows "Season 1 complete" as a finished section;
   open-ended play goals remain (rating, crew attendance, race record).
3. THE TEASER: one locked phone thread — "SEASON 2 — THE COMMISSION WAR"
   — showing only Ibu's squeeze line and a lock icon. No tap-through
   content; it is a promise, not a menu.
4. SAVE SEMANTICS: post-ending saves load into free play (never replay
   the ending); the season-complete flag is durable; New Game from title
   never touches the completed save without the explicit confirm flow
   (coordinate with the W4 settings packet's reset-confirm at issue time —
   whichever lands second wires to the other).
5. TITLE SCREEN: a completed save shows "Continue — Berawa, after" as its
   label (small, earned).

HARD CONSTRAINTS
- No Season 2 content behind the lock; no new systems; schema stop-and-
  flag rule if the season-complete flag can't fit existing patterns (it
  should).
- Free-play must not re-fire one-time beats (audit: every one-time flag
  in Acts 0–2 respected post-ending — test sweep, not sampling).

DEFINITION OF DONE
- Tests: ending fires once ever; post-ending load → free play; one-time
  beat sweep green; teaser locked; title label.
- Beat proof from a completed-save boot state: morning-after world, Goals
  complete section, locked teaser thread, title screen label —
  screenshots.
- Proof doc; STATE.md; DECISIONS.md (what free play is and is not).

DO NOT
- No epilogue quests, no NG+, no Season 2 scenes.

===== END PACKET RPG-20260715-10 =====
```
