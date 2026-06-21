# AI Handoff / Project State

Last updated: 2026-06-21

Copy/paste this into a new AI session to bring it up to speed.

## Project

- Path: `/Users/z/包包/bali-life-rpg`
- Stack: Phaser 3, TypeScript, Vite.
- Dev URL: `http://127.0.0.1:5173/`
- Current product direction: `Bali Life RPG` is a location-based life sim/social RPG, not a combat RPG.
- Setting: compressed Berawa, Canggu neighborhood around the FINNS/Jl. Pantai Berawa area.
- Current playable mode: local single-player vertical slice.
- Multiplayer: visible in UI as a locked portal only; no real networking/server/backend.
- Current branch for readable-ground/crisp-render work: `fix/readable-ground-crisp`, branched from `feat/pokemon-scale-minimap`.

## What Was Added Recently

- Git is now initialized locally. Baseline and every sprint phase are committed.
- Berawa layout is now generated from OpenStreetMap data plus `src/data/curatedVenues.ts` by `scripts/generateLayoutFromOSM.ts`; runtime consumes static generated data from `src/data/berawaLayout.ts`.
- Curated coordinate resolution is cached at `data/osm/berawa.curated-coords.json`: 41 rendered venues, 23 OSM POI matches, 0 Nominatim matches, 15 flagged estimates, and 3 flagged fallbacks. The estimate/fallback list is the manual-check shortlist, not live truth.
- The generated bbox is now framed to the curated venue cloud and filters the larger OSM cache to 934 road paths.
- Runtime map art now renders baked roads, OSM beach/coastline/water features, greenery, and one simple blocky building per rendered curated venue through `curatedVenueNodes`. The old hand-placed market/building/decor layer and dense road-point marker layer are no longer called.
- The generated layout exports `berawaMapFeatures`: currently 5 beach polygons, 4 coastline paths, and 3 water shapes.
- Readable-ground/crisp-render presentation is complete without changing venue coordinates, `src/data/curatedVenues.ts`, `src/data/berawaLayout.ts`, or `data/osm/berawa.curated-coords.json`.
- Phaser now sizes the canvas to the viewport with device-pixel-ratio zoom, antialiasing enabled, and a DPR/zoom-aware baked static-map texture so the close map view is sharper on high-DPI screens.
- The runtime uses `src/data/scaledBerawaLayout.ts` to scale the generated OSM layout for presentation while leaving `src/data/berawaLayout.ts` untouched. `src/systems/map/WorldScale.ts` currently sets `WORLD_SCALE = 1.6`, so runtime world bounds are `3840 x 2720`.
- `src/systems/map/PlayerUnitScale.ts` is the single player-unit scale table. Current player unit is `34 x 43` after world scaling. Roads: main `3.6` units (`155 px`), secondary `2.2` (`95 px`), lane `1.6` (`69 px`). Buildings: normal `4.2 x 3.6`, wide `4.6 x 3.8`, quest-critical `5.0 x 4.0`, landmark `8.8 x 7.2`, beach landmark `9.2 x 5.8`, beach marker `5.0 x 3.8`.
- Character sprites are slightly reduced for proportion: avatars `0.84`, player/group bike `0.82`, traffic bike `0.88`. Camera zoom is now `1.86` on desktop/tablet-width viewports and `1.52` on narrow mobile viewports.
- Venue buildings are presentation-snapped beside their nearest road segment, then rendered axis-aligned for readability. De-overlap still starts with road-tangent row packing, with a final residual axis pass for dense cross-street clusters. Current automated layout check reports 41 placements, 0 overlaps, max tangent slide about 461.7 px, and max source-to-presentation displacement about 539 px.
- Roads render with higher-contrast walkable surfaces and explicit player-unit class widths; greenery recedes as a flatter base, building shadows are lighter, and venue labels show only near the player and are stack-limited.
- `src/systems/map/RoadPresentation.ts` separates rendered roads from placement roads. Runtime renders a decluttered 113-road skeleton while venue buildings can still snap to 839 non-footpath/local road segments for believable shopfront placement.
- A top-left minimap now renders on the UI layer with the simplified road skeleton, water/beach edge, camera viewport, player heading, and discovered venue dots. It respects `WorldState.mapDiscovery.revealAll` and discovered venue IDs.
- Traffic bikes now spawn on the road skeleton and follow real road polylines instead of three hardcoded straight lanes. Current traffic graph has 23 eligible main/secondary routes and 9 shared-node junctions; scooters can turn at junctions and respawn at route edges. Existing capped traffic-hit feedback remains intact.
- Coastline-aware soft water boundary feedback is now in `src/systems/map/WaterBoundary.ts`. It uses generated OSM beach/coastline/water features to nudge the player out of rendered sea/waterway areas with a toast, while leaving beach polygons walkable. The old broad rectangular `ocean-block` collision strip was removed.
- Static map geometry is generated once into a DPR/zoom-aware texture; camera zoom is tuned closer, and dynamic NPC/pickup/traffic/group/wanted sprites are culled off-camera.
- OSM/Nominatim/Overpass caches are committed under `data/osm/`, including the required raw Overpass extract at `data/osm/berawa.overpass.json`.
- The generated map is north-up with a uniform projection into the existing `2400 x 1700` world. Orientation sanity in the report confirms beach lower/SW, Nelayan north, and Tegal Sari east of the beach side.
- Map data attribution is present in README and the Phone Community tab: `Map data © OpenStreetMap contributors`.
- Map discovery hides area and venue detail until explored, with dev reveal-all support.
- Scooter/bike systems include rental, slow walking vs faster riding, stuck-bike state, group-helper requirement, capped traffic-hit consequences, hit feedback, and local-life redemption hooks. This stays environmental/community consequence, not combat.
- `WorldState.reputation` is now the canonical standing source: score, wanted level, bounty, victim flags, visible positive tags, hidden trust flags, redemption state, and history. Duplicate flat standing fields were removed from `PlayerEntityState`.
- Save payloads now use `schemaVersion: 4` at the original key `bali-life-rpg.berawa-finns.save.v1`. Raw v1/v2/v3 saves migrate in place; v1/v2 standing fields still migrate into `ReputationState`, and pre-v4 runtime positions are scaled into the enlarged world without discarding money, quests, inventory, discovery, or relationships.
- Phone UI has eight tabs: Map, Contacts, Quests, Calendar, Profile, Events, Venues, Community. Venues now have selectable detail pages with category, hours, discovery state, quality fields, associated NPCs/items/quests, and honest placeholder commerce/check-in status.
- `PlayerProfile.lifestyleTags` remains the local cross-app identity bridge; `remoteAccountId` stays `null`.
- New systems use `IntentDispatcher` where already introduced. Existing movement/shop/inventory/save flows remain direct.
- Starter quest branching moved into `src/systems/quests/QuestRegistry.ts` with objective handler shapes for `collect`, `deliver`, `visit`, `buy`, and `talk`.
- `GameScene` now delegates keyboard/joystick input to `InputController`, proximity resolution to `InteractionController`, and mobile/right-side HUD controls to `HudController`.
- NPC relationship memory now derives affinity tiers (`stranger`, `acquaintance`, `friendly`, `regular`, `trusted`). `ScriptedDialogueProvider` varies authored lines by tier and references memories. Contacts shows tier and known memories.
- Cooking/crafting is scaffolded only: `src/data/recipes.ts`, `src/systems/crafting/CraftingSystem.ts`, and one result item. No player-facing cooking UI/minigame yet.
- Shops, NPC routine stops, pickups, and player spawn now derive from generated venue nodes via `src/data/layoutLookup.ts` so they move with regenerated venue coordinates.

