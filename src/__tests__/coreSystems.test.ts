import { describe, expect, it, vi } from "vitest";

vi.mock("phaser", () => ({
  default: {
    Math: {
      Distance: {
        Between: (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x1 - x2, y1 - y2)
      }
    }
  }
}));
import { curatedVenueNodes } from "../data/authoredStreetLayout";
import { npcDefinitions } from "../data/npcs";
import { shopDefinitions } from "../data/shops";
import { addItem, getQuantity } from "../systems/Inventory";
import { InteractionController, type InteractionOffender } from "../systems/interaction/InteractionController";
import { applyActivity, getVenueActivityContext } from "../systems/life/ActivityEngine";
import { getSettlingInGoalStates, updateSettlingInGoals } from "../systems/life/SettlingInGoals";
import {
  addHiddenTrustFlag,
  adjustReputation,
  awardReputationTag,
  clearWantedStanding,
  createDefaultReputationState,
  getBounty,
  getFlaggedByVictims,
  getLastFlagReason,
  getReputationScore,
  getWantedLevel,
  recordRecklessDamageFlag,
  reduceWantedStanding
} from "../systems/reputation/ReputationState";
import { bumpRelationshipAffinity } from "../systems/relationships/RelationshipMemory";
import { completeNextRelationshipArcBeat } from "../systems/relationships/RelationshipArcs";
import { resolveNpcQuestInteraction, getQuestObjectives } from "../systems/quests/QuestRegistry";
import { createInitialWorldState } from "../systems/WorldState";
import type { PlayerEntityState } from "../types";

function completeIbuSariQuest(player: PlayerEntityState): void {
  expect(resolveNpcQuestInteraction(player, "ibu_sari")?.handled).toBe(true);
  addItem(player, "coconut", 2);
  const result = resolveNpcQuestInteraction(player, "ibu_sari");
  expect(result?.shouldSave).toBe(true);
}

describe("QuestRegistry", () => {
  it("declares starter quest objective handlers as data", () => {
    expect(getQuestObjectives("canggu_station_restock")).toEqual([{ type: "deliver", itemId: "coconut", quantity: 2 }]);
    expect(getQuestObjectives("berawa_bakery_run")).toEqual([{ type: "deliver", itemId: "butter_croissant", quantity: 1 }]);
  });

  it("starts, progresses, completes, and safely re-reads both starter quests", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    const startingMoney = player.money;

    const sariStart = resolveNpcQuestInteraction(player, "ibu_sari");
    expect(sariStart).toMatchObject({ handled: true, shouldSave: true, intents: [] });
    expect(player.activeQuestIds).toContain("canggu_station_restock");

    const sariProgress = resolveNpcQuestInteraction(player, "ibu_sari");
    expect(sariProgress).toMatchObject({ handled: true, shouldSave: false, intents: [] });
    expect(player.completedQuestIds).not.toContain("canggu_station_restock");

    addItem(player, "coconut", 1);
    const sariTurnIn = resolveNpcQuestInteraction(player, "ibu_sari");
    expect(sariTurnIn?.intents.map((intent) => intent.kind)).toEqual(["RecordMemory", "AwardReputationTag", "AdjustReputation"]);
    expect(player.activeQuestIds).not.toContain("canggu_station_restock");
    expect(player.completedQuestIds).toContain("canggu_station_restock");
    expect(getQuantity(player, "kopi_bali")).toBe(1);

    const moneyAfterSari = player.money;
    const sariCompleteAgain = resolveNpcQuestInteraction(player, "ibu_sari");
    expect(sariCompleteAgain).toMatchObject({ handled: true, shouldSave: false, intents: [] });
    expect(player.money).toBe(moneyAfterSari);
    expect(player.completedQuestIds.filter((id) => id === "canggu_station_restock")).toHaveLength(1);

    expect(resolveNpcQuestInteraction(player, "kadek")?.handled).toBe(true);
    addItem(player, "butter_croissant", 1);
    const kadekTurnIn = resolveNpcQuestInteraction(player, "kadek");
    expect(kadekTurnIn?.intents.map((intent) => intent.kind)).toEqual(["RecordMemory", "AwardReputationTag", "AdjustReputation"]);
    expect(player.completedQuestIds).toContain("berawa_bakery_run");
    expect(getQuantity(player, "surf_sticker")).toBe(2);
    expect(player.money).toBe(startingMoney + 90 + 75);
  });

  it.skip("exercises collect/visit/buy/talk/activity/meter objective handlers once scripted fixtures exist", () => {
    // The exported registry currently has two starter quest scripts, both using deliver objectives.
    // The generic private handlers for other objective types need fixtures or an exported pure evaluator.
  });
});

