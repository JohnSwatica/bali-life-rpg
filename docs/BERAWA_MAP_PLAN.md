# Berawa Map Plan

This is a compressed playable Berawa slice, not a 1:1 survey map. North is up. South leads toward Berawa Beach. East bends toward Jl. Tegal Sari. The current goal is geographic credibility and readable play, not exact GIS accuracy.

## Coordinate Model

- World size remains `2400 x 1700`.
- `y` decreases northward and increases southward.
- Roads are data-driven in `src/data/berawaLayout.ts`.
- Road paths, area discovery radii, and venue map nodes should be edited there before adding more drawing code to `GameScene`.

## Current Anchors

- `Jl. Pantai Berawa`: north-south spine that bends south-west toward Berawa Beach.
- `Jl. Nelayan`: west-east northern connector.
- `Jl. Tegal Sari`: eastern north-south/diagonal connector.
- `FINNS / Club Lane`: branch toward the FINNS/Canggu Club/Recreation Club area.
- `Berawa Cafe Lane`: compressed cafe/market lane tying Canggu Station, Milk & Madu, and Bungalow Living into the gameplay loop.
- `Berawa Beach Access`: southern route toward sand, beach pickups, surf/sunset activities.
- `Soft Shortcut`: deliberately risky lane near the mud zone.

## Discovery Rules

- The road network can remain visually readable.
- Area and venue labels are hidden until discovered, unless dev reveal-all is enabled.
- `WorldState.mapDiscovery` stores discovered area IDs, discovered venue IDs, and the reveal-all flag.
- The Phone Map and Venue tabs should read from discovery state rather than listing everything by default.

## Venue Quality Data

Venue quality fields exist for later curation:

- `ratingSource`
- `rating`
- `reviewCount`
- `lastVerifiedAt`
- `verificationStatus`
- `isPriorityVenue`
- `venueCategory`
- `mapVisibility`
- `discoveryState`

The helper threshold is `rating >= 4.5 && reviewCount >= 300`. No Google Places API, scraping, or live accuracy claim exists yet. Current candidate venues are manually seeded or marked as needing verification.

## Next Map Pass

- Move building drawings closer to their layout nodes as roads continue to settle.
- Add lane names/signposts only where the player discovers or approaches them.
- Add a compact phone map view after the discovery model is proven in the world/Phone lists.
- Curate a small verified Berawa venue list through an admin file or future Places integration.
