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

- Top-down neighborhood map: compressed Jl. Pantai Berawa / FINNS-area streets, Berawa Beach edge, cafe/grocery/homeware stops, villas, shortcut lanes, scooters, palms, umbrellas, and lanterns.
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

The current venue set is grounded in map-findable Berawa/FINNS-area places: FINNS Recreation Club, Canggu Station, Milk & Madu Berawa, BAKED. Berawa, Bungalow Living Bali, and Satu-Satu Coffee Company. The game compresses distances and uses fictional NPCs/items for playability.

## Project Structure

```text
src/
  data/          Static game content: map, items, NPCs, quests, shops.
  scenes/        Phaser scenes and presentation/gameplay orchestration.
  systems/       State, inventory, quests, persistence, networking adapter.
  styles/        Browser canvas shell styles.
```

The most important foundation is that world state, player entity state, persistence, and the network adapter are separate from rendering. Phaser owns the current local presentation, but the data shape is already moving toward a client/server model.

Runtime saves use `schemaVersion: 2` and migrate valid v1 saves in place. Static catalogs such as venues, events, and simulated offline activities live in `src/data` and are not persisted.

## Build

```bash
npm run build
```

The production bundle is emitted to `dist/`.
