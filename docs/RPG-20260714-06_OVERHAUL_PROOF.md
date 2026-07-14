# RPG-20260714-06 — Venue Purpose, Street Density, Interior Identity Proof

Packet: `[RPG-20260714-06]`  
Map delta: none — static dressing and content curation only  
Baseline: `be28ffd`  
Schema: v11 unchanged

## Result

Venue panels now lead with one identity sentence and show only venue-specific
actions (maximum three), alongside their retained shop/story counter where
applicable. The former category fallback rows no longer appear. Street detail
uses a single baked static render texture for the new place-telling props, so
the denser authored corridor has no added per-frame Graphics work. Interior
stations, exit mats, counters, doors, and interaction radii are unchanged.

## Full venue action classification

| Venue | Prior/current row | Decision | Shipped treatment |
| --- | --- | --- | --- |
| Canggu Station / Warung Sari | Buy/sell counter | KEEP | Pantry counter remains unchanged. |
| Canggu Station / Warung Sari | Ibu needs a hand — lunch rush | KEEP | SERVE loop and Ibu safety-net role retained. |
| Canggu Station | Shop for the day | CUT | Duplicated the real buy/sell counter. |
| Milk & Madu | Work session | REWRITE | `Work the Milk & Madu table`; scoped to Milk & Madu. |
| Milk & Madu | Grab coffee | REWRITE | `Order a Milk & Madu coffee`; scoped to Milk & Madu. |
| Milk & Madu | Eat properly | REWRITE | `Sit down for Milk & Madu brunch`; scoped to Milk & Madu. |
| Milk & Madu | Shared cafe deep-work/brunch/caffeine rows | CUT | Replaced by the three Milk & Madu-specific rows above. |
| Milk & Madu | Buy/sell counter | KEEP | Existing cafe counter remains available. |
| BAKED. Berawa | Buy/sell counter | KEEP | Pastry/bean counter remains the venue action. |
| BAKED. Berawa | Shared cafe work/coffee/meal rows | CUT | BAKED is a bakery counter and Kadek story stop, not another generic cafe menu. |
| Bungalow Living | Buy/sell counter | KEEP | Homeware counter remains available. |
| Bungalow Living | Shared lifestyle fallback | CUT | Made's room scene/goal remains the authored reason to return. |
| Satu-Satu | Deep work table / brunch table / quick caffeine | KEEP | The three existing actions stay as Satu-Satu's focus-and-coffee loop. |
| Satu-Satu | Shared Work session / Grab coffee / Eat properly | CUT | No duplicated generic rows. |
| Scooter Rental | Buy/rental counter | KEEP | Existing rental counter remains unchanged. |
| Scooter Rental | Repair and upgrade counter | KEEP | Milestone-critical repair/upgrade flow remains unchanged. |
| Scooter Rental | Leo encounter, race rail, No-Questions scene | KEEP | Story/RIDE/TALK content remains on the counter surface. |
| Scooter Rental | Generic transport fallback | CUT | No filler rows were added. |
| Berawa Beach | Surf session / reflective beach walk / cleanup chat | KEEP | Three place-specific RIDE/TALK/SERVE-adjacent actions. |
| Berawa Beach | Surf / beach time / Relax-hangout fallback | CUT | Replaced by the three authored beach actions. |
| FINNS Beach Club | Sunset table / big night / leave early | KEEP | Three deliberate social choices remain. |
| FINNS Beach Club | Night out / Relax-hangout fallback | CUT | Replaced by the authored FINNS set. |
| Ulekan Berawa | Nasi reset / local chat / budget takeaway | KEEP | Three warung-specific choices remain. |
| Tropical Nomad / Outpost | Focus sprint / accountability chat / admin reset | KEEP | Three coworking-specific choices remain at each venue. |
| Cheap Kos | Sleep / plan tomorrow / prep snack | KEEP | Home loop remains unchanged. |
| Nude, Mowies, FINNS Recreation, other curated storefronts | Category fallback rows | CUT | A storefront with no authored verb no longer pretends to offer a generic daily loop. |

No Settling In goal retune was needed: `Find your spot` still counts three
completed actions at one venue, and Milk & Madu, Satu-Satu, beach, FINNS,
Ulekan, coworking, and the kos all retain three valid actions.

## Outdoor curation

Removed as purposeless visual noise:

- Three sleeping-dog props (`dog_bungalow_lane`, `dog_cafe_strip`, and
  `dog_beach_approach`).

Added as static place/direction/availability cues:

- canang sari at Station, Milk & Madu, Satu-Satu, and beach thresholds;
- laundry spanning kos-side building gaps;
- clustered parked scooters at Satu-Satu, Milk & Madu, and the rental;
- warung steam plus produce crates at the Station end;
- surfboards, tote, and beach gear at the beach end; and
- kerb/drainage strips at the road edge only.

`layoutInvariants.test.ts` asserts the dressing kinds, verifies all texture
props remain outside the rideable road band, and preserves the existing
interaction-footprint, entrance, station, and playable-bounds tests.

## Interior identity

