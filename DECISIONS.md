# Decisions

## 2026-06-20 - Shared Identity Bridge

`PlayerProfile.lifestyleTags` is the local cross-app identity bridge. The field is intentionally open-ended and local in this step, with `remoteAccountId: null` reserved for a later shared account that can also back a companion co-living social app.

## 2026-06-20 - Trust-Compatible Reputation

Reputation is modeled as `ReputationState`: a numeric score, visible positive tags, hidden red/green trust flags, a redemption hook, and append-only history. Hidden flags are never shown in this slice. This shape is reserved for a later structured trust and community governance system.

## 2026-06-20 - Intent Dispatch Seam

New portal, venue, event, relationship, and reputation systems mutate through `IntentDispatcher`. Existing movement, inventory, shop, quest, and save flows are intentionally not refactored into intents in this step; they only call thin post-action hooks where needed.

## 2026-06-20 - Save Schema V2 Migration

Runtime saves now carry `schemaVersion: 2` inside the payload while continuing to use the original `bali-life-rpg.berawa-finns.save.v1` key. Valid v1 saves without `schemaVersion` are migrated in place with default profile, reputation, relationships, portal, and runtime-event state.

## 2026-06-20 - North-Up Berawa Layout Data

Roads, map areas, and venue map nodes are now declared in `src/data/berawaLayout.ts`. `GameScene` still renders the neighborhood, but the road network is driven by data so the Berawa slice can become more credible without hardcoded drawing sprawl.

## 2026-06-20 - Discovery Before Full Map Knowledge

The road network can be visible immediately, but area and venue labels are revealed through `WorldState.mapDiscovery`. Dev godmode can reveal all. This keeps the player experience exploratory while preserving a simple saveable foundation.

## 2026-06-20 - Venue Quality Threshold Is Data-Only

Venue rating/review fields and the `rating >= 4.5 && reviewCount >= 300` helper exist for future curation. No Google Places API, scraping, live verification, or production venue ranking is implemented in this slice.

## 2026-06-20 - Canonical Reputation State

`WorldState.reputation` is now the canonical home for standing data: score, positive tags, hidden trust flags, redemption hook, wanted level, bounty, victim flag count, and the last flag reason. Flat reputation/wanted/bounty fields were removed from `PlayerEntityState`; legacy v1/v2 saves migrate those values into `ReputationState` under schema v3.
