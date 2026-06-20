# AI Handoff / Project State

Last updated: 2026-06-20

Copy/paste this into a new AI session to bring it up to speed.

## Project

- Path: `/Users/z/包包/bali-life-rpg`
- Stack: Phaser 3, TypeScript, Vite.
- Dev URL: `http://127.0.0.1:5173/`
- Current product direction: `Bali Life RPG` is a location-based life sim/social RPG, not a combat RPG.
- Setting: compressed Berawa, Canggu neighborhood around the FINNS/Jl. Pantai Berawa area.
- Current playable mode: local single-player vertical slice.
- Multiplayer: visible in UI as a locked portal only; no real networking/server/backend.

## What Was Added Recently

- Git is now initialized locally. Baseline and every sprint phase are committed.
- Berawa layout is data-driven in `src/data/berawaLayout.ts`, north-up, with Jl. Nelayan held north, Jl. Tegal Sari east, and Berawa Beach deliberately compressed toward the lower-left / southwest.
- Map discovery hides area and venue detail until explored, with dev reveal-all support.
- Scooter/bike systems include rental, slow walking vs faster riding, stuck-bike state, group-helper requirement, capped traffic-hit consequences, hit feedback, and local-life redemption hooks. This stays environmental/community consequence, not combat.
- `WorldState.reputation` is now the canonical standing source: score, wanted level, bounty, victim flags, visible positive tags, hidden trust flags, redemption state, and history. Duplicate flat standing fields were removed from `PlayerEntityState`.
- Save payloads now use `schemaVersion: 3` at the original key `bali-life-rpg.berawa-finns.save.v1`. Raw v1 saves and v2 saves migrate in place, including old flat standing fields into `ReputationState`.
- Phone UI has eight tabs: Map, Contacts, Quests, Calendar, Profile, Events, Venues, Community. Venues now have selectable detail pages with category, hours, discovery state, quality fields, associated NPCs/items/quests, and honest placeholder commerce/check-in status.
- `PlayerProfile.lifestyleTags` remains the local cross-app identity bridge; `remoteAccountId` stays `null`.
- New systems use `IntentDispatcher` where already introduced. Existing movement/shop/inventory/save flows remain direct.
- Starter quest branching moved into `src/systems/quests/QuestRegistry.ts` with objective handler shapes for `collect`, `deliver`, `visit`, `buy`, and `talk`.
- `GameScene` now delegates keyboard/joystick input to `InputController`, proximity resolution to `InteractionController`, and mobile/right-side HUD controls to `HudController`.
- NPC relationship memory now derives affinity tiers (`stranger`, `acquaintance`, `friendly`, `regular`, `trusted`). `ScriptedDialogueProvider` varies authored lines by tier and references memories. Contacts shows tier and known memories.
- Cooking/crafting is scaffolded only: `src/data/recipes.ts`, `src/systems/crafting/CraftingSystem.ts`, and one result item. No player-facing cooking UI/minigame yet.

## Important Files

- Core types: `src/types.ts`
- Runtime world defaults: `src/systems/WorldState.ts`
- Save/load/migration: `src/systems/Persistence.ts`
- Network stub: `src/systems/NetworkAdapter.ts`
- Main scene and old gameplay wiring: `src/scenes/GameScene.ts`
- Quest registry: `src/systems/quests/QuestRegistry.ts`
- Controllers: `src/systems/input/InputController.ts`, `src/systems/interaction/InteractionController.ts`, `src/ui/hud/HudController.ts`
- Phone UI: `src/ui/phone/PhoneShell.ts`
- Berawa layout data: `src/data/berawaLayout.ts`
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

## Current Verification

