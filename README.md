# Bali Life RPG

A polished 2D browser RPG vertical slice built with Phaser 3, TypeScript, and Vite.

The game is scoped as a foundation: one dense Berawa, Canggu-inspired neighborhood around the FINNS Club area, a controllable player, NPC routines, real-world venue anchors, inventory, quests, money, time of day, local saves, and multiplayer-ready seams without pretending this is already a large open world.

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

- Top-down neighborhood map: OSM-sourced Berawa road, beach, coastline, and water geometry projected into a compressed Jl. Pantai Berawa / FINNS-area slice with simple blocky buildings for the curated venue set.
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
- Two starter quests:
  - Canggu Station Restock: bring two coconuts to Ibu Sari.
  - Berawa Bakery Run: buy a croissant from BAKED. Berawa and bring it to Kadek.
- Day/night cycle with clock, dusk/night overlay, and lantern glow.
- Save/load through `localStorage`.
- Phone UI shell with Map, Contacts, Quests, Calendar, Profile, Events, Venues, and Community tabs.
- Single-player portal is active; multiplayer portal is visible but locked.
- First-class venue, event, profile, reputation, relationship-memory, and simulated offline-activity foundations.

## Venue Grounding

The current rendered venue set comes from `src/data/curatedVenues.ts`: 41 Berawa-area venues, including 7 game-anchor venues required for quests/shops. The offline generator resolves coordinates OSM-first from the committed Overpass cache, then cached Nominatim, then explicitly flagged estimates/fallbacks in `data/osm/berawa.curated-coords.json`. The same cache also supplies static OSM beach/coastline/water features. The game compresses distances and uses fictional NPCs/items for playability.

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
  data/          Static game content: map, generated layout, items, NPCs, quests, shops.
  scenes/        Phaser scenes and presentation/gameplay orchestration.
  systems/       State, inventory, quests, persistence, networking adapter.
  styles/        Browser canvas shell styles.
scripts/         Offline tooling such as the OSM layout generator.
data/osm/        Committed OSM/Nominatim/Overpass cache and generation report.
```

The most important foundation is that world state, player entity state, persistence, and the network adapter are separate from rendering. Phaser owns the current local presentation, but the data shape is already moving toward a client/server model.

Runtime saves use `schemaVersion: 3` and migrate valid v1/v2 saves in place. Static catalogs such as venues, events, generated map layout, and simulated offline activities live in `src/data` and are not persisted.

## Build

```bash
npm run build
```

The production bundle is emitted to `dist/`.
