import { createInitialPlayerState, createInitialWorldState, LOCAL_PLAYER_ID } from "./WorldState";
import { createDefaultPortalState } from "./portal/PortalState";
import { createDefaultPlayerProfile } from "./profile/ProfileState";
import { createDefaultReputationState } from "./reputation/ReputationState";
import { scaleDistance } from "./map/WorldScale";
import { migrateLifeLoopState } from "./life/LifeLoopState";
import { migratePlayerMeters, syncLegacyPlayerMeterMirrors } from "./meters/PlayerMeters";
import { migrateOpportunityState } from "./opportunities/OpportunityEngine";
import type {
  ActiveActivityState,
  ActiveMinigameChoice,
  ActiveMinigameState,
  GroupEntityState,
  NpcEntityState,
  PlayerEntityState,
  ReputationState,
  WorldState
} from "../types";

export const CURRENT_SCHEMA_VERSION = 11;
const SAVE_KEY = "bali-life-rpg.berawa-finns.save.v1";
const PAUSED_V2_KEY = "bali-life-rpg.berawa-finns.save.v2";
const RETIRED_INVENTORY_ITEM_IDS = new Set(["elena_notebook", "elena_sim"]);

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
    if (!parsed.schemaVersion || parsed.schemaVersion < CURRENT_SCHEMA_VERSION || loaded.key !== SAVE_KEY) {
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

export function hasSavedWorldState(): boolean {
  const { raw } = readRawSave();
  if (!raw) {
    return false;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<WorldState>;
    return parsed.version === 1 && parsed.neighborhoodId === "berawa-finns-club";
  } catch {
    return false;
  }
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
  const rawSchemaVersion = typeof raw.schemaVersion === "number" ? raw.schemaVersion : 1;
  const rawPlayers = raw.players as Record<string, Partial<PlayerEntityState>> | undefined;
  const rawLocalPlayer = rawPlayers?.[raw.localPlayerId ?? LOCAL_PLAYER_ID];
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
    reputation: migrateReputationState(raw),
    meters: migratePlayerMeters(raw.meters, rawLocalPlayer),
    relationships: raw.relationships ?? [],
    portal: raw.portal ?? createDefaultPortalState(),
    runtimeEvents: raw.runtimeEvents ?? { attendedEventIds: [] },
    life: migrateLifeLoopState(raw.life),
    opportunities: migrateOpportunityState(raw.opportunities),
    activeActivity: migrateActiveActivityState(raw.activeActivity),
    mapDiscovery: raw.mapDiscovery ?? { discoveredAreaIds: [], discoveredVenueIds: [], revealAll: false },
    questFlags: raw.questFlags ?? {},
    collectedPickups: raw.collectedPickups ?? {}
  } satisfies WorldState;

  const player = world.players[world.localPlayerId] ?? world.players[LOCAL_PLAYER_ID] ?? createInitialPlayerState();
  world.players[world.localPlayerId] = hydratePlayerState(player);
  syncLegacyPlayerMeterMirrors(world);
  if (rawSchemaVersion < 4) {
    scaleLegacyRuntimePositions(world, raw);
  }
  world.profile.displayName = world.profile.displayName || world.players[world.localPlayerId].displayName;
  world.profile.remoteAccountId = null;
  world.mapDiscovery.discoveredAreaIds = world.mapDiscovery.discoveredAreaIds ?? [];
  world.mapDiscovery.discoveredVenueIds = world.mapDiscovery.discoveredVenueIds ?? [];
  world.mapDiscovery.revealAll = world.mapDiscovery.revealAll ?? false;
  return world;
}