## Important Files

- Core types: `src/types.ts`
- Runtime world defaults: `src/systems/WorldState.ts`
- Save/load/migration: `src/systems/Persistence.ts`
- Network stub: `src/systems/NetworkAdapter.ts`
- Main scene and old gameplay wiring: `src/scenes/GameScene.ts`
- Quest registry: `src/systems/quests/QuestRegistry.ts`
- Controllers: `src/systems/input/InputController.ts`, `src/systems/interaction/InteractionController.ts`, `src/ui/hud/HudController.ts`
- Phone UI: `src/ui/phone/PhoneShell.ts`
- Berawa layout data: `src/data/berawaLayout.ts`; runtime-scaled presentation copy: `src/data/scaledBerawaLayout.ts`
- Map presentation/boundaries: `src/systems/map/WorldScale.ts`, `src/systems/map/PlayerUnitScale.ts`, `src/systems/map/VenuePresentation.ts`, `src/systems/map/WaterBoundary.ts`
- OSM generator: `scripts/generateLayoutFromOSM.ts`
- OSM cache/report: `data/osm/berawa.overpass.json`, `data/osm/berawa.anchors.json`, `data/osm/berawa.curated-coords.json`, `data/osm/berawa.curated-geocode.json`, `data/osm/berawa.layout-report.json`
- Curated venue catalog: `src/data/curatedVenues.ts`
- Berawa coordinate plan: `docs/BERAWA_MAP_PLAN.md`
- Decisions log: `DECISIONS.md`

