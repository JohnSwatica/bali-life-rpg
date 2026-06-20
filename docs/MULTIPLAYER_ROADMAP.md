# Multiplayer Roadmap

The current game is single-player, but the architecture is shaped so multiplayer can be added without throwing everything away.

## Already Separated

- `WorldState`: shared world data such as clock, NPCs, pickups, and players.
- `PlayerEntityState`: local player position, inventory, quests, and money.
- `Persistence`: currently localStorage, later replaced or supplemented by account/server saves.
- `NetworkAdapter`: a stub interface for connection, outgoing local player updates, and incoming world patches.
- `IntentDispatcher`: local-only handler registry for new portal, venue, event, relationship, and reputation actions.
- `PlayerProfile`: local identity shape with `lifestyleTags` and `remoteAccountId: null` reserved for shared account mapping.

## What Becomes Server-Authoritative

For real multiplayer, the server should own:

- Player position validation from input commands.
- Money and inventory mutations.
- Shop transactions.
- Quest start/completion and reward grants.
- Pickup availability and respawn timers.
- World clock, weather, events, and NPC schedules.
- Portal switching, event attendance, venue visits, relationship memory, and reputation mutation.
- Anti-cheat validation for distance checks and interaction cooldowns.

The client should send intent, not final truth. For example:

```text
move input -> server simulates -> server sends accepted position
buy item intent -> server validates money/shop/range -> server grants item
complete quest intent -> server validates objectives -> server grants rewards
attend event intent -> server validates time/mode/check-in -> server records attendance
```

## Suggested Phases

1. Replace `LocalNetworkAdapter` with a WebSocket adapter while keeping the same interface.
2. Move old local interactions into command objects: `InteractNpc`, `BuyItem`, `SellItem`, `CollectPickup`, `AcceptQuest`, `CompleteQuest`.
3. Add a server simulation loop for one neighborhood instance.
4. Sync remote players as separate `PlayerEntityState` records.
5. Add interpolation for remote player positions.
6. Move save ownership to server-side profiles.
7. Add instance/lobby handling for multiple neighborhoods.
8. Promote local `IntentDispatcher` handlers to server-authoritative handlers for events, venue visits, relationship memory, reputation, and portal mode.

## Data Model Direction

The current `WorldState.players` record already supports multiple players. The local game reads `world.localPlayerId`; future clients can render all non-local players from the same record.

Keep future patches small:

```ts
interface WorldPatch {
  serverTick: number;
  players?: Record<string, Partial<PlayerEntityState>>;
  world?: Partial<WorldState>;
}
```

For production, replace broad `Partial<WorldState>` patches with typed events or schema-validated patch messages.