describe("Settling In goals", () => {
  it("completes the daily and social goals from their runtime state and sets settledIn", () => {
    const world = createInitialWorldState();

    applyActivity(world, getVenueActivityContext("milk_madu_berawa")!, "remote_work_session");
    applyActivity(world, getVenueActivityContext("milk_madu_berawa")!, "grab_coffee");
    applyActivity(world, getVenueActivityContext("milk_madu_berawa")!, "eat_properly");
    world.life.activityHistory["milk_madu_berawa:remote_work_session"].earnedMoney = 300;
    world.life.activityHistory["berawa_beach:surf_beach_time"] = { count: 1, lastDay: world.clock.day, totalCount: 1, earnedMoney: 0 };
    bumpRelationshipAffinity(world, "npc", "ari", 8, "goal affinity", 1);
    world.runtimeEvents.attendedEventIds.push("berawa_beach_run_morning");
    world.life.joinedClubIds.push("berawa_run_crew");
    completeNextRelationshipArcBeat(world, "ari", 2);

    const completed = updateSettlingInGoals(world);
    const states = Object.fromEntries(getSettlingInGoalStates(world).map((goal) => [goal.id, goal.complete]));

    expect(completed).toEqual([
      "find_your_spot",
      "first_friend",
      "earn_your_keep",
      "touch_grass",
      "plug_in",
      "find_your_crew",
      "deepen_a_bond"
    ]);
    expect(states).toEqual({
      find_your_spot: true,
      first_friend: true,
      earn_your_keep: true,
      touch_grass: true,
      plug_in: true,
      find_your_crew: true,
      deepen_a_bond: true
    });
    expect(world.life.settledIn).toBe(true);
  });
});

describe("ReputationState", () => {
  it("tracks score, tags, hidden flags, wanted standing, bounty, redemption shape, and history", () => {
    const reputation = createDefaultReputationState(60);

    adjustReputation(reputation, 80, "big help", 1);
    adjustReputation(reputation, -300, "big mess", 2);
    expect(getReputationScore(reputation)).toBe(-100);
    expect(reputation.history.map((event) => event.change)).toEqual(["big help", "big mess"]);

    awardReputationTag(reputation, "helpful", "helped", 3);
    awardReputationTag(reputation, "helpful", "helped again", 4);
    expect(reputation.tags).toEqual(["helpful"]);
    expect(reputation.history.at(-1)).toMatchObject({ change: "helped again" });

    addHiddenTrustFlag(reputation, { type: "green", reason: "paid back", source: "test" }, 5);
    expect(reputation.hiddenFlags).toEqual([{ type: "green", reason: "paid back", source: "test", createdAt: 5 }]);
    expect(reputation.redemption).toEqual({ active: false, challengeId: null });

    const limits = { maxWantedLevel: 3, maxBounty: 120, firstFlagBounty: 20, repeatFlagBounty: 35 };
    expect(recordRecklessDamageFlag(reputation, "Ari", 6, limits)).toMatchObject({
      wantedLevel: 1,
      bounty: 20,
      bountyIncrease: 20,
      flaggedByVictims: 1
    });
    recordRecklessDamageFlag(reputation, "Made", 7, limits);
    recordRecklessDamageFlag(reputation, "Kadek", 8, limits);
    recordRecklessDamageFlag(reputation, "Ibu Sari", 9, limits);
    expect(getWantedLevel(reputation)).toBe(3);
    expect(getBounty(reputation)).toBe(120);
    expect(getFlaggedByVictims(reputation)).toBe(4);
    expect(getLastFlagReason(reputation)).toBe("Bike hit reported by Ibu Sari");

    reduceWantedStanding(reputation, 1, 40, "made amends", 10);
    expect(getWantedLevel(reputation)).toBe(2);
    expect(getBounty(reputation)).toBe(80);

    clearWantedStanding(reputation, "community service complete", 11);
    expect(getWantedLevel(reputation)).toBe(0);
    expect(getBounty(reputation)).toBe(0);
    expect(getFlaggedByVictims(reputation)).toBe(0);
    expect(getLastFlagReason(reputation)).toBeUndefined();
  });
});

describe("InteractionController", () => {
  it("prioritizes nearby NPCs over overlapping shops", () => {
    const sariStop = npcDefinitions.ibu_sari.routine[0];
    const controller = new InteractionController({
      getPlayerPosition: () => ({ x: sariStop.x, y: sariStop.y }),
      getNpcSprite: (npcId) => (npcId === "ibu_sari" ? ({ x: sariStop.x, y: sariStop.y } as never) : undefined),
      isPickupAvailable: () => false,
      getWantedOffenders: () => [],
      getOffenderReward: () => 0
    });

    const target = controller.getNearestInteraction();
    expect(target).toMatchObject({ type: "npc", id: "ibu_sari" });
    expect(shopDefinitions.canggu_station.radius).toBeGreaterThan(target?.distance ?? 0);
  });

  it("resolves non-shop venue visits when no higher-priority target is nearby", () => {
    const node = curatedVenueNodes.find((venue) => venue.venueId === "nude_cafe_berawa");
    expect(node).toBeDefined();
    const controller = new InteractionController({
      getPlayerPosition: () => ({ x: node!.x, y: node!.y }),
      getNpcSprite: () => undefined,
      isPickupAvailable: () => false,
      getWantedOffenders: () => [],
      getOffenderReward: () => 0
    });

    expect(controller.getNearestInteraction()).toMatchObject({ type: "venue", id: "nude_cafe_berawa" });
  });

  it("prioritizes wanted offenders over old community activities", () => {
    const offender = {
      id: "reckless-rider",
      name: "Reckless Rider",
      sprite: { x: 2829, y: 584 },
      cash: 90,
      wantedLevel: 1
    } as InteractionOffender;
    const controller = new InteractionController({
      getPlayerPosition: () => ({ x: 2829, y: 584 }),
      getNpcSprite: () => undefined,
      isPickupAvailable: () => false,
      getWantedOffenders: () => [offender],
      getOffenderReward: () => 40
    });

    expect(controller.getNearestInteraction()).toMatchObject({ type: "offender", id: "reckless-rider" });
  });
});
