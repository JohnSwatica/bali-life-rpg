```
PACKET ID: RPG-20260714-05
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · Medium — content culling across the opportunity engine and phone; the risk is deleting something a story beat or choice scene references, so correctness is behavioral
PREREQ:    branch from main at 928ae8d or later (RPG-20260714-03 merged)
TITLE:     Phone diet — feed cull, priority hierarchy, tab collapse (Workstream A)
MAP DELTA: none — UI and content-generation changes only
PR TAG: [RPG-20260714-05]

===== BEGIN PACKET RPG-20260714-05 =====

ROLE & SCOPE
docs/INTERFACE_WORLD_OVERHAUL_2026-07-14.md Workstream A; founder feedback
verbatim in PLAYTEST_02.md ("too overwhelming with bullshit tasks that does
not make sense"). The phone must read as a phone: what I'm doing, what
pays, nothing else.

1. FEED CULL. Stop generating the generic opportunity-engine filler
   ("Receipt sort sprint," "Lost scooter key panic," and every sibling
   template that resolves as a menu errand with no play, no named story
   NPC, no scene). INVESTIGATE FIRST: enumerate every opportunity template
   and classify it KEEP or CUT against the verb test
   (RIDE/TALK/SERVE/UNCOVER/BUILD). Hard keep-list — these must survive and
   have tests proving they still fire: story pings (Kadek rush offer, Made
   invitation, Leo taunts, landlord/NusaDrop messages), board delivery
   offers, the No-Questions Package choice and ANY opportunity wired into a
   scene/choice/quest flag, Ibu catering gigs, rent/goal status. List every
   CUT template in the proof doc as "revival candidates" (some return in
   Act 2 restaged as scenes; none return as menu errands). Cut = stop
   generating; keep definitions/data in place unless dead-simple to remove
   safely.
2. FEED HIERARCHY. Render order: active goal/story items first, then
   paying jobs, then everything else. No timestamps-only ordering.
3. TAB COLLAPSE. 10 tabs → 4: Feed (jobs + messages), Map, Goals (absorbs
   Quests — Made's-room-style tracked goals live here), Profile (absorbs
   rating/reputation surfaces worth keeping). Contacts, Threads, Calendar,
   Events, Venues, Community: hide the tabs, keep the underlying code
   paths compiling (Act 2 systems will re-open some). Anything reachable
   ONLY through a hidden tab that a current feature needs (e.g. venue
   discovery states, event participation) must be re-homed or confirmed
   unused-in-current-play in the proof doc — do not silently strand a
   live feature.

HARD CONSTRAINTS
- No story beat, delivery, economy, or milestone changes. The Act 0 and
  Act 1 critical paths must be provably unaffected (the existing full smoke
  is the wave-gate check; your packet proof covers the phone surfaces).
- Save-schema v11 unchanged. Saves carrying now-culled feed messages must
  load cleanly (stale messages render harmlessly or are pruned on load —
  state which).
- Mobile: the 4-tab layout must fit 390x844 at least as well as the current
  10 tabs (it should fit far better).
- Do not restyle the phone visually beyond what the collapse requires —
  Workstream B/C/D handle visual work. This packet is information
  architecture.

DEFINITION OF DONE
- npm test -- --run + npm run build green. Tests: keep-list items all still
  generate/fire; culled templates no longer generate; hierarchy ordering;
  hidden tabs absent from the tab strip; Goals tab shows tracked goals;
  legacy saves with culled messages load.
- Beat proof(s) via the harness: from "act1_steady_runner", screenshot the
  Feed (hierarchy visible: story first, jobs next, no filler), the Goals
  tab with Made's room goal, the 4-tab strip, and the same on 390x844.
- Proof doc docs/RPG-20260714-05_PHONE_DIET_PROOF.md with the full
  KEEP/CUT classification table and the revival-candidates list; STATE.md
  bullet; DECISIONS.md entry (the verb-test cull and what it removed).

DO NOT
- Do not delete opportunity-engine infrastructure — only stop generating
  failed-verb-test content through it.
- Do not touch venue activity panels (Workstream B, next packet).
- Do not begin street/interior dressing work.
- Do not remove the multiplayer-locked portal chrome or anything Act 5
  documented as future.

===== END PACKET RPG-20260714-05 =====
```
