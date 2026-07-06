```
PACKET ID: RPG-20260706-05
PROJECT:   Bali Life RPG
TARGET:    Codex
TITLE:     Fill the void — rice paddies west of the street, real villa gates, Berawa street texture
PR TAG: [RPG-20260706-05]

===== BEGIN PACKET RPG-20260706-05 =====

ROLE & SCOPE
Two visual gaps identified in the 2026-07-06 review + AI walkthrough notes
(docs/AI_WALKTHROUGH_NOTES_2026-07-06.md #3/#4): the western half of the
playable view is undecorated grass, and villa deliveries terminate at empty
grass with no villa. Both fixes are world-dressing on the EXISTING street —
this is explicitly not the six-district GDD map build, which stays frozen
per the review's freeze list.

HARD CONSTRAINTS
- No venue coordinates, collision rects, playable bounds, quest logic,
  economy, or save schema change. This is renderer/props work in
  `src/systems/map/StreetRenderer.ts` + a small data file, following the
  exact pattern of the earlier "corridor density" pass (benches/lanterns/
  planters recorded in STATE.md).
- All art remains original procedural tile/shape generation in code — the
  established no-copied-assets rule.
- The paddies are story infrastructure, not just decoration: build them with
  a `paddyState` visual parameter (green | yellowing) wired to a simple
  read-model function so a later story packet can flip the state by act.
  Default: green everywhere EXCEPT one small patch near The Corner/Canggu
  Station end rendered yellowing from the start — this is the Story Bible's
  §E-3 "why is the rice going yellow" seeded mystery, visible from day one.
- Layout invariant tests must keep passing; add one asserting paddies never
  paint over road/sidewalk/venue-access tiles.

DELIVERABLES
1. Rice paddies filling the western dead zone: terraced rectangles with
   water-line borders, subtle palette variation, occasional farmer-hut prop
   and scarecrow/flag props. Visible from the normal street camera, not just
   at map edge.
2. `paddyFieldState()` read model (act/flag -> green|yellowing per patch) in
   a small pure module, with the yellowing Corner patch authored in data.
3. Villa gates at delivery dropoff points: for `intro_villa_lane` (tutorial)
   and any other villa-type dropoff currently in `src/data/deliveries.ts`,
   render a walled compound edge, gate, gate lamp, and bougainvillea-style
   colored accents so "Drop the pastry box at the villa gate" points at an
   actual gate. Interaction radius/point unchanged.
4. Street texture pass (light, ~1 day): canang sari offering tiles on
   sidewalks near warungs (small colored squares — they're already a story
   motif), 2-3 sleeping dog props placed off the walk path, laundry lines
   between two building pairs, a handful of parked scooters near venues.
   All non-interactive, all collision-free.

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` pass, including the new paddy
  invariant test.
- Screenshot acceptance at 1280x800 after a fresh F9 reset, saved under
  `tmp/paddies-villas-proof-<date>/`: (a) fresh boot showing paddies west of
  the street with the yellowing Corner patch distinguishable, (b) tutorial
  villa dropoff showing the gate, (c) one street shot showing canang
  sari/dogs/laundry texture.
- STATE.md bullet + DECISIONS.md entry (paddies-as-story-surface is a
  product decision: log that paddy state is act-driven infrastructure).

DO NOT
- Do not open new walkable area beyond current playable bounds — paddies are
  visible set dressing; bounds stay as-is until a real map packet.
- Do not add paddy-related quests, NPCs, or dialogue — the visual seed only.
- Do not touch the beach terminus or interiors.

===== END PACKET RPG-20260706-05 =====
```
