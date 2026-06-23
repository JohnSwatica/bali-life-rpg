import { npcDefinitions } from "../data/npcs";
import { playerSpawn } from "../data/map";
import { createDefaultPortalState } from "./portal/PortalState";
import { createDefaultPlayerProfile } from "./profile/ProfileState";
import { createDefaultReputationState } from "./reputation/ReputationState";
import { createDefaultLifeLoopState } from "./life/LifeLoopState";
import { createDefaultPlayerMeters, syncLegacyPlayerMeterMirrors } from "./meters/PlayerMeters";
import type { NpcEntityState, PlayerEntityState, TimePhase, WorldState } from "../types";

export const LOCAL_PLAYER_ID = "local-player";

export function createInitialPlayerState(): PlayerEntityState {
  return {
    id: LOCAL_PLAYER_ID,
    displayName: "New Neighbor",
    x: playerSpawn.x,
    y: playerSpawn.y,
    direction: "down",
    money: 70,
    focus: 35,
    socialEnergy: 70,
    connections: 0,
    hasBike: false,
    onBike: false,
    bikeStuck: false,
    bikeCondition: 100,
    safety: 100,
    tutorialStep: "earn_bike_money",
    inventory: [
      { itemId: "nasi_bungkus", quantity: 1 },
      { itemId: "coconut", quantity: 1 }
    ],
    activeQuestIds: [],
    completedQuestIds: [],
    joinedGroupIds: []
  };
}

export function createInitialWorldState(): WorldState {
  const npcs = Object.fromEntries(
    Object.values(npcDefinitions).map((npc): [string, NpcEntityState] => {
      const firstStop = npc.routine[0];
      return [
        npc.id,
        {
          id: npc.id,
          x: firstStop.x,
          y: firstStop.y,
          currentRoutineId: firstStop.id,
          lastSpokenDay: 0
        }
      ];
    })
  );

  const world: WorldState = {
    schemaVersion: 7,
    version: 1,
    neighborhoodId: "berawa-finns-club",
    clock: {
      day: 1,
      minuteOfDay: 8 * 60,
      minutesPerSecond: 4
    },
    localPlayerId: LOCAL_PLAYER_ID,
    players: {
      [LOCAL_PLAYER_ID]: createInitialPlayerState()
    },
    npcs,
    groups: {},
    profile: createDefaultPlayerProfile(),
    reputation: createDefaultReputationState(60),
    meters: createDefaultPlayerMeters(),
    relationships: [],
    portal: createDefaultPortalState(),
    runtimeEvents: {
      attendedEventIds: []
    },
    life: createDefaultLifeLoopState(),
    mapDiscovery: {
      discoveredAreaIds: [],
      discoveredVenueIds: [],
      revealAll: false
    },
    questFlags: {},
    collectedPickups: {}
  };
  syncLegacyPlayerMeterMirrors(world);
  return world;
}

export function getLocalPlayer(world: WorldState): PlayerEntityState {
  return world.players[world.localPlayerId];
}

export function advanceClock(world: WorldState, deltaMs: number): void {
  const addedMinutes = (deltaMs / 1000) * world.clock.minutesPerSecond;
  world.clock.minuteOfDay += addedMinutes;
  while (world.clock.minuteOfDay >= 1440) {
    world.clock.minuteOfDay -= 1440;
    world.clock.day += 1;
  }
}

export function getTimePhase(minuteOfDay: number): TimePhase {
  if (minuteOfDay < 360) {
    return "night";
  }
  if (minuteOfDay < 450) {
    return "dawn";
  }
  if (minuteOfDay < 1080) {
    return "day";
  }
  if (minuteOfDay < 1170) {
    return "dusk";
  }
  return "night";
}

export function formatClock(world: WorldState): string {
  const minutes = Math.floor(world.clock.minuteOfDay);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `Day ${world.clock.day} ${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}
