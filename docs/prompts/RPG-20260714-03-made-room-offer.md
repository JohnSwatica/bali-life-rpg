```
PACKET ID: RPG-20260714-03
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Terra · Medium — one staged scene + gating + goal-tracking residue across several files; reuses proven patterns, touches no economy or milestone math
PREREQ:    branch from main at 65b0de6 or later (RPG-20260714-02 merged)
TITLE:     Act 1 TP2 — Made's hidden room offer at Bungalow Living
MAP DELTA: none — staged at the existing Bungalow Living venue/interior
PR TAG: [RPG-20260714-03]

===== BEGIN PACKET RPG-20260714-03 =====

ROLE & SCOPE
docs/ACT1_BACKBONE_2026-07-14.md Beat 2. STORY_BIBLE.md v4: "Made offers you
a hidden rental deal on a decent shared room, but it requires a clean
financial track record and a recommendation letter from a local business
owner." Made's §C profile: property manager at Bungalow Living, highly
transactional — every interaction is a future favor — but never villainous.
His secret (kickbacks quietly subsidizing elderly residents' rent) gets AT
MOST one oblique plant line.

THE BEAT

1. THE INVITATION: once the player reaches Steady Runner (the existing
   3-delivery milestone), Made pings the phone feed — transactional voice,
   e.g. "You move packages on time. That is rare enough to be worth a
   conversation. Bungalow Living, when you have ten minutes." Persistent
   until acted on (reuse the Kadek offer-persistence pattern). A world-scene
   cue at Bungalow Living (existing WorldScenes pattern) marks him waiting.
2. THE SCENE: full dialogue panel at Bungalow Living (portrait, §C voice).
   Made shows the player the hidden room — a short staged walk-and-talk or
   a described reveal inside the existing interior, whichever the current
   interior staging supports without new machinery. He states the deal and
   the two conditions plainly:
   - a clean financial track record (operationalized: rent never missed —
     read the existing rent/day state; do NOT invent a new credit system);
   - a recommendation letter from a local business owner.
   He does not soften either. One optional plant line maximum for his
   secret (e.g. '"Everyone pays somebody. The interesting question is who
   I pay." He does not explain.').
3. RESIDUE: after the scene, a visible tracked goal exists for the room —
   reuse the existing quest/goal surface (phone Quests tab / objective
   machinery): "Made's room — rent record clean ✓/✗ · recommendation letter
   ✗". The letter condition is NOT satisfiable in this packet (Beat 5's
   finale resolves it via Ibu). Made's ambient/venue dialogue acknowledges
   the standing offer. The scene never re-fires.

HARD CONSTRAINTS
- Reuse only: opportunity feed, WorldScenes staging, full dialogue panel +
  portraits (Made has npc data — verify portrait exists; if not, the
  existing portrait-art generation pattern covers him), quest/goal surface,
  one-time flag patterns. No new engine systems, no new map geometry.
- NO economy changes: no rent changes, no deposit, no new payouts. The
  move-out milestone math (HustleMilestones) is untouched — Beat 5 owns
  its adjustment. This packet only ADDS the visible goal.
- No save-schema bump (v11); existing flag maps only. Stop and flag in the
  PR if truly unavoidable.
- Do not touch: Act 0, Kadek's beat, Leo seam/race, Warung Rush, the
  breakdown reversal (Beat 3, next packet).
- Voice discipline: Made is precise and transactional, never sleazy, never
  warm. If a line sounds like a mentor or a villain, rewrite it.

DEFINITION OF DONE
- npm test -- --run + npm run build green. Tests: invitation gates on
  Steady Runner and persists; scene fires once; goal appears with correct
  per-condition state (rent-record read from existing state; letter always
  unmet here); no milestone/economy values changed.
- Headless proof: drive to Steady Runner, screenshot the feed invitation,
  Made's world-scene cue, the dialogue scene, and the tracked goal with
  condition states. Full smoke green (if the villa-leg movement flake
  recurs, note it and retry once — it passed on main at 65b0de6).
- Proof doc docs/RPG-20260714-03_MADE_ROOM_OFFER_PROOF.md; STATE.md bullet;
  DECISIONS.md entry (TP2 in; Beats 3-6 pending per backbone doc).

DO NOT
- Do not implement the recommendation letter, the finale, or any way to
  satisfy the letter condition — Beat 5 owns that.
- Do not implement the breakdown reversal or tip dilemma.
- Do not give Made an arc, a shop change, or more than one secret line.

===== END PACKET RPG-20260714-03 =====
```
