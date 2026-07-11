# RPG-20260708-06 Street Legibility Proof

Date: 2026-07-11  
Viewport: 1280x800 desktop  
Branch: `feat/rpg-20260706-09-rio-race`

## Findings And Fixes

| Item | Before | After |
| --- | --- | --- |
| Venue labels | Permanent signs competed across the whole visible strip. | At most the nearest three signs inside a 400px world radius render; their alpha rises with proximity. |
| Orphan markers | World scenes and field indicators could use a map node even when no authored building slot existed. | All opportunity, event, race, and guidance markers share `resolveWorldSceneVenueAnchor()` and suppress unresolved anchors. |
| Buildings | Light plot tiles and building fills were too similar to walkable ground. | Dark foundations, perimeter shadows, inset walls, and roof edges establish a consistent non-walkable visual mass. |
| Paddies | The automated route never framed the western field dressing, producing a false "missing paddies" read. | The paddies were already rendering. Browser proof confirms the yellowing Corner patch and green terraces; no paddy data was relocated. |
| Camera | Desktop/mobile street zoom was `1.60` / `1.28`. | Street zoom is `1.76` / `1.38`; interior camera math and zoom-compensated HUD remain unchanged. |
| Landmark | No tall silhouette oriented the player above venue roofs. | One original procedural FINNS tower rises above the strip near the recreation-club anchor. |
| Map increment | The yellowing paddy could be seen but had no authored approach path. | `corner_paddy_edge_path` adds a 10x1-tile dirt alley between the sidewalk and paddy edge, is represented on the minimap, and is included in authored playable-point/bounds checks. |

The parcel does not move a venue or add content. It occupies the existing gap between BAKED and Bungalow Living, intersects no building slot or collision rectangle, and remains well below the per-packet map-growth cap.

## Visual Proof

- Baseline world: `tmp/street-legibility-2026-07-11/01-before-world.png`
- Nearest-three labels, building treatment, tighter camera, and western paddy: `tmp/street-legibility-2026-07-11/02-after-near-baked.png`
- FINNS tower at desktop scale: `tmp/street-legibility-2026-07-11/03-after-finns-tower-desktop.png`
- Player standing on the paddy-edge parcel, desktop without touch chrome: `tmp/street-legibility-2026-07-11/04-after-paddy-path-desktop.png`

## GTA:CW Pillar 2 Assessment

The strip now reads as a compact route rather than a venue diagram: the camera carries more authored street per pixel, three nearby names are enough to navigate without a label wall, buildings have clear mass, and the FINNS tower provides a persistent world landmark. It is materially denser and more legible, but it is not yet at GTA:CW's city richness: prop repetition and the single-corridor topology remain visible. Those are content/layout questions for feedback-led future packets, not reasons to widen this polish pass.

## Verification

- `npm test -- --run`: 38 files, 245 tests passed.
- `npm run build`: passed.
- Browser: labels, building mass, camera/HUD, paddies, landmark, minimap, and walk-on parcel checked at 1280x800.

