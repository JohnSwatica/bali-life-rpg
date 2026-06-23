import { describe, expect, it } from "vitest";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../data/map";
import { CURRENT_SCHEMA_VERSION, loadWorldState, saveWorldState } from "../systems/Persistence";
import { createInitialWorldState, LOCAL_PLAYER_ID } from "../systems/WorldState";
import { installMemoryLocalStorage, writeRawSave } from "./testUtils";
import type { WorldState } from "../types";

installMemoryLocalStorage();

function baseRawSave(schemaVersion?: number): Record<string, unknown> {
  return {
    ...(schemaVersion == null ? {} : { schemaVersion }),
    version: 1,
    neighborhoodId: "berawa-finns-club",
    clock: { day: 4, minuteOfDay: 13 * 60, minutesPerSecond: 4 },
    localPlayerId: LOCAL_PLAYER_ID,
    players: {
      [LOCAL_PLAYER_ID]: {
        id: LOCAL_PLAYER_ID,
        displayName: "Migration Tester",
        x: 120,
        y: 240,
        direction: "right",
        money: 432,
        focus: 17,
        socialEnergy: 29,
        connections: 6,
        hasBike: true,
        onBike: false,
        bikeStuck: true,
        bikeCondition: 54,
        safety: 73,
        tutorialStep: "free_roam",
        inventory: [
          { itemId: "coconut", quantity: 3 },
          { itemId: "kopi_bali", quantity: 1 }
        ],
        activeQuestIds: ["canggu_station_restock"],
        completedQuestIds: ["berawa_bakery_run"],
        joinedGroupIds: ["berawa_breakfast_loop"],
        reputation: 44,
        wantedLevel: 2,
        bounty: 65,
        flaggedByVictims: 3,
        lastFlagReason: "legacy bike report"
      }
    },
    relationships: [
      {
        subjectType: "npc",
        subjectId: "ari",
        affinity: 9,
        lastInteractionAt: 1234,
        memories: [{ type: "visited", at: 1234, detail: "legacy hello" }]
      }
    ],
    profile: {
      profileId: "local-test-profile",
      displayName: "Migration Tester",
      avatar: { body: "teal", hair: "dark", outfit: "linen" },
      lifestyleTags: ["founder", "surfer"],
      bio: "Testing the v9 chain.",
      homeArea: "Berawa",
      createdAt: 111,
      remoteAccountId: "should-be-nulled"
    },
    portal: { current: "single", multiplayerStatus: "locked" },
    mapDiscovery: {
      discoveredAreaIds: ["pantai_berawa"],
      discoveredVenueIds: ["milk_madu_berawa"],
      revealAll: false
    },
    questFlags: { restock_hint_seen: true },
    collectedPickups: { "coconut-west": 88 }
  };
}