## Phase Commits

- `3dc6eaf` - `chore: baseline before consolidate+alive sprint`
- `12544ba` - `refactor: unify reputation under canonical ReputationState`
- `c704051` - `refactor: extract quest handlers and core controllers from GameScene`
- `bdc49d0` - `feat: phone venue detail pages`
- `58a707b` - `feat: tiered NPC relationships and affinity-aware dialogue`
- `b21a846` - `chore: reconcile Berawa map orientation in layout data`
- `c1ad154` - `chore: scaffold crafting data model (deferred)`
- `ba543b7` - `docs: update handoff state after consolidate sprint`
- `795e952` - `fix: harden save migration and touch HUD controls`
- `68679b2` - `feat: generate Berawa road layout from OpenStreetMap data`
- `749bbfb` - `feat: load OSM-generated Berawa layout in game`
- `ca73198` - `chore: align discovery/fog with OSM layout`
- `1219cf0` - `docs: OSM attribution and regenerated map plan`
- `2eb1f04` - `feat: resolve curated venue coordinates (osm-first cascade)`
- `b787716` - `feat: frame map bbox to curated venues and reproject`
- `f2c11a1` - `feat: render curated venues as simple buildings at real positions`
- `6b054bb` - `perf: bake static map and tune camera scale`
- `ac4dc1f` - `fix: remove dense road marker layer`
- `afd3c2a` - `feat: add OSM beach and coastline map features`
- `d0cf27b` - `feat: consistent player-anchored building scale`
- `15d4083` - `feat: snap venue buildings to roadside`
- `a805c55` - `feat: de-overlap roadside venues along the street`
- `a610964` - `feat: zoomed-in walkable camera`
- `2ea3bda` - `chore: road width-by-class and label declutter`
- `a285c9b` - `feat: add coastline-aware water boundary feedback`
- `6226928` - `feat: pokemon-standard player-unit scale`
- `98111e9` - `feat: road hierarchy and declutter for readability`
- `d7bd624` - `feat: top-left orientation minimap`
- `d38275a` - `feat: road-following traffic paths`
- `acea713` - `fix: render at device pixel ratio and crisp baked map`
- `3fa4c19` - `feat: high-contrast walkable ground layer`
- `f0769e7` - `feat: axis-align venue buildings for readability`
- `666b598` - `feat: enlarge world space for walkable spacing`
- `f3d723d` - `feat: pokemon building-to-player proportion`

## Current Verification

