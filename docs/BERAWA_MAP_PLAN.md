# Berawa Map Plan

The active playable Berawa slice is now an authored tile-based street template for `Jl. Pantai Berawa`. OpenStreetMap/generated coordinates are retained as the sequencing reference for venue order, but the runtime surface is a clean grid-made street rather than the full projected OSM road tangle.

The old OSM-generated layout remains in the repo as reviewable source/reference data. It is not the active playable surface on the current branch.

Map data © OpenStreetMap contributors.

## Source Data

- Generator: `scripts/generateLayoutFromOSM.ts`
- Curated venue catalog: `src/data/curatedVenues.ts`
- Generated runtime layout: `src/data/berawaLayout.ts`
- Active authored street adapter: `src/data/authoredStreetLayout.ts`
- Active street template: `src/data/streetTemplates.ts`
- Tile scale and original tileset: `src/systems/map/TileStreetScale.ts`
- Street renderer: `src/systems/map/StreetRenderer.ts`
- Cached geocoded anchors: `data/osm/berawa.anchors.json`
- Cached curated geocode attempts: `data/osm/berawa.curated-geocode.json`
- Resolved curated venue coordinates: `data/osm/berawa.curated-coords.json`
- Cached Overpass extract: `data/osm/berawa.overpass.json`
- Generation report: `data/osm/berawa.layout-report.json`

The game never calls OSM, Nominatim, or Overpass at runtime. `npm run build` reads only committed source files.

## Active Runtime: Authored Tile Street

The first authored street is:

```text
id = jl_pantai_berawa
name = Jl. Pantai Berawa
tile = 32 px
world = 120 x 85 tiles = 3840 x 2720 px
axis = vertical
roadWidthTiles = 6
sidewalkTiles = 2
slotDepthTiles = 5
camera zoom = 1.6 desktop / 1.28 mobile
```

`src/data/streetTemplates.ts` now uses an explicit authored walking order for Jl. Pantai Berawa from beach to inland. OSM/curated coordinates remain the sequencing/audit reference, but the active template no longer relies on coordinate projection to derive slot order. Beach-end venues sit at the seaward end; inland venues move toward the top of the strip.

The current template renders 31 Jl. Pantai Berawa/beach venues plus one temporary quest-critical side-street stub for `canggu_station`. That exception preserves the Ibu Sari starter quest and Canggu Station shop until a future Raya Semat/Canggu Station street template exists.

Terrain is original generated tile art: grass, road, sidewalk, sand, water, water edge, dock planks, trees, bushes, flowers, roof/wall tiles, and plots. It is intentionally original and asset-light; it follows clarity principles from top-down games without copying any Nintendo/Pokémon/Game Freak assets.

Gameplay uses `src/data/authoredStreetLayout.ts`, which exports the same runtime shapes the old generated layout exposed:

- `berawaRoads`
- `berawaAreas`
- `venueMapNodes`
- `curatedVenueNodes`
- `berawaMapFeatures`

`layoutLookup.ts` now resolves shops, NPC routine stops, pickups, and spawn from those authored venue nodes. Existing IDs stay stable.

## Current Bbox

The generator resolves every curated venue through an OSM-first cascade, frames the projection to the resolved venue cloud, and filters the larger committed Overpass extract to that gameplay frame. The same projection is used for roads, venues, and OSM beach/coastline/water features. The current generated bbox is:

```text
south = -8.670936365
west  = 115.129708015
north = -8.648184935
east  = 115.150871885
```

Seed/fallback bbox if geocoding is incomplete:

```text
south = -8.685
west  = 115.125
north = -8.655
east  = 115.145
```

## Projection

The projection is local equirectangular with uniform scale, so road angles are preserved:

- `x` increases eastward.
- `y` increases southward after the projection flip.
- North is up.
- The beach/ocean side lands toward the lower-left / southwest.
- Jl. Nelayan sits north of the beach side.
- Jl. Tegal Sari / inland anchors sit east / northeast relative to the beach edge.

The generator keeps the source world size:

```text
WORLD = { w: 2400, h: 1700 }
pad = 80
```

Runtime presentation currently applies:

```text
WORLD_SCALE = 1.6
runtime world = 3840 x 2720
```

Pre-v4 saved runtime positions are migrated into this enlarged world during save load. Source OSM/curated coordinates, `src/data/berawaLayout.ts`, `src/data/curatedVenues.ts`, and `data/osm/berawa.curated-coords.json` stay untouched by presentation scaling.

## OSM Reference Shape

`src/data/berawaLayout.ts` still exports the generated shapes used as reference data:

- `berawaRoads`
- `berawaAreas`
- `venueMapNodes`
- `curatedVenueNodes`
- `berawaMapFeatures`

Internally, the generator keys road vertices by OSM node id before emitting path data. That means OSM ways that share a node project to the same game coordinate, so real junctions connect rather than drifting apart. On the authored-street branch this remains useful for review, coordinate debugging, and venue sequencing, not for active road rendering.

Curated venue content in `src/data/venues.ts` remains authoritative for existing gameplay names, descriptions, NPC links, items, quests, and quality fields. `src/data/curatedVenues.ts` supplies the rendered map venue set, quality threshold, and geocode queries. The coordinate cascade is:

