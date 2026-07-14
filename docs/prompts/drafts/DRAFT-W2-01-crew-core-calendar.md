```
PACKET ID: RPG-DRAFT-W2-01 (assign + pin SHA at issue)
STATUS:    DRAFT — do not ferry until issued
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · High — the one new system of Act 2 (crew membership/attendance/regular status on the weekly calendar); save-state and gating correctness
PREREQ:    merged main after Wave 1 gate (SHA at issue)
TITLE:     Act 2 W2-01 — crew system core: membership, attendance, regular status, weekly calendar surface
MAP DELTA: none
PR TAG: [<assigned ID>]

===== BEGIN PACKET RPG-DRAFT-W2-01 =====

ROLE & SCOPE
docs/ACT2_FINDING_YOUR_PEOPLE_2026-07-14.md, "the one new system." Build
the crew substrate ONLY — no crew content (W2-02/03 stage the actual crews
on this).

THE SYSTEM
1. Crew definitions (data): id, name, venueId/anchor, session slots as
   day-of-week + time window (drive off the EXISTING events scheduler —
   crews are scheduled events with membership semantics, not a parallel
   scheduler).
2. State per crew: invited / member / attendanceCount / regular (regular
   at 3 attendances). Persisted via existing save patterns; if a dedicated
   field is genuinely needed over questFlags, stop-and-flag schema before
   bumping.
3. Attendance = being present at the session scene and completing its
   participation beat (W2-02/03 define those scenes; this packet ships a
   minimal test-crew session stub proving the loop end to end, removed or
   repurposed by W2-02).
4. Calendar surface: re-open the phone Calendar tab (hidden by -05's
   collapse, per its re-open plan) showing ONLY: crew sessions this week
   (joined crews bold, invited crews listed), rent day, and nothing else.
   The phone-diet hierarchy rules apply — the calendar is a promise, not
   a chore list.
5. Structural-unlock hook: a per-crew "regularBenefit" activation point
   (W2-04 fills the actual benefits).

HARD CONSTRAINTS
- Reuse the events scheduler; no second time system, no notification spam
  (one feed ping when a joined crew's session opens; none for unjoined).
- Fail-forward: missing sessions has zero penalty; invitations never
  expire.
- No Act 1/0 changes; boot-state builders extended (via gameplay
  mutations) with "act2_entered".
- Schema v11 preferred; stop-and-flag if crew state truly can't fit
  existing patterns.

DEFINITION OF DONE
- Tests: membership/attendance/regular transitions; calendar shows only
  the contract's items; session-open ping gating; persistence round-trip;
  regular fires exactly at 3.
- Beat proof from "act2_entered": calendar tab, invitation, a stub session
  attend → attendance increments → regular at 3 (time-warped via authored
  clock control), screenshots.
- Proof doc; STATE.md; DECISIONS.md (crews = scheduled events + membership
  semantics; no parallel systems).

DO NOT
- No crew content/dialogue (W2-02/03); no benefits (W2-04); no FOMO
  mechanics; no Community tab revival.

===== END PACKET RPG-DRAFT-W2-01 =====
```