function expectCommonMigrationFields(world: WorldState): void {
  const player = world.players[world.localPlayerId];
  expect(world.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  expect(player.money).toBe(432);
  expect(player.inventory).toEqual([
    { itemId: "coconut", quantity: 3 },
    { itemId: "kopi_bali", quantity: 1 }
  ]);
  expect(player.activeQuestIds).toEqual(["canggu_station_restock"]);
  expect(player.completedQuestIds).toEqual(["berawa_bakery_run"]);
  expect(player.joinedGroupIds).toEqual(["berawa_breakfast_loop"]);
  expect(world.relationships[0]).toMatchObject({ subjectType: "npc", subjectId: "ari", affinity: 9 });
  expect(world.mapDiscovery.discoveredVenueIds).toContain("milk_madu_berawa");
  expect(world.questFlags.restock_hint_seen).toBe(true);
  expect(world.collectedPickups["coconut-west"]).toBe(88);
  expect(world.profile.profileId).toBe("local-test-profile");
  expect(world.profile.remoteAccountId).toBeNull();
  expect(world.portal).toEqual({ current: "single", multiplayerStatus: "locked" });
  expect(player.x).toBeGreaterThan(0);
  expect(player.x).toBeLessThanOrEqual(WORLD_WIDTH);
  expect(player.y).toBeGreaterThan(0);
  expect(player.y).toBeLessThanOrEqual(WORLD_HEIGHT);
}

describe("Persistence migration", () => {
  it("migrates a raw v1 save to v9 without losing legacy state", () => {
    writeRawSave(baseRawSave());

    const world = loadWorldState();
    const player = world.players[world.localPlayerId] as unknown as Record<string, unknown>;

    expectCommonMigrationFields(world);
    expect(world.reputation).toMatchObject({
      score: 44,
      wantedLevel: 2,
      bounty: 65,
      flaggedByVictims: 3,
      lastFlagReason: "legacy bike report"
    });
    expect(player).not.toHaveProperty("reputation");
    expect(player).not.toHaveProperty("wantedLevel");
    expect(player).not.toHaveProperty("bounty");
    expect(world.meters).toEqual({ energy: 78, wellbeing: 66, focus: 17, social: 29 });
    expect(world.players[world.localPlayerId].focus).toBe(17);
    expect(world.players[world.localPlayerId].socialEnergy).toBe(29);
    expect(world.life).toMatchObject({
      activityHistory: {},
      completedGoalIds: [],
      joinedClubIds: [],
      relationshipArcProgress: {},
      settledIn: false
    });
    expect(world.opportunities).toMatchObject({
      live: [],
      completedTemplateIds: [],
      missedTemplateIds: [],
      messages: [],
      trackedOpportunityId: null
    });
  });

  it("migrates v4, v6, v7, and v8 saves into the v9 life/opportunity shape", () => {
    const cases = [
      {
        version: 4,
        extra: {
          meters: { energy: 12, wellbeing: 34, focus: 56, social: 78 },
          runtimeEvents: { attendedEventIds: ["berawa_beach_run_morning"] }
        }
      },
      {
        version: 6,
        extra: {
          meters: { energy: 20, wellbeing: 30, focus: 40, social: 50 },
          life: {
            activityHistory: {
              "milk_madu_berawa:remote_work_session": { count: 1, lastDay: 2, totalCount: 2, earnedMoney: 220 }
            },
            completedGoalIds: ["earn_your_keep"],
            settledIn: false
          }
        }
      },
      {
        version: 7,
        extra: {
          life: {
            activityHistory: {},
            completedGoalIds: ["plug_in"],
            joinedClubIds: ["berawa_run_crew"],
            settledIn: false
          }
        }
      },
      {
        version: 8,
        extra: {
          opportunities: {
            live: [
              {
                id: "milk_madu_lunch_rush_shift:100:1",
                templateId: "milk_madu_lunch_rush_shift",
                status: "accepted",
                spawnedAt: 100,
                expiresAt: 190,
                locationVenueId: "milk_madu_berawa",
                acceptedAt: 110
              }
            ],
            completedTemplateIds: ["satu_satu_receipt_sort"],
            missedTemplateIds: ["ari_sunset_ping"],
            messages: [
              {
                id: "msg-1",
                at: 100,
                from: "Gig Radar",
                body: "Testing opportunity feed.",
                opportunityId: "milk_madu_lunch_rush_shift:100:1",
                venueId: "milk_madu_berawa",
                read: false
              }
            ],
            trackedOpportunityId: "milk_madu_lunch_rush_shift:100:1",
            lastSpawnAt: 100,
            templateCooldownUntil: { satu_satu_receipt_sort: 250 }
          }
        }
      }
    ];

    for (const testCase of cases) {
      localStorage.clear();
      writeRawSave({ ...baseRawSave(testCase.version), ...testCase.extra });
      const world = loadWorldState();

      expectCommonMigrationFields(world);
      expect(world.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(world.life.joinedClubIds).toEqual(testCase.version === 7 ? ["berawa_run_crew"] : []);
      expect(world.life.relationshipArcProgress).toEqual({});
      if (testCase.version === 8) {
        expect(world.opportunities.live[0]).toMatchObject({ templateId: "milk_madu_lunch_rush_shift", status: "accepted" });
        expect(world.opportunities.completedTemplateIds).toEqual(["satu_satu_receipt_sort"]);
        expect(world.opportunities.missedTemplateIds).toEqual(["ari_sunset_ping"]);
        expect(world.opportunities.messages[0]).toMatchObject({ from: "Gig Radar", read: false });
        expect(world.opportunities.trackedOpportunityId).toBe("milk_madu_lunch_rush_shift:100:1");
        expect(world.opportunities.templateCooldownUntil.satu_satu_receipt_sort).toBe(250);
      }
    }
  });

  it("round-trips a v9 payload through save and load on meaningful fields", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    player.money = 999;
    player.inventory = [{ itemId: "coconut", quantity: 7 }];
    player.completedQuestIds = ["canggu_station_restock"];
    world.meters = { energy: 61, wellbeing: 62, focus: 63, social: 64 };
    world.life.joinedClubIds = ["berawa_run_crew"];
    world.life.relationshipArcProgress = {
      ari_beach_regular: { completedBeatIds: ["ari_remembers_your_name"], lastAdvancedAt: 123 }
    };
    world.runtimeEvents.attendedEventIds = ["berawa_beach_run_morning"];
    world.relationships = [
      {
        subjectType: "npc",
        subjectId: "ari",
        affinity: 12,
        lastInteractionAt: 123,
        memories: [{ type: "attended_event", at: 123, detail: "Berawa Beach Run" }]
      }
    ];
    world.mapDiscovery.discoveredVenueIds = ["berawa_beach"];
    world.opportunities = {
      live: [
        {
          id: "canggu_station_dropped_cart:200:1",
          templateId: "canggu_station_dropped_cart",
          status: "accepted",
          spawnedAt: 200,
          expiresAt: 270,
          acceptedAt: 205,
          locationVenueId: "canggu_station"
        }
      ],
      completedTemplateIds: ["milk_madu_lunch_rush_shift"],
      missedTemplateIds: ["ari_sunset_ping"],
      messages: [
        {
          id: "msg-round-trip",
          at: 210,
          from: "Local Help",
          body: "Round trip message.",
          opportunityId: "canggu_station_dropped_cart:200:1",
          venueId: "canggu_station",
          read: false
        }
      ],
      trackedOpportunityId: "canggu_station_dropped_cart:200:1",
      lastSpawnAt: 200,
      templateCooldownUntil: { milk_madu_lunch_rush_shift: 900 }
    };

    saveWorldState(world);
    const loaded = loadWorldState();

    expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(loaded.players[loaded.localPlayerId].money).toBe(999);
    expect(loaded.players[loaded.localPlayerId].inventory).toEqual([{ itemId: "coconut", quantity: 7 }]);
    expect(loaded.players[loaded.localPlayerId].completedQuestIds).toEqual(["canggu_station_restock"]);
    expect(loaded.meters).toEqual({ energy: 61, wellbeing: 62, focus: 63, social: 64 });
    expect(loaded.life.joinedClubIds).toEqual(["berawa_run_crew"]);
    expect(loaded.life.relationshipArcProgress).toEqual({
      ari_beach_regular: { completedBeatIds: ["ari_remembers_your_name"], lastAdvancedAt: 123 }
    });
    expect(loaded.runtimeEvents.attendedEventIds).toEqual(["berawa_beach_run_morning"]);
    expect(loaded.relationships).toEqual(world.relationships);
    expect(loaded.mapDiscovery.discoveredVenueIds).toEqual(["berawa_beach"]);
    expect(loaded.opportunities).toEqual(world.opportunities);
  });
});
