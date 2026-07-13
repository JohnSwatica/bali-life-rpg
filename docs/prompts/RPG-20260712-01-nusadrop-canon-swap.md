```
PACKET ID: RPG-20260712-01
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Terra · Medium — broad but mechanical content reskin across data files; clear checklist, no schema or dangerous logic
TITLE:     Adopt STORY_BIBLE v4 canon — NusaDrop, Leo, Julian Vance; retire the Elena/Rumah thread
MAP DELTA: none — narrative/data reskin only
PR TAG: [RPG-20260712-01]

===== BEGIN PACKET RPG-20260712-01 =====

ROLE & SCOPE
STORY_BIBLE.md is now v4 (the NusaDrop storyline). Its "Code reconciliation
map" section is your exact spec — read it first. This packet makes the live
game consistent with v4: names, copy, and retiring the Elena thread. It is a
reskin, not a systems change.

HARD CONSTRAINTS
- Internal IDs stay (`rio`, `pak_bagus`, save keys, memory keys) — display
  names/lines/portraits change. NO save-schema bump; existing saves must load
  with the new names appearing naturally.
- Do NOT rescale the economy to v4's realistic IDR figures (explicit caveat
  in the bible preamble). Toy numbers stay.
- Do NOT build new v4 systems (leaderboard entity, gig-sniping, surge zones,
  trust-graph reveal) — those are future packets. This packet only makes
  existing content speak v4.

DELIVERABLES
1. Names/copy sweep: gig app becomes "NusaDrop" on every player-facing
   surface (hustle board, phone feed, delivery copy, tutorial text). Rio's
   display name/portrait/lines become Leo (hyper-competitive European expat
   optimizer — rewrite his authored lines in that voice, including the race
   challenge/win/lose lines and the No-Questions scene, which both survive).
   Pak Bagus becomes Julian Vance (Vanguard Co-Living / "Enclave Berawa");
   rewrite his defaultLine accordingly.
2. Elena retirement: remove the notebook/SIM pickups, the Elena Discovery
   Ledger entries, and Kadek's "Rumah's bike" ambient line. Repurpose the
   Discovery Ledger tab to hold the first two v4 investigation entries
   instead: one on NusaDrop's commission squeeze (unlocks after 3 completed
   deliveries), one hinting at a hidden rating metric (unlocks after the
   first 4.5+ rated delivery). Keep the ledger read-only/derived as it is.
3. Loose-end grep: search all authored strings for "Jalan", "Rumah", "Elena",
   "Berawa 2.0", "Bagus", "Rio" and fix or consciously whitelist each hit
   (list the whitelist in the PR — e.g. internal ids are fine).
4. Update affected tests (name assertions, ledger content tests) without
   weakening what they protect.

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` green; `npm run smoke` still drives
  Act 0 to complete.
- PR lists: every renamed surface, every retired content item, the whitelist.
- STATE.md bullet; DECISIONS.md entry (canon swap executed).

DO NOT
- No new mechanics, no economy changes, no map changes, no schema bump.
- Do not delete the rootedAxis/relationalAxis fields — they are the future
  Trust Graph/Efficiency Score; only their surfacing changes later.

===== END PACKET RPG-20260712-01 =====
```
