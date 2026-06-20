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

- Berawa/FINNS grounding:
  - Map labels, shops, NPC flavor, quests, and docs now focus on Berawa near FINNS rather than a generic Bali neighborhood.
  - Venue anchors include FINNS Recreation Club area, Canggu Station, Milk & Madu Berawa, BAKED. Berawa, Bungalow Living Bali, Satu-Satu Coffee Company, Bali Family Rental Scooter, and Berawa Beach.
  - The road network is now data-driven from `src/data/berawaLayout.ts` and points north-up from Jl. Nelayan through Jl. Pantai Berawa toward Jl. Tegal Sari and Berawa Beach.
  - Area/venue labels now reveal through map discovery instead of showing the full named map immediately.

- Daily expat/digital-nomad loop:
  - Added social/community activities around cafes, gym/club routines, brunch, sunset, home-base settling, and repair/redemption activities.
  - Added interest groups intended to become real-world event/interest group seams later.

- Scooter/bike and group-travel foundation:
  - Player has `hasBike`, `onBike`, `bikeStuck`, `bikeCondition`, `safety`, and tutorial mobility state.
  - Walking is intentionally slow; renting a scooter opens the map up.
  - Added scooter rental item/shop seam and bike toggle.
  - Added local group line simulation with leader/followers and walk/bike modes.
  - Bike line requires the party to have bikes.
  - Mud/sand zones can strand the bike; freeing it requires 5 group helpers.
  - Added traffic-bike hazards and negative consequences for getting clipped.
  - Traffic hits now knock the player back, shake the camera, show a stylized hit splash, drop a capped amount of money, and use a short cooldown to avoid repeated chain hits.

- Bounty/reputation guardrail foundation:
  - Added wanted/bounty fields on player entity during the paused work.
  - Added a capped bad-behavior consequence model so accidental bad behavior does not become a quit moment.
  - Added local-life redemption activity hooks such as beach cleanup, morning lane sweep, and scooter safety reset.
  - Important design framing: this is not a combat RPG. Enforcement should read as community consequence/citizen-arrest style only for already-flagged offenders, not general combat.

- Portal and Phone foundation:
  - Added portal state: Single Player active, Multiplayer visible but locked.
  - Added Phone UI shell opened with `P`, closed with `ESC`, and mobile `PHONE` button.
  - Phone tabs: Map, Contacts, Quests, Calendar, Profile, Events, Venues, Community.

- First-class data catalogs:
  - `src/data/venues.ts`
  - `src/data/events.ts`
  - `src/data/offlineActivities.ts`
  - `src/data/lifestyleTags.ts`

- New service modules:
  - `src/systems/portal/PortalState.ts`
  - `src/systems/venues/VenueRegistry.ts`
  - `src/systems/events/EventScheduler.ts`
  - `src/systems/reputation/ReputationState.ts`
  - `src/systems/relationships/RelationshipMemory.ts`
  - `src/systems/offline/OfflineActivityRegistry.ts`
  - `src/systems/intents/IntentDispatcher.ts`
  - `src/systems/profile/ProfileState.ts`
  - `src/systems/dialogue/DialogueProvider.ts`
  - `src/ui/phone/PhoneShell.ts`

- Shared identity bridge:
  - `PlayerProfile` now carries local `lifestyleTags`.
  - `remoteAccountId` is always `null` for now and reserved for a future shared account with the companion co-living/social app.

- Trust-compatible reputation:
  - Added `ReputationState` with numeric score, visible positive tags, hidden red/green flags, redemption hook, and append-only history.
  - Hidden flags must not be shown in UI in this slice.

- Intent-dispatch seam:
  - New systems mutate through `IntentDispatcher`.
  - Existing movement, inventory, shop, quest, and save flows were intentionally not refactored into intents.
  - Existing flows only call thin post-action hooks where needed, such as recording venue visits or awarding reputation after quest completion.

- Save migration:
  - Runtime payload now has `schemaVersion: 2`.
  - Save key remains the original `bali-life-rpg.berawa-finns.save.v1`.
  - Valid v1 saves without `schemaVersion` migrate in place.
  - Static catalogs are not saved; they load fresh from `src/data`.

- Docs/state:
  - Added `STATE.md` as this handoff doc.
  - Added `DECISIONS.md`.
  - Updated `README.md`, `docs/DESIGN_NOTES.md`, `docs/MULTIPLAYER_ROADMAP.md`, and `docs/ROADMAP.md`.

## Important Files

- Core types: `src/types.ts`
- Runtime world defaults: `src/systems/WorldState.ts`
- Save/load/migration: `src/systems/Persistence.ts`
- Network stub: `src/systems/NetworkAdapter.ts`
- Main scene and old gameplay wiring: `src/scenes/GameScene.ts`
- Phone UI: `src/ui/phone/PhoneShell.ts`
- Berawa layout data: `src/data/berawaLayout.ts`
- Berawa coordinate plan: `docs/BERAWA_MAP_PLAN.md`
- Decisions log: `DECISIONS.md`

## Current Verification

