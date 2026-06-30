# Design Notes

## Creative Direction

`Bali Life RPG` is now grounded in a compressed Berawa, Canggu slice around the FINNS / Jl. Pantai Berawa area. The slice aims for a warm life-sim/RPG feel: street errands, delivery runs, cafe routines, grocery stops, beach groups, and small daily rhythms rather than combat or sprawling exploration.

The product direction is a location-based life sim and social RPG, not a combat RPG. The current code builds seams for profile identity, venue data, events, simulated offline activity, and community trust while keeping the playable slice local and conservative.

The active playable map is an authored tile street with original generated tile art. It uses readable top-down shapes, themed colors, signage, scooters, palms, cafe props, sand/water tiles, and simple character sprites. OSM/curated coordinates are kept as sequencing/reference data, not as the active road renderer.

## Real-World Venue Anchors

The playable map compresses real Berawa-area anchors into a readable authored Jl. Pantai Berawa street:

- FINNS Recreation Club as the main neighborhood landmark.
- Canggu Station as the grocery stop.
- Milk & Madu Berawa as the brunch/cafe stop.
- BAKED. Berawa as the bakery stop.
- Bungalow Living Bali as the homeware/lifestyle stop.
- Satu-Satu Coffee Company as the coffee stop.

NPCs, quest logic, prices, item inventories, authored side-street stubs, and exact walking distances are fictionalized for gameplay.

## Scope Choices

This is intentionally one strong neighborhood, not a large map. The first expansion target should be density: more routines, interiors, richer shop inventories, house access, better dialogue, and event flags.

The core systems already exist:

- World clock and time phase.
- Energy, Wellbeing, Focus, Social meters.
- Player entity state.
- NPC entity state and routines.
- Inventory and money.
- Shops with buy/sell lists.
- Quest start, progress, completion, and rewards.
- Save/load.
- Network adapter stub.
- Locked portal-mode state for future multiplayer.
- Phone shell with map, contacts, quests, calendar, profile, events, venues, and community tabs.
- First-class venue/event/offline-activity catalogs.
- Trust-compatible reputation and relationship-memory state.
- Intent dispatcher for new systems.
- Act 0 / Act 1 hustle state: tutorial progress, active delivery, driver rating, delivery earnings/count, rent target, scooter tier, scooter condition pressure, move-out readiness.
- Act 2 social state: joined clubs, recurring events, relationship arc progress, social goals, and club-gated opportunities.

## Interaction Model

The world uses proximity interactions. The nearest valid target is prompted in the HUD:

- NPC: opens dialogue and can start or complete quests.
- Shop: opens buy/sell UI.
- Pickup: adds an item and starts a respawn timer.

On mobile viewports the same action is exposed through the `ACT` button, while movement uses a virtual joystick.

## Content Hooks

Starter content is deliberately small but expandable:

- `src/data/items.ts`: add prices and descriptions.
- `src/data/shops.ts`: add shop inventories and buy lists.
- `src/data/quests.ts`: add quest metadata.
- `src/data/npcs.ts`: add NPC roles and routine stops.
- `src/data/map.ts`: add collision rectangles and pickups.

Starter quest branching now lives in `src/systems/quests/QuestRegistry.ts`. Further quest growth should continue moving objective checks into data-driven handlers instead of growing `GameScene`.

## Save Data

Save data is stored in `localStorage` under the original key:

```text
bali-life-rpg.berawa-finns.save.v1
```

The runtime payload now carries `CURRENT_SCHEMA_VERSION = 11`. Valid older saves are migrated in place and keep existing world clock, local player state, NPC state, quest flags, pickup respawn data, money, inventory, relationships, reputation, discovery, profile, portal, meters, groups, events, opportunity state, committed activity state, and Act 0/1 hustle state.

Static catalogs such as venues, events, and simulated offline activities live in `src/data` and are not persisted.

Use `F9` during development to clear the save and restart the slice.