| Interior | Static identity dressing |
| --- | --- |
| Warung Sari | Pans, three counter stools, and condiment caddy. |
| BAKED. Berawa | Cooling racks, flour sacks, trays, and the existing oven. |
| Milk & Madu | Occupied tables, espresso machine, counter, and menu board. |
| Scooter rental | Parts wall, hanging tools, workbench, and parked scooters. |
| Satu-Satu | Roaster drum, bean sacks, shared work table, and laptops. |
| Bungalow Living | Fabric racks, cushions, and an unmistakable visible doorway to Made's hidden room. |

## Browser before/after proof

All shots use the same `act1_steady_runner` state and `scripts/beatProof.mjs`.
The **before** run used a detached worktree at `be28ffd`; the temporary
dev-only panel/interior hooks only call the existing rendering handlers.

| Required frame | Before (`be28ffd`) | After |
| --- | --- | --- |
| Station shop panel | `tmp/beat-proof/venue-world-overhaul-before/panel-station-shop-*.png` | `tmp/beat-proof/venue-world-overhaul-after/panel-station-shop-*.png` |
| Milk & Madu cafe panel | `tmp/beat-proof/venue-world-overhaul-before/panel-milk-madu-cafe-*.png` | `tmp/beat-proof/venue-world-overhaul-after/panel-milk-madu-cafe-*.png` |
| Scooter rental panel | `tmp/beat-proof/venue-world-overhaul-before/panel-rental-*.png` | `tmp/beat-proof/venue-world-overhaul-after/panel-rental-*.png` |
| Station-end street | `tmp/beat-proof/venue-world-overhaul-before/street-station-*.png` | `tmp/beat-proof/venue-world-overhaul-after/street-station-*.png` |
| Mid-street | `tmp/beat-proof/venue-world-overhaul-before/street-mid-*.png` | `tmp/beat-proof/venue-world-overhaul-after/street-mid-*.png` |
| Beach-end street | `tmp/beat-proof/venue-world-overhaul-before/street-beach-*.png` | `tmp/beat-proof/venue-world-overhaul-after/street-beach-*.png` |
| Warung interior | `tmp/beat-proof/venue-world-overhaul-before/interior-warung-*.png` | `tmp/beat-proof/venue-world-overhaul-after/interior-warung-*.png` |
| BAKED interior | `tmp/beat-proof/venue-world-overhaul-before/interior-baked-*.png` | `tmp/beat-proof/venue-world-overhaul-after/interior-baked-*.png` |
| Milk & Madu interior | `tmp/beat-proof/venue-world-overhaul-before/interior-milk-madu-*.png` | `tmp/beat-proof/venue-world-overhaul-after/interior-milk-madu-*.png` |
| Scooter rental interior | `tmp/beat-proof/venue-world-overhaul-before/interior-rental-*.png` | `tmp/beat-proof/venue-world-overhaul-after/interior-rental-*.png` |
| Bungalow Living interior | `tmp/beat-proof/venue-world-overhaul-before/interior-bungalow-*.png` | `tmp/beat-proof/venue-world-overhaul-after/interior-bungalow-*.png` |
| Satu-Satu interior (additional) | `tmp/beat-proof/venue-world-overhaul-before/interior-satu-satu-*.png` | `tmp/beat-proof/venue-world-overhaul-after/interior-satu-satu-*.png` |
| 390×844 street | `tmp/beat-proof/venue-world-overhaul-before/mobile-street-*.png` | `tmp/beat-proof/venue-world-overhaul-after/mobile-street-*.png` |
| 390×844 venue panel | `tmp/beat-proof/venue-world-overhaul-before/mobile-milk-madu-panel-*.png` | `tmp/beat-proof/venue-world-overhaul-after/mobile-milk-madu-panel-*.png` |

The desktop and mobile captures completed with zero page/console errors. The
mobile panel retains all three Milk & Madu actions without overflow.

## Frame-rate sanity

The harness samples `requestAnimationFrame` for roughly 2.2 seconds at the
same captured street positions. The new props are baked into one compact
render texture at scene setup, not redrawn each frame.

| View | `be28ffd` | After | Delta |
| --- | ---: | ---: | ---: |
| 1280×800 Station street | 42.41 FPS | 43.68 FPS | +1.27 (+3.0%) |
| 390×844 mid-street | 35.82 FPS | 35.78 FPS | -0.04 (-0.1%) |

The headless browser is below display refresh, so this is a comparative sanity
check rather than a device benchmark. It shows no meaningful density-related
frame drop; physical mobile performance remains a hardware QA item.

## Riders and verification

- The move-out Goal copy interpolates `ACT1_MOVE_OUT_DELIVERY_EARNINGS`, so it
  now reads **Rp 600** from the shared milestone constant rather than a stale
  literal.
- The Goals tab no longer inserts “No active quests…” above its active tracked
  goals; the empty-state string is absent whenever the goal list is present.
- `npm test -- --run` — **46 files / 299 tests passed, 0 skipped**.
- `npm run build` — passed (`tsc` + Vite production build).
- Act 0 critical-path menu counter, Act 1 story tests, and layout invariants
  remain green. No schema, story, economy, map geometry, weather, lighting,
  audio, HUD, phone-tab, interaction-position, or interaction-radius changes.
