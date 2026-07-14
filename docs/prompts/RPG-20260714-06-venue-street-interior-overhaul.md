```
PACKET ID: RPG-20260714-06
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Terra · High — three presentation/content workstreams in one pass (CEO-ordered bundle); wide multi-file surface, no story/economy logic
PREREQ:    branch from main at be28ffd or later (RPG-20260714-05 merged)
TITLE:     Venue purpose pass + street density + interior identity (Workstreams B, C, D in one packet)
MAP DELTA: none — dressing and content curation only; no geometry, no new areas
PR TAG: [RPG-20260714-06]

===== BEGIN PACKET RPG-20260714-06 =====

ROLE & SCOPE
docs/INTERFACE_WORLD_OVERHAUL_2026-07-14.md Workstreams B + C + D, bundled
into one packet by CEO instruction. Founder feedback (PLAYTEST_02.md):
venue menus full of worthless tasks; visuals full of purposeless
distraction; street and interiors "spacious but lifeless." The razor for
every decision: GAME_DESIGN.md §1's verb test (RIDE/TALK/SERVE/UNCOVER/
BUILD) for interactions; "does this tell the player something about place,
availability, or direction?" for visuals.

WORKSTREAM B — VENUES HAVE ONE PURPOSE, STATED IN VERBS
1. Audit every venue activity panel. Per venue: one identity line + at most
   3 actions, each phrased as a thing you DO at THAT venue. Cut the
   duplicated generic rows ("Work session," "Grab coffee," "everyday
   fallback" sections) wherever they aren't the venue's actual purpose;
   where they are (Satu-Satu = coffee + focus work), rewrite as that
   venue's specific action, not the shared template.
2. KEEP-LIST (must survive, with tests): shop buy/sell counters; the
   scooter-rental repair/upgrade counter (milestone-critical); Ibu's warung
   meal loop (her §C safety-net role); any action referenced by story
   beats, station loops, relationship arcs, or the Settling In goals. If
   cutting an action would strand a goal ("Become a regular somewhere by
   doing three activities at one venue"), retune the goal's wording/count
   to the post-cull world rather than keeping dead actions — state any such
   retune in the proof doc.
3. Full classification table (venue × action × KEEP/CUT/REWRITE) in the
   proof doc, like -05's template table.

WORKSTREAM C — STREET DENSITY (remove noise, then add place)
1. First remove: any outdoor visual element that draws attention but tells
   the player nothing (audit, list removals in proof).
2. Then add Bali place-telling dressing along the authored street, in the
   flat-color art language, static/pooled graphics only: warung steam,
   canang sari offerings on thresholds, laundry lines between kos
   buildings, clustered parked scooters at venues (more = busier), produce
   crates at the station end, beach gear near the beach end, kerb/drainage
   texture on road edges. No new systems, no animation beyond what the
   existing cheap-animation pass already provides, no NPC changes.
3. Density target: no screen-height stretch of the street with zero
   place-telling props. Legibility rules from RPG-20260708-06 are hard
   constraints: props never occlude doors, signage, objective markers, or
   the road surface players ride on; approach lanes stay clean.
4. Performance: static Graphics/pooled draws; verify no frame drop in the
   proof (same comparative method as RPG-20260713-03).

WORKSTREAM D — INTERIORS READ AS SOMEONE'S ROOMS
To the standard the bleak kos set: BAKED = ovens/racks/flour sacks;
Milk & Madu = occupied tables, counter machine, menu board; Bungalow
Living = fabric racks + make the hidden room's doorway visibly present
(it's a story location now); Satu-Satu = roaster/bean sacks; scooter
rental = parts wall/tool bench; Canggu Station warung = pans, stools,
condiment caddy. Same art language, static graphics. Acceptance: a
screenshot of any interior identifies the venue without reading a label.
Do not move exits, mats, counters, or any interactable's position.

RIDERS (small fixes from -05 review, include in this PR)
- Goals tab: stale "Rp 700 delivery earnings" copy — the tracker and
  threshold are Rp 600 (RPG-20260713-02); make the copy read from the
  constant so it can't drift again.
- Goals tab: "No active quests. Talk to Ibu Sari or Kadek." renders above
  an active goal list — show that line only when the list is actually
  empty.

HARD CONSTRAINTS
- No story, economy, milestone, schema (v11), or map-geometry changes.
- No changes to the phone beyond the two riders.
- Interaction positions/radii unchanged (the RPG-20260713-01 invariant
  must keep passing untouched).
- Act 0 critical path stays menu-free and unaffected; Act 1 beats
  (Kadek/Made) unaffected.
- Mobile 390x844: venue panels and the denser street stay legible.

DEFINITION OF DONE
- npm test -- --run + npm run build green. Tests: keep-list venue actions
  survive; culled actions gone; goal retunes (if any) consistent; rider
  copy reads from the milestone constant; layout invariants all green.
- Beat proofs via the harness covering all three workstreams:
  * three venue panels before/after (one shop, one cafe, the rental),
  * three street stretches before/after (station end, mid-street, beach
    end) in day light,
  * five interiors before/after,
  * one 390x844 set (venue panel + street),
  with before shots taken from be28ffd. Frame-rate comparison note for the
  street density.
- Proof doc docs/RPG-20260714-06_OVERHAUL_PROOF.md with the venue
  classification table, removal list, and all before/afters; STATE.md
  bullet; DECISIONS.md entry (verb-test venue cull + place-telling
  density standard).

DO NOT
- Do not add new venues, minigames, NPCs, routines, or story content.
- Do not touch weather/lighting/audio systems (RPG-20260713-03 owns those).
- Do not restyle HUD, cards, or dialogue panels.
- Do not exceed the three named workstreams plus the two riders.

===== END PACKET RPG-20260714-06 =====
```