function migrateActiveActivityState(raw: unknown): ActiveActivityState | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const value = raw as Partial<ActiveActivityState>;
  if (
    (value.source !== "activity" &&
      value.source !== "opportunity" &&
      value.source !== "rideCheckpoint" &&
      value.source !== "scooterRepair" &&
      value.source !== "rivalRace") ||
    typeof value.venueId !== "string" ||
    typeof value.venueName !== "string" ||
    typeof value.label !== "string" ||
    typeof value.durationMin !== "number" ||
    typeof value.elapsedMs !== "number" ||
    typeof value.realDurationMs !== "number" ||
    typeof value.startedAt !== "number"
  ) {
    return null;
  }
  const base = {
    venueId: value.venueId,
    venueName: value.venueName,
    label: value.label,
    durationMin: value.durationMin,
    elapsedMs: Math.max(0, value.elapsedMs),
    realDurationMs: Math.max(1, value.realDurationMs),
    startedAt: value.startedAt,
    performanceScore: readOptionalUnit(value.performanceScore),
    minigame: migrateActiveMinigameState(value.minigame)
  };
  if (value.source === "activity" && typeof value.activityId === "string") {
    return { ...base, source: "activity", activityId: value.activityId };
  }
  if (value.source === "opportunity" && typeof value.opportunityId === "string") {
    return { ...base, source: "opportunity", opportunityId: value.opportunityId };
  }
  if (value.source === "rideCheckpoint" && typeof value.checkpointId === "string") {
    return { ...base, source: "rideCheckpoint", checkpointId: value.checkpointId };
  }
  if (value.source === "scooterRepair") {
    return { ...base, source: "scooterRepair" };
  }
  if (value.source === "rivalRace" && typeof value.raceId === "string") {
    return { ...base, source: "rivalRace", raceId: value.raceId };
  }
  return null;
}

function migrateActiveMinigameState(raw: unknown): ActiveMinigameState | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }
  const value = raw as Partial<ActiveMinigameState>;
  if (
    (value.kind !== "timing" && value.kind !== "balance" && value.kind !== "choice") ||
    typeof value.title !== "string" ||
    typeof value.prompt !== "string" ||
    typeof value.actionLabel !== "string"
  ) {
    return undefined;
  }
  return {
    kind: value.kind,
    title: value.title,
    prompt: value.prompt,
    actionLabel: value.actionLabel,
    attempts: readFiniteNumber(value.attempts, 0),
    bestScore: readUnit(value.bestScore, 0),
    markerPhase: readUnit(value.markerPhase, 0),
    targetStart: readUnit(value.targetStart, 0.42),
    targetEnd: readUnit(value.targetEnd, 0.58),
    selectedChoiceId: typeof value.selectedChoiceId === "string" ? value.selectedChoiceId : undefined,
    feedback: typeof value.feedback === "string" ? value.feedback : undefined,
    choices: Array.isArray(value.choices)
      ? value.choices.filter(
          (choice): choice is ActiveMinigameChoice =>
            Boolean(choice) &&
            typeof choice === "object" &&
            typeof (choice as { id?: unknown }).id === "string" &&
            typeof (choice as { label?: unknown }).label === "string" &&
            typeof (choice as { score?: unknown }).score === "number" &&
            typeof (choice as { feedback?: unknown }).feedback === "string"
        )
      : undefined
  };
}

function readOptionalUnit(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  return readUnit(value, 0);
}

function readFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readUnit(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.min(1, value));
}

function scaleLegacyRuntimePositions(world: WorldState, raw: Partial<WorldState> & Record<string, unknown>): void {
  const rawPlayers = raw.players as Record<string, Partial<PlayerEntityState>> | undefined;
  for (const [id, player] of Object.entries(rawPlayers ?? {})) {
    if (world.players[id] && hasPoint(player)) {
      world.players[id].x = scaleDistance(player.x);
      world.players[id].y = scaleDistance(player.y);
    }
  }

  const rawNpcs = raw.npcs as Record<string, Partial<NpcEntityState>> | undefined;
  for (const [id, npc] of Object.entries(rawNpcs ?? {})) {
    if (world.npcs[id] && hasPoint(npc)) {
      world.npcs[id].x = scaleDistance(npc.x);
      world.npcs[id].y = scaleDistance(npc.y);
    }
  }

  const rawGroups = raw.groups as Record<string, Partial<GroupEntityState>> | undefined;
  for (const [id, group] of Object.entries(rawGroups ?? {})) {
    if (world.groups[id] && hasPoint(group)) {
      world.groups[id].x = scaleDistance(group.x);
      world.groups[id].y = scaleDistance(group.y);
    }
  }
}

