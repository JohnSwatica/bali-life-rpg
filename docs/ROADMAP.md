# Expansion Roadmap

## Next Gameplay Steps

- Add interiors for Canggu Station, Milk & Madu Berawa, BAKED. Berawa, Bungalow Living Bali, and Satu-Satu Coffee Company.
- Convert quest logic into data-driven objective handlers.
- Expand relationship/friendship values per NPC and venue.
- Expand the phone calendar with more Berawa surf mornings, cafe busy hours, and FINNS-area events.
- Add cooking or crafting using grocery and cafe ingredients.
- Add selectable venue detail pages and richer profile editing inside the phone.

## Future Opening Tutorial

Do not build a full tutorial system until the core slice stabilizes. The intended tutorial is a Pokemon-style opening walkthrough led by a local NPC who introduces the player to Berawa as a daily-life loop, not a combat loop.

Planned beats:

- Movement: WASD/arrows, touch joystick, and the idea that walking is intentionally inefficient across Berawa.
- Interaction: `E` / `ACT` with NPCs, shops, pickups, venues, activities, and flagged-only community enforcement.
- Phone: `P` / mobile `PHONE`, including Map, Quests, Profile/lifestyle tags, Venues, Events, and Community.
- Shops: buy/sell basics at Canggu Station or a cafe, with money shown as a local-life resource.
- Starter quests: restock/help errands that teach pickups, buying, and quest turn-ins.
- Scooter rental: earn enough money, rent a scooter, toggle with `B`, and understand road speed vs. mud/sand risk.
- Save/load: teach `F5`, autosave expectations, and localStorage persistence.
- Map discovery: reveal areas and venue names by visiting them rather than seeing a complete named map from minute one.
- Social/event systems: join a low-stakes interest group and see line-following/group movement as the bridge to future real-world events.

Current placeholder: a first-run hint panel lists only the basic controls. It is intentionally not a quest/tutorial engine.

## Art and UX

- Replace procedural character placeholders with authored sprite sheets.
- Add walking animations and direction-specific sprites.
- Add subtle ambient sound and shop/NPC interaction sounds.
- Improve sign readability and add more environmental props.
- Add an options menu for audio, text speed, and touch-control layout.

## Technical

- Split `GameScene` into renderer, interaction, UI, and simulation controllers as content grows.
- Add unit tests for inventory, quests, persistence migration, and shop transactions.
- Add a schema validator for save files and network patches.
- Add an event bus for world interactions.
- Add server-authoritative multiplayer following `MULTIPLAYER_ROADMAP.md`.
- Back `PlayerProfile` with a shared remote account when the companion co-living app exists.
- Replace placeholder venue commerce/check-in/booking/delivery fields with real service integrations only after venue ownership and trust rules exist.
