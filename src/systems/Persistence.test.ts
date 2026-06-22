import { beforeEach, describe, expect, it } from "vitest";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../data/map";
import type { ReputationState, WorldState } from "../types";
import { CURRENT_SCHEMA_VERSION, loadWorldState, saveWorldState } from "./Persistence";
import { createInitialWorldState, LOCAL_PLAYER_ID } from "./WorldState";
import { WORLD_SCALE } from "./map/WorldScale";

const SAVE_KEY = "bali-life-rpg.berawa-finns.save.v1";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

type LegacyPayload = Partial<WorldState> & Record<string, unknown>;

describe("Persistence migrations", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: storage
    });
  });

  it.each([
    { label: "raw v1", schemaVersion: undefined, hasCanonicalReputation: false },
    { label: "v2", schemaVersion: 2, hasCanonicalReputation: true },
    { label: "v3", schemaVersion: 3, hasCanonicalReputation: true }
  ])("migrates $label saves to v4 without runtime data loss", ({ schemaVersion, hasCanonicalReputation }) => {
    const raw = createLegacyPayload(schemaVersion, hasCanonicalReputation);
    storage.setItem(SAVE_KEY, JSON.stringify(raw));

    const migrated = loadWorldState();
    const player = migrated.players[LOCAL_PLAYER_ID];

    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(player.money).toBe(321);
    expect(player.activeQuestIds).toEqual(["canggu_station_restock"]);
    expect(player.completedQuestIds).toEqual(["berawa_bakery_run"]);
    expect(player.inventory).toEqual([
      { itemId: "coconut", quantity: 2 },
      { itemId: "butter_croissant", quantity: 1 }
    ]);
    expect(migrated.mapDiscovery).toEqual({
      discoveredAreaIds: ["pantai_berawa"],
      discoveredVenueIds: ["milk_madu_berawa", "baked_berawa"],
      revealAll: true
    });
    expect(migrated.relationships).toEqual([
      {
        subjectType: "npc",
        subjectId: "ibu_sari",
        affinity: 5,
        lastInteractionAt: 1200,
        memories: [{ type: "completed_quest", at: 1200, detail: "Restock" }]
      }
    ]);

    if (hasCanonicalReputation) {
      expect(migrated.reputation).toMatchObject({
        score: 77,
        wantedLevel: 1,
        bounty: 25,
        flaggedByVictims: 1,
        lastFlagReason: "Canonical standing"
      });
      expect(migrated.reputation.tags).toEqual(["social"]);
      expect(migrated.reputation.hiddenFlags).toEqual([
        { type: "green", reason: "Helped a neighbor", source: "test", createdAt: 99 }
      ]);
    } else {
      expect(migrated.reputation).toMatchObject({
        score: 42,
        wantedLevel: 2,
        bounty: 80,
        flaggedByVictims: 3,
        lastFlagReason: "Legacy victim report"
      });
    }

    expect(player).not.toHaveProperty("reputation");
    expect(player).not.toHaveProperty("wantedLevel");
    expect(player).not.toHaveProperty("bounty");
    expect(player).not.toHaveProperty("flaggedByVictims");
    expect(player).not.toHaveProperty("lastFlagReason");
    expectFiniteInBoundsPoint(player.x, player.y);
    expect(player.x / 100).toBeCloseTo(WORLD_SCALE, 3);
    expect(player.y / 200).toBeCloseTo(WORLD_SCALE, 3);
    expectFiniteInBoundsPoint(migrated.npcs.ibu_sari.x, migrated.npcs.ibu_sari.y);

    const writtenBack = JSON.parse(storage.getItem(SAVE_KEY) ?? "{}") as WorldState;
    expect(writtenBack.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });

  it("round-trips a v4 payload through save and load on meaningful runtime fields", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    player.money = 555;
    player.x = 2048;
    player.y = 1536;
    player.inventory.push({ itemId: "butter_croissant", quantity: 2 });
    player.activeQuestIds.push("canggu_station_restock");
    player.completedQuestIds.push("berawa_bakery_run");
    world.mapDiscovery.discoveredAreaIds.push("pantai_berawa");
    world.mapDiscovery.discoveredVenueIds.push("milk_madu_berawa");
    world.relationships.push({
      subjectType: "venue",
      subjectId: "milk_madu_berawa",
      affinity: 3,
      lastInteractionAt: 1440,
      memories: [{ type: "visited", at: 1440, detail: "Coffee stop" }]
    });
    world.reputation.score = 88;
    world.reputation.tags.push("helpful");
    world.reputation.hiddenFlags.push({ type: "green", reason: "Reliable tester", source: "test", createdAt: 1440 });

    saveWorldState(world);
    const loaded = loadWorldState();

    expect(pickRoundTripFields(loaded)).toEqual(pickRoundTripFields(world));
  });
});

