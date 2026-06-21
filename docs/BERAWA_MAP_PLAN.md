# Berawa Map Plan

This playable Berawa slice is now generated from OpenStreetMap data plus a curated Berawa venue catalog, not hand-invented road coordinates. It is still compressed into the existing `2400 x 1700` world so the current Phaser camera, saves, movement, shops, NPCs, and discovery systems remain stable.

Map data © OpenStreetMap contributors.

## Source Data

- Generator: `scripts/generateLayoutFromOSM.ts`
- Curated venue catalog: `src/data/curatedVenues.ts`
- Generated runtime layout: `src/data/berawaLayout.ts`
- Cached geocoded anchors: `data/osm/berawa.anchors.json`
- Cached curated geocode attempts: `data/osm/berawa.curated-geocode.json`
- Resolved curated venue coordinates: `data/osm/berawa.curated-coords.json`
- Cached Overpass extract: `data/osm/berawa.overpass.json`
- Generation report: `data/osm/berawa.layout-report.json`

The game never calls OSM, Nominatim, or Overpass at runtime. `npm run build` reads only committed source files.

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

The generator keeps the existing world size:

```text
WORLD = { w: 2400, h: 1700 }
pad = 80
```

## Runtime Shape

`src/data/berawaLayout.ts` still exports the shapes the game already consumes:

- `berawaRoads`
- `berawaAreas`
- `venueMapNodes`
- `curatedVenueNodes`
- `berawaMapFeatures`

Internally, the generator keys road vertices by OSM node id before emitting path data. That means OSM ways that share a node project to the same game coordinate, so real junctions connect rather than drifting apart.

Curated venue content in `src/data/venues.ts` remains authoritative for existing gameplay names, descriptions, NPC links, items, quests, and quality fields. `src/data/curatedVenues.ts` supplies the rendered map venue set, quality threshold, and geocode queries. The coordinate cascade is:

1. Match the venue name against cached OSM POIs from `data/osm/berawa.overpass.json`.
2. Else use cached Nominatim results from `data/osm/berawa.curated-geocode.json`.
3. Else use `estimatedCoord` and flag it as unverified.
4. Else place near the venue area and flag it for manual correction.

The current coordinate summary is 41 rendered venues: 23 OSM POI matches, 0 Nominatim matches, 15 flagged estimates, and 3 flagged fallbacks. The manual-check list lives in `data/osm/berawa.curated-coords.json`.

Runtime rendering is intentionally simple: one blocky building per `shouldRender` curated venue, plus baked roads, OSM beach/coastline/water features, and low-cost greenery. The old hand-placed building/market/decor layer and dense road-marker layer are no longer called.

Presentation scale is intentionally stylized. Real positions stay OSM/curated-coordinate driven, while roads, buildings, and camera zoom are sized from `src/systems/map/PlayerUnitScale.ts` in player-units so the top-down view reads more like a Pokémon-scale life sim than a literal metre map. `src/systems/map/RoadPresentation.ts` renders a decluttered road skeleton for readability while venue buildings snap against a richer local road graph for believable shopfront placement.

The game now includes a lightweight top-left minimap using the same road skeleton, discovered venue dots, water/beach edge, camera viewport, and player heading. Ambient traffic scooters follow eligible real road polylines, can turn at shared generated nodes, and respawn at route edges.

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

The runtime should keep consuming generated data catalogs rather than hand-placing roads.

## Next Map Pass

- Manually verify or correct the flagged estimate/fallback coordinates in `data/osm/berawa.curated-coords.json`.
- Tune the Pokémon-scale table, camera zoom, minimap size, and road-following traffic density/speeds by phone and trackpad play-feel.
- Play-feel test and tune the coastline soft-boundary nudge distance/message if it feels too abrupt.
- Add a richer phone map only after the lightweight minimap and discovery state remain stable on the OSM layout.
