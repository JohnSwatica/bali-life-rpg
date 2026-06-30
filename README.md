# Bali Life RPG

A polished 2D browser RPG vertical slice built with Phaser 3, TypeScript, and Vite.

The game is scoped as a foundation: one dense Berawa, Canggu-inspired neighborhood around the FINNS/Jl. Pantai Berawa area, a controllable player, NPC routines, real-world venue anchors, inventory, quests, money, meters, time of day, local saves, and multiplayer-ready seams without pretending this is already a large open world.

Current progression spine:

```text
Act 0 arrival -> Act 1 hustle -> Act 2 people -> Act 3 build -> Act 4 solo win -> Act 5 open world
```

See `AGENTS.md`, `STATE.md`, `STORY_ARC.md`, and `docs/ROADMAP.md` before continuing development in a new tab.

## Run Locally

```bash
npm install
npm run dev
```

Open the printed localhost URL. The default dev server target is:

```text
http://127.0.0.1:5173/
```

## Controls

- Move: `WASD` or arrow keys
- Interact: `E`
- Inventory/quest bag: `I`
- Phone: `P`
- Save: `F5`
- Close panel: `ESC`
- Clear local save for testing: `F9`
- Mobile: on-screen joystick, `ACT`, `BAG`, `BIKE`, `PHONE`, and `SAVE` buttons

## Current Vertical Slice

- Top-down neighborhood map: an authored `32px` tile street for Jl. Pantai Berawa, using OSM/curated coordinates as sequencing/reference data rather than the active renderer.
- Player movement with keyboard and touch controls.
- NPCs with daily routines:
  - Ibu Sari: Canggu Station grocer and restock quest giver.
  - Kadek: FINNS-side runner and bakery quest giver.
  - Made: Bungalow Living stylist.
  - Ari: Berawa surfer.
- Shops and stalls:
  - Canggu Station: groceries, coconuts, snacks, and coffee.
  - Milk & Madu Berawa: brunch, coffee, coconuts.
  - BAKED. Berawa: croissants, beans, and coffee.
  - Bungalow Living Bali: homewares, sarongs, and beach totes.
  - Satu-Satu Coffee Company: beans, coffee, and pastry basics.
- Inventory, money, buying, selling, pickups, and quest rewards.
- Daily-life meters: Energy, Wellbeing, Focus, and Social.
- Act 0 / Act 1 hustle state: guided first day, borrowed scooter, first delivery, repeat delivery board, driver rating, rent pressure, scooter condition/repair/upgrade, and move-out readiness.
- Act 2 social handoff: Ari's invite, guide markers, club goals, recurring events, relationship arcs, and club-gated opportunities.
- Two starter quests:
  - Canggu Station Restock: bring two coconuts to Ibu Sari.
  - Berawa Bakery Run: buy a croissant from BAKED. Berawa and bring it to Kadek.
- Day/night cycle with clock, dusk/night overlay, and lantern glow.
- Save/load through `localStorage` with schema migration through v11.
- Phone UI shell with Map, Contacts, Quests, Calendar, Profile, Events, Venues, and Community tabs.
- Single-player portal is active; multiplayer portal is visible but locked.
- First-class venue, event, profile, reputation, relationship-memory, and simulated offline-activity foundations.

## Venue Grounding

The rendered venue set comes from `src/data/curatedVenues.ts`: 41 Berawa-area venues, including game-anchor venues required for quests/shops. The offline generator resolves coordinates OSM-first from the committed Overpass cache, then cached Nominatim, then explicitly flagged estimates/fallbacks in `data/osm/berawa.curated-coords.json`.

The active playable map is now `src/data/authoredStreetLayout.ts`, generated from a hand-authored street template in `src/data/streetTemplates.ts`. OSM/generated coordinates remain committed for auditability and street ordering, but the game no longer renders the full projected road tangle as the playable surface.

Map data © OpenStreetMap contributors. The generated layout is derived offline from cached OpenStreetMap/Nominatim/Overpass data in `data/osm/`; the game does not make map network calls at runtime.

To regenerate the local layout from the committed cache:

```bash
npm run generate:layout
```

To intentionally refresh source data from OSM services on a dev machine:

```bash
npm run generate:layout -- --refresh
```

## Project Structure

```text
src/
  data/          Static game content: authored street, generated reference layout, venues, items, NPCs, quests, shops.
  scenes/        Phaser scenes and presentation/gameplay orchestration.
  systems/       State, inventory, quests, persistence, networking adapter.
  styles/        Browser canvas shell styles.
scripts/         Offline tooling such as the OSM layout generator.
data/osm/        Committed OSM/Nominatim/Overpass cache and generation report.
```

The most important foundation is that world state, player entity state, persistence, and the network adapter are separate from rendering. Phaser owns the current local presentation, but the data shape is already moving toward a client/server model.

Runtime saves use `CURRENT_SCHEMA_VERSION = 11` in `src/systems/Persistence.ts` and migrate older valid saves in place. Static catalogs such as venues, events, generated reference layout, authored street templates, and simulated offline activities live in `src/data` and are not persisted.

## Build

```bash
npm run build
```

The production bundle is emitted to `dist/`.