- `npm run build` passed after every phase above and after the final verification fixes.
- Source grep confirms no code path reads removed flat `playerState.reputation`, `playerState.wantedLevel`, `playerState.bounty`, `playerState.flaggedByVictims`, or `playerState.lastFlagReason` fields.
- v1/v2 save migration maps old standing fields into schema v3 `WorldState.reputation` and strips legacy flat standing keys from the hydrated local player.
- Quest code compiles and both starter quests complete through `QuestRegistry` in browser automation.
- Phone venue details compile and read from `VenueRegistry` plus discovery state.
- Contacts tab compiles with relationship affinity tiers and memory summaries.
- Crafting scaffold compiles without adding persisted state.
- The in-app browser connector still fails in this environment with `codex/sandbox-state-meta: missing field sandboxPolicy`, so runtime verification used local headless Chrome DevTools fallback against `http://127.0.0.1:5173/`.
- Final fallback browser verification passed:
  - Map loads with no runtime exceptions.
  - `P` opens Phone and `ESC` closes it.
  - All six HUD buttons respond to mouse automation: `PHONE`, `BAG`, `SOC`, `SAVE`, `BIKE`, `ACT`.
  - All six HUD buttons respond to mobile touch emulation after the touch HUD fix: `PHONE`, `BAG`, `SOC`, `SAVE`, `BIKE`, `ACT`.
  - Raw v1 save migrates to schema v3, preserves money, moves legacy standing into `WorldState.reputation`, and removes flat standing keys from the player.
  - Ibu Sari and Kadek starter quests complete via `QuestRegistry`, award reputation tags/score, and record relationship memories.
  - F2 opens development godmode.
  - Only console error was a harmless missing-resource 404, likely favicon.

## Known Caveats

- `GameScene.ts` is still large. Rendering and broader simulation remain there for a later behavior-preserving split.
- Phone UI is functional but still a shell; it is not a polished production phone app.
- Godmode is simple and development-only.
- Map discovery is a foundation, not a full minimap.
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
   - Drive around and judge whether the north-up Berawa compression feels recognizable.
   - Open Phone > Venues > Details and inspect discovery filtering plus associated NPCs/items/quests visually.
   - Build NPC affinity through memory and confirm Contacts/dialogue feel readable.

2. Continue decomposition carefully:
   - Extract world/render drawing only if behavior can stay identical.
   - Add focused tests around `QuestRegistry`, `Persistence`, `InteractionController`, and `ReputationState`.

3. Continue Berawa credibility:
   - Align building art more closely to `berawaLayout.ts` nodes.
   - Curate a small verified venue file before adding more real-world-name candidates.
   - Add a compact map UI only after discovery state is stable.

4. Expose crafting later:
   - Add a small Phone/Home/godmode action for `CraftingSystem`.
   - Keep it a routine/social system, not a combat or heavy minigame.

5. Add a remote and open PR when repository access exists.

## PR-Ready Summary

Title:

```text
Consolidate reputation and bring Berawa slice alive
```

Summary:

```text
- Initialize local git and checkpoint the pre-sprint baseline.
- Unify standing data under canonical WorldState.reputation with schema v3 migration from legacy flat player fields.
- Move starter quest branching into QuestRegistry and extract InputController, InteractionController, and HudController from GameScene.
- Add Phone venue detail pages, tiered NPC relationship dialogue, and Contacts memory summaries.
- Reconcile Berawa beach direction as a documented southwest gameplay compression.
- Scaffold cooking/crafting data and helper system without exposing a full UI/minigame yet.
- Update STATE.md and DECISIONS.md.
```

Test notes:

```text
- npm run build after every phase
- Source checks for removed flat reputation reads
- Local headless Chrome DevTools fallback verified map load, keyboard phone controls, mouse/touch HUD controls, v1 to v3 migration, both starter quests, reputation/memory rewards, and godmode
```

## Do Not Do Next

- Do not implement real multiplayer yet.
- Do not add backend/auth/database.
- Do not add AI/LLM calls.
- Do not claim real venue integrations, coupons, bookings, payments, delivery, or check-ins.
- Do not turn this into a combat RPG.
- Do not refactor all old gameplay flows into intents yet.