- `npm run build` passes.
- Dev server has been started successfully at `http://127.0.0.1:5173/`.
- Browser runtime was checked with a local headless Chrome DevTools fallback because the in-app browser connector still fails with a sandbox metadata issue in this environment.
- Verified:
  - Latest `npm run build` passes after adding the polish sprint code.
  - v1 save without `schemaVersion` migrates to schema v2 and preserves player money.
  - First-run hint appears once and closes with `ESC`.
  - Keyboard movement works.
  - Phone opens with `P` and closes with `ESC`.
  - All six right-side buttons respond to mouse clicks in browser automation: `PHONE`, `BAG`, `SOC`, `SAVE`, `BIKE`, `ACT`.
  - Right-side buttons respond under mobile touch emulation using rendered button coordinates.
  - F2 opens development godmode; godmode buttons changed speed, money, inventory, relationship memory, reputation, bike state, time/map reveal, and teleport state.
  - Mouse `ACT` near Canggu Station now starts Ibu Sari's quest, confirming NPC priority wins over the overlapping shop.
  - Fog/discovery persists to localStorage and reloads.
  - Traffic-bike collision knocks the player diagonally out of the lane, drops capped money, lowers safety/focus, starts cooldown, and did not repeat-hit after cooldown in the focused check.
  - No game runtime exceptions were observed. Chrome logged a harmless missing-resource 404, likely favicon.
  - `GameScene` compiles with first-run hint, dev godmode, map discovery, venue quality fields, north-up road data, and improved traffic-hit feedback.
- Still worth checking manually by feel:
  - Visual timing of the short red splash and screen shake during live play.
  - Fine-tuning the mobile button layout across real phones, because Phaser's scaled height can differ from browser CSS height.

## Known Caveats

- `GameScene.ts` is still large. New systems were added as services, but older movement/shop/quest/UI logic remains in the scene.
- The Phone UI is a shell, not a polished production phone app. It is enough to prove tabs, data binding, profile tags, venue/event lists, and locked multiplayer portal.
- Godmode is intentionally simple and only for development builds.
- Map discovery is a foundation: Phone tabs and world labels respect discovery state, but there is not yet a full interactive minimap.
- Venue rating/review fields are data-only. Current candidate venues are manually seeded or marked as needing verification; there is no Google Places integration.
- Multiplayer is intentionally locked and inert.
- Venue commerce/check-in/booking/delivery fields are placeholders only.
- Offline activities are explicitly `simulated`.
- Reputation has both older flat player fields from paused work and the newer `WorldState.reputation` shape. The newer `ReputationState` is the long-term source of truth; flat fields are compatibility/gameplay display glue for now.
- The repo is not currently a git repository. There is no `.git` folder and no remote, so no PR could be opened from this workspace.

## Next Move

1. Manually verify the current polish sprint in the browser:
   - Mouse-click all six right-side buttons.
   - Repeat with mobile/touch simulation.
   - Trigger a traffic-bike collision and confirm knockback/shake/splash/money loss/cooldown.
   - Open godmode with F2/backtick and test speed, money, inventory, reputation/relationship, bike, time, teleport, and reveal-map controls.
   - Discover at least one venue, save/reload, and confirm discovery persists.
   - Confirm Canggu Station/Ibu Sari interaction priority now favors the NPC when both overlap.

2. Tighten Phone UI:
   - Make tab buttons more robust on mobile.
   - Add selected venue detail state instead of list-only venue rows.
   - Add a text-input or simple modal for lifestyle tags if richer editing is needed.

3. Continue Berawa credibility pass:
   - Align building art more closely to `berawaLayout.ts` nodes.
   - Curate a small verified venue file before adding more real-world-name candidates.
   - Add a compact map UI only after discovery state is stable.

4. Consolidate reputation:
   - Keep `WorldState.reputation` as the source of truth.
   - Decide whether to remove or mirror flat `PlayerEntityState.reputation/wantedLevel/bounty` fields.
   - Keep bad-behavior systems non-combat and capped.

5. Add tests:
   - Persistence v1 to v2 migration.
   - Event scheduler active/upcoming windows.
   - Intent dispatcher reputation/memory mutations.
   - Profile lifestyle tag normalization.

6. Initialize git when ready:
   - `git init`
   - commit the current foundation.
   - add remote.
   - open PR with the summary below.

## PR-Ready Summary

Title:

```text
Add social RPG foundation systems and phone portal
```

Summary:

```text
- Add locked single/multiplayer portal state and Phone UI shell with 8 tabs.
- Add first-class venue, event, offline-activity, profile, relationship-memory, reputation, dialogue, and intent-dispatch foundations.
- Add local PlayerProfile lifestyleTags as the future shared identity bridge.
- Add trust-compatible ReputationState with visible tags, hidden flags, redemption hook, and history.
- Add schemaVersion 2 save payload migration while preserving the original localStorage key.
- Keep existing movement, shop, inventory, quest, and save flows direct; only new systems use IntentDispatcher.
- Update STATE.md, DECISIONS.md, README, and docs.
```

Test notes:

```text
- npm run build
- Local Chrome DevTools runtime check at http://127.0.0.1:5173/
- Verified map load, no app console errors after migration fix, keyboard movement, Phone open/close, mobile touch visibility, v1 migration, and shop interaction.
```

## Do Not Do Next

- Do not implement real multiplayer yet.
- Do not add backend/auth/database.
- Do not add AI/LLM calls.
- Do not claim real venue integrations, coupons, bookings, payments, delivery, or check-ins.
- Do not turn this into a combat RPG.
- Do not refactor all old gameplay flows into intents yet.