function hasPoint(value: { x?: unknown; y?: unknown }): value is { x: number; y: number } {
  return typeof value.x === "number" && typeof value.y === "number";
}

function hydratePlayerState(player: Partial<PlayerEntityState>): PlayerEntityState {
  const fresh = createInitialPlayerState();
  const {
    reputation: _legacyReputation,
    wantedLevel: _legacyWantedLevel,
    bounty: _legacyBounty,
    flaggedByVictims: _legacyFlaggedByVictims,
    lastFlagReason: _legacyLastFlagReason,
    ...runtimePlayer
  } = player as LegacyPlayerState;
  return {
    ...fresh,
    ...runtimePlayer,
    money: runtimePlayer.money ?? fresh.money,
    focus: runtimePlayer.focus ?? fresh.focus,
    socialEnergy: runtimePlayer.socialEnergy ?? fresh.socialEnergy,
    connections: runtimePlayer.connections ?? fresh.connections,
    hasBike: runtimePlayer.hasBike ?? false,
    onBike: runtimePlayer.onBike ?? false,
    bikeStuck: runtimePlayer.bikeStuck ?? false,
    bikeCondition: runtimePlayer.bikeCondition ?? 100,
    safety: runtimePlayer.safety ?? 100,
    tutorialStep: runtimePlayer.tutorialStep ?? "earn_bike_money",
    inventory: (runtimePlayer.inventory ?? fresh.inventory).filter((entry) => !RETIRED_INVENTORY_ITEM_IDS.has(entry.itemId)),
    activeQuestIds: runtimePlayer.activeQuestIds ?? [],
    completedQuestIds: runtimePlayer.completedQuestIds ?? [],
    joinedGroupIds: runtimePlayer.joinedGroupIds ?? []
  };
}

type LegacyPlayerState = Partial<PlayerEntityState> & {
  reputation?: number;
  wantedLevel?: number;
  bounty?: number;
  flaggedByVictims?: number;
  lastFlagReason?: string;
};

function migrateReputationState(raw: Partial<WorldState> & Record<string, unknown>): ReputationState {
  const legacy = extractLegacyStanding(raw);
  const existing = raw.reputation as Partial<ReputationState> | undefined;
  return {
    ...createDefaultReputationState(legacy.score),
    ...existing,
    score: existing?.score ?? legacy.score,
    wantedLevel: existing?.wantedLevel ?? legacy.wantedLevel,
    bounty: existing?.bounty ?? legacy.bounty,
    flaggedByVictims: existing?.flaggedByVictims ?? legacy.flaggedByVictims,
    lastFlagReason: existing?.lastFlagReason ?? legacy.lastFlagReason,
    tags: existing?.tags ?? [],
    hiddenFlags: existing?.hiddenFlags ?? [],
    redemption: existing?.redemption ?? { active: false, challengeId: null },
    history: existing?.history ?? []
  };
}

function extractLegacyStanding(raw: Partial<WorldState> & Record<string, unknown>): {
  score: number;
  wantedLevel: number;
  bounty: number;
  flaggedByVictims: number;
  lastFlagReason?: string;
} {
  const localId = typeof raw.localPlayerId === "string" ? raw.localPlayerId : LOCAL_PLAYER_ID;
  const players = raw.players as Record<string, LegacyPlayerState> | undefined;
  const player = players?.[localId];
  return {
    score: player?.reputation ?? 60,
    wantedLevel: player?.wantedLevel ?? 0,
    bounty: player?.bounty ?? 0,
    flaggedByVictims: player?.flaggedByVictims ?? 0,
    lastFlagReason: player?.lastFlagReason
  };
}