- `npm run build` passed after every phase above and after the final verification fixes.
- `npm run generate:layout` runs from the committed cache and rewrites `src/data/berawaLayout.ts`, `data/osm/berawa.curated-coords.json`, and `data/osm/berawa.layout-report.json`.
- Cache-only generator rerun is deterministic; SHA-256 hashes for `src/data/berawaLayout.ts` and `data/osm/berawa.layout-report.json` matched before/after rerun.
- OSM report currently shows 934 road paths, 4,346 shared OSM road nodes, 4,501 road segments, 788 POIs, and 12 terrain features after filtering the larger cache to the curated venue frame.
- Curated venue coordinate matching: 23 OSM POI matches, 0 Nominatim matches, 15 flagged estimates, and 3 flagged fallbacks. All 41 `shouldRender` venues have generated building nodes.
- Runtime source check found OSM/Nominatim/Overpass URLs and `fetch` only in `scripts/generateLayoutFromOSM.ts`, not game runtime code.
- Walkable/readable presentation source changes do not touch `src/data/curatedVenues.ts`, `src/data/berawaLayout.ts`, or `data/osm/berawa.curated-coords.json`; OSM/generated source coordinates remain unchanged.
- Automated venue presentation check after the readable-ground/crisp-render pass reports 41 venue placements, 0 overlaps, main road width `155`, secondary `95`, lane `69`, `WORLD_SCALE = 1.6`, player unit `34 x 43`, camera `1.86 / 1.52`, max tangent slide about `461.7`, and max source-to-presentation move about `539`.
- Final readable-ground/crisp-render builds passed with `npm run build` after Phase 4 and Phase 5.
- In-app browser smoke for the readable-ground/crisp-render pass loaded `http://127.0.0.1:5173/`, found the Phaser canvas, reported schema v4 debug state, captured no console errors, verified `P` opens Phone and `ESC` returns to world, and verified a mobile `390 x 844` viewport shows touch controls and the on-screen `PHONE` button opens the phone.
- In-app browser smoke loaded `http://127.0.0.1:5173/?verify=walkable-presentation`, found the Phaser canvas, reported no console errors, and verified `P` opens Phone while `ESC` returns to world.
- Water-boundary geometry spot checks passed: a southwest sea sample resolves back to shore, a visible beach polygon sample stays walkable, an inland road sample is untouched, and the corrected shoreline point is stable on the next check.
- Final water-boundary build passed with `npm run build`.
- In-app browser smoke loaded `http://127.0.0.1:5173/?verify=water-boundary`, found the Phaser canvas, reported no console errors, and verified `P` opens Phone while `ESC` returns to world.
- Final Pokémon-scale/minimap/traffic build passed with `npm run build`.
- Presentation geometry check after the original Pokémon-scale pass reported 113 rendered road paths, 839 venue-snap road paths, 40 non-beach building placements, and 0 building overlaps; the current readable-ground/crisp-render pass supersedes the old size numbers with the `WORLD_SCALE = 1.6` presentation layer noted above.
- Traffic graph check reports 23 eligible traffic routes and 9 shared-node junctions from the rendered road skeleton.
- Dev server is serving `http://127.0.0.1:5173/`.
- In-app browser smoke after the minimap phase loaded the Phaser canvas at `http://127.0.0.1:5173/` with no captured console errors. During traffic verification, the in-app browser retained one stale pre-restart error log from an old Vite module timestamp; the restarted dev server serves the current `GameScene.ts` with the traffic helper present. Screenshot capture in the in-app browser timed out, so live traffic feel remains human-verification pending.
- Source grep confirms no code path reads removed flat `playerState.reputation`, `playerState.wantedLevel`, `playerState.bounty`, `playerState.flaggedByVictims`, or `playerState.lastFlagReason` fields.
- v1/v2 save migration maps old standing fields into schema v3 `WorldState.reputation` and strips legacy flat standing keys from the hydrated local player.
- Quest code compiles and both starter quests complete through `QuestRegistry` in browser automation.
- Phone venue details compile and read from `VenueRegistry` plus discovery state.
- Contacts tab compiles with relationship affinity tiers and memory summaries.
- Crafting scaffold compiles without adding persisted state.
- The in-app browser connector still fails in this environment with `codex/sandbox-state-meta: missing field sandboxPolicy`, so runtime verification used local headless Chrome DevTools fallback against `http://127.0.0.1:5173/`.
- Final fallback browser verification passed:
  - Map loads with no runtime exceptions.
  - OSM-generated spawn lands in the generated cafe/FINNS cluster.
  - `P` opens Phone and `ESC` closes it.
  - All six HUD buttons respond to mouse automation: `PHONE`, `BAG`, `SOC`, `SAVE`, `BIKE`, `ACT`.
  - All six HUD buttons respond to mobile touch emulation after the touch HUD fix: `PHONE`, `BAG`, `SOC`, `SAVE`, `BIKE`, `ACT`.
  - Raw v1 save migrates through the current schema chain, preserves money, moves legacy standing into `WorldState.reputation`, removes flat standing keys from the player, and now lands on schema v4 with runtime x/y positions scaled into the enlarged world.
  - Ibu Sari and Kadek starter quests complete via `QuestRegistry`, award reputation tags/score, and record relationship memories.
  - Milk & Madu shop opens at the generated venue position.
  - Initial discovery includes cafe/FINNS cluster and excludes beach until approached.
  - No runtime HTTP requests to OSM/Nominatim/Overpass were observed; no external HTTP requests were observed.
  - F2 opens development godmode.
  - Only console error was a harmless missing-resource 404, likely favicon.

## Known Caveats

