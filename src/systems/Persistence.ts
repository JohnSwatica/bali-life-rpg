import { createInitialPlayerState, createInitialWorldState, LOCAL_PLAYER_ID } from "./WorldState";
import { createDefaultPortalState } from "./portal/PortalState";
import { createDefaultPlayerProfile } from "./profile/ProfileState";
import { createDefaultReputationState } from "./reputation/ReputationState";
import type { PlayerEntityState, WorldState } from "../types";

export const CURRENT_SCHEMA_VERSION = 2;
const SAVE_KEY = "bali-life-rpg.berawa-finns.save.v1";
const PAUSED_V2_KEY = "bali-life-rpg.berawa-finns.save.v2";

export function saveWorldState(world: WorldState): void {
  world.schemaVersion = CURRENT_SCHEMA_VERSION;
  localStorage.setItem(SAVE_KEY, JSON.stringify(world));
}

export function loadWorldState(): WorldState {
  const loaded = readRawSave();
  if (!loaded.raw) {
    return createInitialWorldState();
  }

  try {
    const parsed = JSON.parse(loaded.raw) as Partial<WorldState> & Record<string, unknown>;
    if (parsed.version !== 1 || parsed.neighborhoodId !== "berawa-finns-club") {
      return createInitialWorldState();
    }
    const migrated = migrateWorldState(parsed);
    if (!parsed.schemaVersion || loaded.key !== SAVE_KEY) {
      saveWorldState(migrated);
    }
    return migrated;
  } catch {
    return createInitialWorldState();
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(PAUSED_V2_KEY);
}

function readRawSave(): { raw: string | null; key: string } {
  const current = localStorage.getItem(SAVE_KEY);
  if (current) {
    return { raw: current, key: SAVE_KEY };
  }
  const pausedV2 = localStorage.getItem(PAUSED_V2_KEY);
  return { raw: pausedV2, key: PAUSED_V2_KEY };
}

function migrateWorldState(raw: Partial<WorldState> & Record<string, unknown>): WorldState {
  const fresh = createInitialWorldState();
  const world = {
    ...fresh,
    ...raw,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    clock: raw.clock ?? fresh.clock,
    localPlayerId: raw.localPlayerId ?? LOCAL_PLAYER_ID,
    players: { ...fresh.players, ...(raw.players ?? {}) },
    npcs: { ...fresh.npcs, ...(raw.npcs ?? {}) },
    groups: raw.groups ?? {},
    profile: raw.profile ?? createDefaultPlayerProfile(),
    reputation: raw.reputation ?? createDefaultReputationState(extractLegacyReputation(raw)),
    relationships: raw.relationships ?? [],
    portal: raw.portal ?? createDefaultPortalState(),
    runtimeEvents: raw.runtimeEvents ?? { attendedEventIds: [] },
    mapDiscovery: raw.mapDiscovery ?? { discoveredAreaIds: [], discoveredVenueIds: [], revealAll: false },
    questFlags: raw.questFlags ?? {},
    collectedPickups: raw.collectedPickups ?? {}
  } satisfies WorldState;

  const player = world.players[world.localPlayerId] ?? world.players[LOCAL_PLAYER_ID] ?? createInitialPlayerState();
  world.players[world.localPlayerId] = hydratePlayerState(player, world.reputation.score);
  world.profile.displayName = world.profile.displayName || world.players[world.localPlayerId].displayName;
  world.profile.remoteAccountId = null;
  world.reputation.hiddenFlags = world.reputation.hiddenFlags ?? [];
  world.reputation.tags = world.reputation.tags ?? [];
  world.reputation.history = world.reputation.history ?? [];
  world.reputation.redemption = world.reputation.redemption ?? { active: false, challengeId: null };
  world.mapDiscovery.discoveredAreaIds = world.mapDiscovery.discoveredAreaIds ?? [];
  world.mapDiscovery.discoveredVenueIds = world.mapDiscovery.discoveredVenueIds ?? [];
  world.mapDiscovery.revealAll = world.mapDiscovery.revealAll ?? false;
  return world;
}

function hydratePlayerState(player: Partial<PlayerEntityState>, fallbackReputation: number): PlayerEntityState {
  const fresh = createInitialPlayerState();
  return {
    ...fresh,
    ...player,
    money: player.money ?? fresh.money,
    focus: player.focus ?? fresh.focus,
    socialEnergy: player.socialEnergy ?? fresh.socialEnergy,
    connections: player.connections ?? fresh.connections,
    reputation: player.reputation ?? fallbackReputation,
    wantedLevel: player.wantedLevel ?? 0,
    bounty: player.bounty ?? 0,
    flaggedByVictims: player.flaggedByVictims ?? 0,
    hasBike: player.hasBike ?? false,
    onBike: player.onBike ?? false,
    bikeStuck: player.bikeStuck ?? false,
    bikeCondition: player.bikeCondition ?? 100,
    safety: player.safety ?? 100,
    tutorialStep: player.tutorialStep ?? "earn_bike_money",
    inventory: player.inventory ?? fresh.inventory,
    activeQuestIds: player.activeQuestIds ?? [],
    completedQuestIds: player.completedQuestIds ?? [],
    joinedGroupIds: player.joinedGroupIds ?? []
  };
}

function extractLegacyReputation(raw: Partial<WorldState> & Record<string, unknown>): number {
  const localId = typeof raw.localPlayerId === "string" ? raw.localPlayerId : LOCAL_PLAYER_ID;
  const players = raw.players as Record<string, Partial<PlayerEntityState>> | undefined;
  return players?.[localId]?.reputation ?? 60;
}