function createLegacyPayload(schemaVersion: number | undefined, hasCanonicalReputation: boolean): LegacyPayload {
  const payload = {
    ...(schemaVersion ? { schemaVersion } : {}),
    version: 1,
    neighborhoodId: "berawa-finns-club",
    clock: { day: 4, minuteOfDay: 720, minutesPerSecond: 4 },
    localPlayerId: LOCAL_PLAYER_ID,
    players: {
      [LOCAL_PLAYER_ID]: {
        id: LOCAL_PLAYER_ID,
        displayName: "Migration Tester",
        x: 100,
        y: 200,
        direction: "left",
        money: 321,
        focus: 44,
        socialEnergy: 55,
        connections: 6,
        hasBike: true,
        onBike: false,
        bikeStuck: false,
        bikeCondition: 92,
        safety: 71,
        tutorialStep: "join_group",
        inventory: [
          { itemId: "coconut", quantity: 2 },
          { itemId: "butter_croissant", quantity: 1 }
        ],
        activeQuestIds: ["canggu_station_restock"],
        completedQuestIds: ["berawa_bakery_run"],
        joinedGroupIds: ["surf_morning_regulars"],
        reputation: 42,
        wantedLevel: 2,
        bounty: 80,
        flaggedByVictims: 3,
        lastFlagReason: "Legacy victim report"
      }
    },
    npcs: {
      ibu_sari: {
        id: "ibu_sari",
        x: 160,
        y: 220,
        currentRoutineId: "morning_shop",
        lastSpokenDay: 2
      }
    },
    relationships: [
      {
        subjectType: "npc",
        subjectId: "ibu_sari",
        affinity: 5,
        lastInteractionAt: 1200,
        memories: [{ type: "completed_quest", at: 1200, detail: "Restock" }]
      }
    ],
    reputation: hasCanonicalReputation ? createCanonicalReputation() : undefined,
    mapDiscovery: {
      discoveredAreaIds: ["pantai_berawa"],
      discoveredVenueIds: ["milk_madu_berawa", "baked_berawa"],
      revealAll: true
    },
    questFlags: { firstRunHintSeen: true },
    collectedPickups: { "coconut-west": 1234 }
  };
  return payload as LegacyPayload;
}

function createCanonicalReputation(): ReputationState {
  return {
    score: 77,
    wantedLevel: 1,
    bounty: 25,
    flaggedByVictims: 1,
    lastFlagReason: "Canonical standing",
    tags: ["social"],
    hiddenFlags: [{ type: "green", reason: "Helped a neighbor", source: "test", createdAt: 99 }],
    redemption: { active: true, challengeId: "apology_round" },
    history: [{ at: 99, change: "Canonical import", delta: 2 }]
  };
}

function expectFiniteInBoundsPoint(x: number, y: number): void {
  expect(Number.isFinite(x)).toBe(true);
  expect(Number.isFinite(y)).toBe(true);
  expect(x).toBeGreaterThanOrEqual(0);
  expect(x).toBeLessThanOrEqual(WORLD_WIDTH);
  expect(y).toBeGreaterThanOrEqual(0);
  expect(y).toBeLessThanOrEqual(WORLD_HEIGHT);
}

function pickRoundTripFields(world: WorldState): unknown {
  const player = world.players[world.localPlayerId];
  return {
    schemaVersion: world.schemaVersion,
    clock: world.clock,
    player: {
      x: player.x,
      y: player.y,
      money: player.money,
      inventory: player.inventory,
      activeQuestIds: player.activeQuestIds,
      completedQuestIds: player.completedQuestIds
    },
    mapDiscovery: world.mapDiscovery,
    relationships: world.relationships,
    reputation: world.reputation
  };
}
