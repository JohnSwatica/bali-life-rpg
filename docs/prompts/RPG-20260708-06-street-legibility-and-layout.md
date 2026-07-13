```
PACKET ID: RPG-20260708-06
PROJECT:   Bali Life RPG
TARGET:    Codex
REASONING: high — spatial/read-model + render layout affecting how the whole world parses; camera, label culling, marker validity, and terrain legibility interact and can regress navigation
TITLE:     Street legibility & layout pass — declutter labels, kill orphan markers, distinguish walkable vs. building, verify paddies, tighten camera
MAP DELTA: a small walkable paddy-edge path west of the strip near The Corner (first increment under the 2026-07-11 Map Growth Rule; see item 7)
PR TAG: [RPG-20260708-06]

===== BEGIN PACKET RPG-20260708-06 =====

ROLE & SCOPE
The 2026-07-08 playthrough (BUG-4/BUG-5) showed the street reads as a diagram,
not a place: 7+ venue signboards legible at once, a blue "opportunity" disc
floating over empty grass with no venue beneath it, building plots visually
ambiguous with walkable ground, a camera zoomed far enough out that the frame
is mostly empty green, and no sign of the RPG-20260706-05 rice paddies where
they were specified. GTA:CW's second pillar is a dense, legible city you
navigate by landmark; today's world fails that. This is the aesthetics +
layout pass. Evidence: tmp/playtest-2026-07-08/02-after-newgame.png,
04-at-ibu-target.png.

WORK ITEMS (each is a distinct, verifiable fix)

1. LABEL DECLUTTER (layout/read-model). Venue signboards should not all shout
   at once. Show the permanent signboard only for venues within a near radius
   of the player (or cap to the N nearest, N≈3), fading others. Preserve the
   existing "permanently signed venue" logic but gate visibility by distance.
   Goal: at any moment the eye lands on 2-3 named places, not 7+.

2. ORPHAN MARKER FIX (logic/correctness). The floating opportunity disc over
   empty grass is a real defect: an opportunity/world-scene marker whose venue
   anchor doesn't resolve to a building renders in void. Audit
   WorldScenes/opportunity marker placement: every world marker MUST anchor to
   a resolved venue/among authored coordinates; if a marker's anchor is
   missing, it is suppressed, not drawn at a fallback origin. Add a test that
   no active world-scene/opportunity marker resolves to a point with no venue.

3. WALKABLE vs. BUILDING LEGIBILITY (aesthetic/layout). The tan dashed plots
   read ambiguously as either floor or building. Make walkable ground and
   building footprints unmistakably distinct at a glance — e.g. building
   footprints get a consistent roof/shadow/edge treatment and a slightly
   inset fill, while walkable sidewalk/road keeps the warm ground palette.
   This is presentation-only in StreetRenderer; no collision/coordinate
   changes. Provide before/after screenshots.

4. VERIFY + LAND THE PADDIES (aesthetic/content-integrity). Confirm whether
   RPG-20260706-05's rice paddies + yellowing-Corner patch actually render in
   the playable frame. If they don't reach the camera (off-band, unwired to
   the active street, or behind bounds), fix the wiring so the western dead
   zone west of the strip shows terraced paddies with the one yellowing patch
   near The Corner, per that packet's intent. If they already render and the
   harness simply never walked west, say so with a screenshot proving it.

5. CAMERA TIGHTEN (aesthetic/feel). The frame is mostly empty green. Nudge the
   default world zoom closer (respecting the existing desktop/mobile zoom
   split and interior camera bounds) so the street fills the frame and reads
   dense, GTA:CW-style — WITHOUT clipping the HUD or breaking the established
   viewport bounds set. This is a tuning nudge to the existing camera
   constants, not a new camera system; state the before/after zoom values.

6. LANDMARK LEGIBILITY (aesthetic, light). Give the player one persistent
   navigational landmark visible above the rooftops from most of the strip
   (the GDD names the banyan / a temple gate / the FINNS tower). One authored
   tall prop is enough for this packet — enough that the player can orient by
   world, not only by arrow.

7. MAP INCREMENT (per the Map Growth Rule in AGENTS.md, CEO directive
   2026-07-11). Open ONE small walkable parcel: a paddy-edge path west of the
   strip near The Corner/Canggu Station end — a narrow dirt strip along the
   paddies (roughly a few tiles wide, well under 10% of current playable
   area), contiguous with the existing sidewalk, dead-ending at the yellowing
   paddy patch so the player can walk up to the game's first seeded mystery
   and LOOK at it. Wire it into `playableBounds`, collision, and the minimap;
   extend the layout-invariant tests to cover it; append one line to
   `docs/MAP_CHANGELOG.md` with a proof screenshot path. No venue, NPC,
   quest, or economy content on it yet — it is a place, not a system.

HARD CONSTRAINTS
- Outside item 7's declared parcel: no venue coordinates, collision rects,
  playable bounds, economy, quests, or save schema change. Items 1/3/4/5/6
  are presentation; item 2 is marker-validity logic only.
- All art remains original procedural generation in code (no imported
  assets). Screenshots for every visual item under
  tmp/street-legibility-2026-07-08/.
- Keep layout-invariant tests green; add the orphan-marker test (item 2) and
  a paddy-in-frame assertion if feasible (item 4).

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` pass; new tests for item 2 (and item 4
  if testable) included, plus bounds/invariant coverage for item 7's parcel.
- Before/after screenshots for items 1, 3, 4, 5, 6 at 1280x800 in the PR, and
  a walk-onto-the-parcel screenshot for item 7; `docs/MAP_CHANGELOG.md` gains
  its first increment line.
- A one-paragraph self-assessment in the PR rating the street against GTA:CW
  pillar 2 (dense, legible, landmark-navigable) after the pass.
- STATE.md bullet; DECISIONS.md entry for the camera-zoom change (a feel
  decision) and the walkable/building treatment.

DO NOT
- Do not add new venues or districts, and no map area beyond item 7's single
  declared parcel — one increment per packet, per the Map Growth Rule.
- Do not retune anything outside camera zoom and label/marker/terrain
  presentation.
- Do not remove the arrow/objective guidance; landmarks supplement it.

===== END PACKET RPG-20260708-06 =====
```
