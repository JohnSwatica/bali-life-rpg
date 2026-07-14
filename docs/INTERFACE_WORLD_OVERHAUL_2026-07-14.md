# INTERFACE & WORLD OVERHAUL — Wave 1.5 design contract (2026-07-14)

Source: PLAYTEST_02.md (founder feedback, verbatim there). CEO directive:
fix the phone/shops interface and the visual lifelessness BEFORE deeper plot
work. Wave 1 story Beats 3–6 are paused; this wave is four packets.

The razor for everything here is GAME_DESIGN.md §1: every interactable
serves at least one player verb (RIDE / TALK / SERVE / UNCOVER / BUILD) or
it is cut. Meter effects are byproducts of play, never the content.

## Workstream A — the phone is a phone, not a quest-log dump

1. **Feed cull.** The generic opportunity-engine templates ("Receipt sort
   sprint," "Lost scooter key panic," and their siblings) fail the verb
   test: menu-resolved errands with no play, no named character, no story.
   CUT them from generation. Keep-list (must survive, verified by test):
   story pings (Kadek/Made/Leo/landlord/NusaDrop), board delivery offers,
   the No-Questions Package and any opportunity wired into a scene/choice,
   Ibu catering gigs, rent/goal status lines. Whatever is cut gets recorded
   in the proof doc as a "revival candidates" list — some may return in Act
   2 RESTAGED as scenes with named NPCs; none return as menu errands.
2. **Feed hierarchy.** What remains renders in priority order: active
   goal/story first, then jobs, then ambient. A first-time player opening
   the phone should see: what I'm doing, what pays, nothing else.
3. **Tab collapse.** 10 tabs → 4: **Feed** (jobs + messages), **Map**,
   **Goals** (absorbs Quests; Made's-room-style tracked goals), **Profile**
   (absorbs rating/rep). Contacts/Threads/Calendar/Events/Venues/Community
   are hidden (not deleted — their surfaces return when Act 2's crew
   calendar and relationship systems actually need them; keep the code
   paths, remove the tabs).

## Workstream B — venues have one purpose, stated in verbs

Per venue: one clear identity line + at most 3 actions, each phrased as a
thing you DO. Shop counters stay for buy/sell venues. The "everyday
fallback" filler rows (generic Work session / Grab coffee rows duplicated
across venues) are cut wherever the venue's real purpose doesn't include
them; where a venue IS for that (Satu-Satu = coffee + focus work), the
action is kept but written as that venue's specific thing, not the generic
template. Nothing in Act 0/1's critical path opens these panels (already
true); this workstream makes the OPTIONAL layer worth opening.

## Workstream C — purposeful density outdoors

Remove-then-add, in that order:
1. Remove visual noise: elements that draw the eye but mean nothing.
   Judgment call per element; the test is "does this tell the player
   something about place, availability, or direction?"
2. Add Bali street life as *place-telling* dressing (static/pooled,
   flat-color art style, no new systems): warung steam, canang sari
   offerings on thresholds, laundry lines between kos buildings, clustered
   parked scooters at venues (density = popularity), produce crates at the
   station, beach gear near the beach end, drainage/kerb texture on the
   road edge. Density target: no screen-height stretch of street with zero
   place-telling props; approach legibility (RPG-20260708-06 rules) must
   not regress — props never occlude doors, signs, or objective markers.

## Workstream D — interiors read as someone's rooms

Every enterable interior gets identity dressing to the standard the bleak
kos set (RPG-20260713-03): BAKED = ovens/racks/flour sacks; Milk & Madu =
occupied tables/counter machine/menu board; Bungalow Living = fabric racks
+ the hidden room's doorway made findable; Satu-Satu = roaster/bean sacks;
scooter rental = parts wall/tool bench. Same art language, static graphics,
no new systems. Target: standing in any interior, a screenshot alone tells
you where you are.

## Packet map (Wave 1.5, sequential)

- RPG-20260714-05 — Workstream A (phone diet: cull, hierarchy, tab collapse)
- RPG-20260714-06 — Workstream B (venue purpose pass)
- RPG-20260715-01 — Workstream C (street density)
- RPG-20260715-02 — Workstream D (interior identity)

Wave 1.5 gate: before/after screenshot review of phone, three venue panels,
three street stretches, five interiors — judged against this contract; then
Wave 1 story resumes (Beat 3, breakdown reversal).

Schedule impact: ~2 days at current cadence. Wave 1 close moves to ~Jul
22–24; the Aug 5–12 launch window stands (buffer absorbs this).