1. Match the venue name against cached OSM POIs from `data/osm/berawa.overpass.json`.
2. Else use cached Nominatim results from `data/osm/berawa.curated-geocode.json`.
3. Else use `estimatedCoord` and flag it as unverified.
4. Else place near the venue area and flag it for manual correction.

The current coordinate summary is 41 rendered venues: 23 OSM POI matches, 0 Nominatim matches, 15 flagged estimates, and 3 flagged fallbacks. The manual-check list lives in `data/osm/berawa.curated-coords.json`.

Previous runtime rendering used one blocky building per `shouldRender` curated venue, plus baked roads, OSM beach/coastline/water features, and low-cost greenery. That projected renderer is now demoted in favor of the authored tile street. The generator and caches remain committed so venue coordinates and ordering can be audited/regenerated.

Presentation scale is intentionally stylized. Real positions stay OSM/curated-coordinate driven, while roads, buildings, and camera zoom are sized from `src/systems/map/PlayerUnitScale.ts` in player-units so the top-down view reads more like a Pokémon-scale life sim than a literal metre map. `src/systems/map/RoadPresentation.ts` renders a decluttered road skeleton for readability while venue buildings snap against a richer local road graph for believable shopfront placement.

Current presentation constants:

- `WORLD_SCALE = 1.6`
- player unit `34 x 43`
- avatar scale `0.84`; player/group bike `0.82`; traffic bike `0.88`
- road widths: main `155`, secondary `95`, lane `69`
- camera zoom: desktop `1.86`, mobile `1.52`
- building multiples: normal `4.2 x 3.6`, wide `4.6 x 3.8`, quest-critical `5.0 x 4.0`, landmark `8.8 x 7.2`, beach landmark `9.2 x 5.8`, beach marker `5.0 x 3.8`

Venue buildings are road-snapped but rendered axis-aligned for readability. Dense clusters de-overlap first along road tangents, then use a final small axis-aligned presentation spacing pass if tangent movement cannot clear a cross-street overlap. This keeps source positions reviewable while making individual buildings tappable/readable.

The game still includes a lightweight top-left minimap. On the authored street it shows the simplified street strip, beach/water edge, camera viewport, player heading, and discovered venue dots. Ambient traffic scooters now follow the authored street road path rather than the projected OSM road graph.

The current expanded Overpass cache contributes 934 road paths and 12 terrain features: 5 beach polygons, 4 coastline paths, and 3 water shapes. Beach/coastline rendering is still stylized, but its shape now follows OSM data rather than a fixed rectangular band.

`src/systems/map/WaterBoundary.ts` derives a soft runtime boundary from those same generated terrain features. Rendered sea/waterway areas nudge the player back with a short toast; beach polygons remain walkable. This replaces the old broad `ocean-block` rectangle in `src/data/map.ts` while avoiding brittle physics polygons along the jagged OSM coastline.

## Discovery Rules

- Roads render immediately so navigation is readable.
- Area and venue names remain hidden until discovered, unless dev reveal-all is enabled.
- `WorldState.mapDiscovery` persists discovered area IDs, discovered venue IDs, and reveal-all state.
- Starting discovery is tuned around the cafe/FINNS cluster; the beach is not revealed until the player approaches it.

## How To Regenerate

Use the committed cache for normal deterministic regeneration:

```bash
npm run generate:layout
```

The command rewrites `src/data/berawaLayout.ts`, `data/osm/berawa.curated-coords.json`, and `data/osm/berawa.layout-report.json`. A cache-only rerun should be deterministic.

Only refresh from OSM services intentionally:

```bash
npm run generate:layout -- --refresh
```

`--refresh` refreshes both Nominatim anchor results and the Overpass extract. For narrower refreshes:

```bash
npm run generate:layout -- --refresh-geocode
npm run generate:layout -- --refresh-osm
```

## Adding A Future Neighborhood

Do not build another neighborhood in this sprint. The generator is already shaped so a future Uluwatu/Ubud/etc. pass can add a new config with:

- a neighborhood id
- anchor queries
- seed/fallback bbox
- area specs
- cache paths
- output path
- the same `{ w, h }` world target or a deliberate new one

Future neighborhoods should keep using generated/curated coordinates for ordering and auditability, but playable street surfaces should be authored templates unless a generated layout is proven readable.

## Adding The Next Street Template

Add another readable street by data, not by rewriting `GameScene`:

1. Keep venue identities in `src/data/curatedVenues.ts` and `src/data/venues.ts`.
2. Add a new `StreetTemplate` instance in `src/data/streetTemplates.ts`.
3. Filter/sequence the relevant venue set using generated coordinates as the ordering reference.
4. Assign those venues to left/right slots with stable `venueId`s.
5. Export the desired active template through `src/data/authoredStreetLayout.ts`, or extend that adapter to expose multiple connected street templates.
6. Keep shops/NPCs/pickups using `layoutLookup.ts` so gameplay follows the selected authored venue nodes.

The next likely candidate is a Raya Semat/Canggu Station side street, which would let the temporary `canggu_station` stub move into its proper authored street.

## Next Map Pass

- Human-test the authored street on the real screen and phone: walkability, labels, building proportions, shop approach, and traffic feel.
- Add a proper Raya Semat/Canggu Station street template and remove the temporary Canggu Station side-street stub.
- Add explicit tile collision for water/buildings only after the authored street feel is stable; current water boundary remains soft feedback.
- Use the OSM/curated coordinates for sequencing and audits, not as the active playable renderer.
