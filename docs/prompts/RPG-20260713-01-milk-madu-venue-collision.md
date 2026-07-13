```
PACKET ID: RPG-20260713-01
PROJECT:   Bali Life RPG
TARGET:    Codex
CODEX:     Sol · High — Act 0 is fully blocked for every new player right now; this is a live-repro'd hard soft-lock in the tutorial's final step, not a cosmetic bug
TITLE:     Fix Milk & Madu / Milu by Nook venue collision — Act 0's final step is soft-locked for every new player
MAP DELTA: none — bug fix on existing venue interaction resolution, no new geometry
PR TAG: [RPG-20260713-01]

===== BEGIN PACKET RPG-20260713-01 =====

ROLE & SCOPE
John reported being stuck at "Get onto NusaDrop," signs "not making sense,"
nothing to interact with. Live headless repro (Claude, 2026-07-13, screenshots
in this session — reproduce fresh for your own proof) confirms the exact bug:

The Act 0 `buy_meal_and_coffee` objective ("At Milk & Madu, finish NusaDrop
signup over a quick coffee and a proper plate") resolves its target to
`milk_madu_berawa`'s coordinate (`objectiveTargets: [{x:2192,y:768}, ...]`).
Walking to that exact point, the nearest interactable is NOT Milk & Madu —
it's a completely different venue, **`milu_by_nook`** ("Milu by Nook", a
separate curated real-world venue entry in `curatedVenues.ts`/generated
`berawaLayout.ts` with its own id, distinct from `milk_madu_berawa`/"Milk &
Madu Berawa"). The interaction prompt reads "E — Check out Milu by Nook," and
pressing E opens a "Milu by Nook / cafe activities" panel — NOT the Milk &
Madu venue the quest text names.

This is survivable by luck: `milu_by_nook`'s panel happens to also offer
generic cafe-category "Grab coffee" / "Eat properly" activities that
technically satisfy `getAct0MealProgressKindForActivity()` and complete the
step. But a real player reading a sign that says "Milu by Nook" when the
quest says "Milk & Madu" reasonably concludes they're in the wrong place and
never presses E there — which is exactly what happened. **This blocks
literally every new player from finishing Act 0**, which is the single worst
possible defect right now: it is the wall between the intro (which is
landing well) and everything downstream.

INVESTIGATION REQUIRED (root cause not fully traced — do this first)
Two venues occupy the same or overlapping interaction footprint:
`milk_madu_berawa` (authored gameplay venue, `venues.ts`, name "Milk & Madu
Berawa") and `milu_by_nook` (a separate curated real-world venue,
`curatedVenues.ts`, name "Milu by Nook", `questCritical` unclear — check).
Determine WHY: are their coordinates near-duplicate estimates from the OSM
generation pipeline (`data/osm/berawa.curated-coords.json` flags many venues
as `estimatedCoord`/fallback — check if either of these is one of them)? Is
`milu_by_nook` meant to be a dormant/decorative curated-venue-only building
(per the old "one simple building per rendered curated venue" architecture)
that should never win interaction priority over an authored gameplay venue?
Or are these genuinely the same real-world place under two different catalog
entries that should be merged? Pick the correct fix based on what you find —
do not paper over the symptom without understanding which of these it is.

LIKELY FIX SHAPE (adjust based on investigation)
- If `milu_by_nook` is a dormant/legacy curated venue with no gameplay role:
  suppress it from interaction resolution entirely (or reposition/exclude it
  from proximity so it can never out-prioritize an authored gameplay venue
  like `milk_madu_berawa` at the same spot), OR simply remove/exclude it from
  `shouldRender`/interaction candidates if it serves no purpose.
- If the two are the same real place: pick one canonical id (`milk_madu_berawa`
  almost certainly, since it's the one with npcIds/itemIds/gameplay wiring and
  the one every Act 0/1 quest already references by name) and merge/retire
  the other, updating any curated-data cross-references.
- Whatever the fix, the acceptance bar is: standing at `milk_madu_berawa`'s
  authored position during the `buy_meal_and_coffee` step, the interaction
  prompt and any opened panel title say "Milk & Madu" (or its current
  in-fiction display name), never "Milu by Nook" or any other unrelated venue.

AUDIT FOR SIBLINGS (do not stop at just this one instance)
Given the flagged-estimate coordinate history, check whether any OTHER
authored gameplay venue (venues.ts) has a curated-catalog venue
(curatedVenues.ts) sitting close enough to collide the same way. At minimum,
add an automated invariant test asserting no two distinct venue ids' authored
interaction footprints overlap closer than their combined interaction radii
anywhere in the current authored street — this is the kind of bug that will
keep recurring silently otherwise.

HARD CONSTRAINTS
- No save-schema change. No new venues, no map area change (MAP DELTA: none).
- Do not touch delivery/economy math, Act 0 step ordering, or the cinematic
  opening (RPG-20260712-02) — this is scoped to the venue-resolution bug only.
- Fix must not regress the catering-run dropoff (which currently resolves
  correctly to its own dedicated dropoff point, not this collision).

DEFINITION OF DONE
- `npm test -- --run` + `npm run build` green; new regression test(s) proving
  interaction at `milk_madu_berawa`'s position resolves to `milk_madu_berawa`,
  plus the new no-overlapping-footprints invariant test.
- Live proof in the PR: fresh save, drive Act 0 exactly to `buy_meal_and_coffee`,
  screenshot the interaction prompt AND the opened activity panel at Milk &
  Madu showing the correct venue name, then complete the step and confirm
  Act 0 finishes. Use `npm run smoke` if it still covers this path, or the
  same manual/headless method — either way, SHOW it working end to end, don't
  just assert it in prose.
- Audit findings for sibling collisions written up in the PR even if none are
  found (say so explicitly).
- STATE.md bullet; DECISIONS.md entry (this was blocking every new player —
  record the root cause plainly so it doesn't quietly recur).

DO NOT
- Do not just rename the sign to "Milk & Madu" without understanding whether
  `milu_by_nook` needs to be suppressed/merged — a name patch over an
  unresolved position collision will likely resurface elsewhere.
- Do not touch unrelated venue signage/naming beyond what this collision
  requires.

===== END PACKET RPG-20260713-01 =====
```
