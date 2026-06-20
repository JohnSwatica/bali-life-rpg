# Berawa Map Plan

This playable Berawa slice is now generated from OpenStreetMap data, not hand-invented road coordinates. It is still compressed into the existing `2400 x 1700` world so the current Phaser camera, saves, movement, shops, NPCs, and discovery systems remain stable.

Map data © OpenStreetMap contributors.

## Source Data

- Generator: `scripts/generateLayoutFromOSM.ts`
- Generated runtime layout: `src/data/berawaLayout.ts`
- Cached geocoded anchors: `data/osm/berawa.anchors.json`
- Cached Overpass extract: `data/osm/berawa.overpass.json`
- Generation report: `data/osm/berawa.layout-report.json`

The game never calls OSM, Nominatim, or Overpass at runtime. `npm run build` reads only committed source files.

## Current Bbox

The generator resolves real anchors through Nominatim, verifies them against the seed bbox, pads the resolved extent, and then queries Overpass once. The current generated bbox is:

```text
south = -8.669993906
west  = 115.131881408
north = -8.640953394
east  = 115.156409792
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

Internally, the generator keys road vertices by OSM node id before emitting path data. That means OSM ways that share a node project to the same game coordinate, so real junctions connect rather than drifting apart.

Curated venue content in `src/data/venues.ts` remains authoritative for names, descriptions, NPC links, items, quests, and quality fields. The generator only supplies map positions. If a curated venue cannot be matched to a geocoded anchor or named OSM POI, it is placed near its generated area and listed in `data/osm/berawa.layout-report.json`.

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

The command rewrites `src/data/berawaLayout.ts` and `data/osm/berawa.layout-report.json`. A cache-only rerun should be deterministic.

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

- Move decorative buildings/collision art closer to generated venue nodes.
- Replace old hardcoded traffic lanes with road-following paths.
- Curate fallback venue placements that were not found by Nominatim/OSM POIs.
- Add a compact phone map only after discovery state remains stable on the OSM layout.