- `GameScene.ts` is still large. Rendering and broader simulation remain there for a later behavior-preserving split.
- Phone UI is functional but still a shell; it is not a polished production phone app.
- Godmode is simple and development-only.
- Map discovery now has a compact minimap, but it is still a lightweight orientation aid rather than a full interactive map.
- The road network, coastline/beach/water features, and curated building layer now follow OSM/generated coordinates. Building presentation is road-snapped and de-overlapped. Water boundaries are soft feedback, not full physics collision; a human should still judge the coastline feel in live play.
- Eighteen curated coordinates still need manual review because they resolved via flagged estimate/fallback rather than OSM/Nominatim. See `data/osm/berawa.curated-coords.json`.
- Venue rating/review fields are data-only. There is no Google Places API, scraping, live verification, or live venue ranking.
- Multiplayer is intentionally locked and inert.
- Venue commerce/check-in/booking/delivery fields are placeholders only.
- Offline activities are explicitly `simulated`.
- Crafting is data/system scaffold only; it is not exposed in Phone, shops, NPC interactions, or godmode.
- The repo has local commits but no configured remote, so a GitHub PR cannot be opened from this workspace until a remote/repo is provided.
- Still worth checking manually by feel: traffic-hit shake/splash timing, real Mac trackpad/mouse clicks on all six buttons, real-phone touch layout, and whether the map reads as Berawa when driving around.

## Next Move

1. Do a human play-feel pass:
   - Trigger traffic-bike collision and judge knockback/shake/splash timing.
   - Click all six HUD buttons with the real Mac trackpad/mouse.
   - Try the mobile HUD on an actual phone, especially tall screens.
   - Drive around and judge whether the OSM road network, chunky scale, minimap, and road-following traffic read as recognizably Berawa and walkable at the new zoom.
   - Walk into the rendered surf/water edges and judge whether the soft boundary nudge feels natural.
   - Open Phone > Venues > Details and inspect discovery filtering plus associated NPCs/items/quests visually.
   - Build NPC affinity through memory and confirm Contacts/dialogue feel readable.

2. Continue decomposition carefully:
   - Extract world/render drawing only if behavior can stay identical.
   - Add focused tests around `QuestRegistry`, `Persistence`, `InteractionController`, and `ReputationState`.

3. Continue Berawa credibility:
   - Manually verify the flagged coordinates in `data/osm/berawa.curated-coords.json`, especially estimate/fallback entries.
   - If the new presentation feels too tight/loose on a real phone, tune only `POKEMON_SCALE`, `MAX_ROADSIDE_TANGENT_SLIDE`, traffic density/speeds, and the two camera zoom values before changing map data.
   - Tune road-following traffic density, speeds, and junction-turn frequency by feel on real play sessions.
   - Curate a small verified venue file before adding more real-world-name candidates.
   - Add a compact map UI only after discovery state is stable.

4. Expose crafting later:
   - Add a small Phone/Home/godmode action for `CraftingSystem`.
   - Keep it a routine/social system, not a combat or heavy minigame.

5. Add a remote and open PR when repository access exists.

## PR-Ready Summary

Title:

```text
Readable, crisp Berawa map presentation
```

Summary:

```text
- Render Phaser at device-pixel-ratio scale and bake the static map texture at DPR/zoom-aware resolution for a sharper close view.
- Rework map contrast so roads read as a distinct walkable ground layer, with calmer greenery and lighter building shadows.
- Keep OSM/source coordinates untouched while adding a runtime-scaled Berawa layout (`WORLD_SCALE = 1.6`) for more breathing room.
- Axis-align venue buildings, tune Pokémon-style building/road/player proportions, and keep dense clusters overlap-free.
- Bump saves to schema v4 so pre-scale runtime positions migrate into the enlarged world without losing player state.
- Update STATE.md and DECISIONS.md.
```

Test notes:

```text
- npm run build after Phase 4 and Phase 5
- Presentation geometry check: 41 venue placements, 0 overlaps, max tangent slide ~461.7 px
- Scale check: WORLD_SCALE 1.6, runtime world 3840 x 2720, roads main/secondary/lane 155/95/69 px, camera 1.86 desktop / 1.52 mobile
- Diff check: no curated venue, generated coordinate, or curated-coordinate cache files changed
- Browser smoke loaded `http://127.0.0.1:5173/` with canvas, schema v4 debug state, no captured console errors, keyboard Phone open/close, and mobile `PHONE` touch button; final visual feel still needs human judgment on the real device
```

## Do Not Do Next

- Do not implement real multiplayer yet.
- Do not add backend/auth/database.
- Do not add AI/LLM calls.
- Do not claim real venue integrations, coupons, bookings, payments, delivery, or check-ins.
- Do not add runtime map network calls; OSM services are generator-only.
- Do not turn this into a combat RPG.
- Do not refactor all old gameplay flows into intents yet.
