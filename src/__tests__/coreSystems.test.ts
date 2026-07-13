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
import { pickupDefinitions } from "../data/map";
import { npcDefinitions } from "../data/npcs";
import { shopDefinitions } from "../data/shops";
import { addItem, getQuantity } from "../systems/Inventory";
import { InteractionController, type InteractionOffender } from "../systems/interaction/InteractionController";
import { applyActivity, getVenueActivityContext } from "../systems/life/ActivityEngine";
import { getAct2GoalStates, getAct2NextStep, getAct2PayoffOpportunityState } from "../systems/life/Act2Goals";
import { getAct3ReadinessGoalStates, getAct3ReadinessNextStep, isAct3Ready } from "../systems/life/Act3Readiness";
import { getSettlingInGoalStates, updateSettlingInGoals } from "../systems/life/SettlingInGoals";
import {
  addHiddenTrustFlag,
  adjustReputationAxis,
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
import { getRelationshipChoiceSceneForNpc } from "../systems/relationships/RelationshipChoiceScenes";
import {
  consumeQuestObjective,
  getQuestObjectives,
  isQuestObjectiveSatisfied,
  resolveNpcQuestInteraction,
  type QuestObjective
} from "../systems/quests/QuestRegistry";
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

  it("authors the Kadek turn-in choice without intercepting Ibu Sari's quest", () => {
    const kadekScene = getRelationshipChoiceSceneForNpc("kadek");

    expect(kadekScene?.id).toBe("kadek_bakery_turnin");
    expect(kadekScene?.options).toHaveLength(2);
    expect(kadekScene?.options.map((option) => option.axis?.kind)).toEqual(["relational", "relational"]);
    expect(getRelationshipChoiceSceneForNpc("ibu_sari")).toBeUndefined();
  });

  it("exercises the generic objective evaluator without requiring extra quest fixtures", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    const collect: QuestObjective = { type: "collect", itemId: "coconut", quantity: 2 };
    const deliver: QuestObjective = { type: "deliver", itemId: "coconut", quantity: 2 };
    const buy: QuestObjective = { type: "buy", itemId: "butter_croissant", quantity: 1 };
    const startingCoconuts = getQuantity(player, "coconut");

    expect(isQuestObjectiveSatisfied(player, { ...collect, quantity: startingCoconuts + 2 })).toBe(false);
    addItem(player, "coconut", 2);
    expect(isQuestObjectiveSatisfied(player, collect)).toBe(true);
    expect(isQuestObjectiveSatisfied(player, deliver)).toBe(true);
    expect(consumeQuestObjective(player, collect)).toEqual([]);
    expect(getQuantity(player, "coconut")).toBe(startingCoconuts + 2);
    expect(consumeQuestObjective(player, deliver)).toEqual([{ itemId: "coconut", quantity: 2 }]);
    expect(getQuantity(player, "coconut")).toBe(startingCoconuts);

    expect(isQuestObjectiveSatisfied(player, buy)).toBe(false);
    addItem(player, "butter_croissant", 1);
    expect(isQuestObjectiveSatisfied(player, buy)).toBe(true);
    expect(isQuestObjectiveSatisfied(player, { type: "talk", npcId: "ari" })).toBe(true);
    expect(isQuestObjectiveSatisfied(player, { type: "visit", venueId: "berawa_beach" })).toBe(true);
  });
});

describe("Settling In goals", () => {
  it("counts station-specific work and beach reset activities toward settling goals", () => {
    const world = createInitialWorldState();
    world.life.activityHistory["satu_satu_coffee:cafe_deep_work"] = { count: 1, lastDay: world.clock.day, totalCount: 1, earnedMoney: 310 };
    world.life.activityHistory["berawa_beach:beach_reflect_walk"] = { count: 1, lastDay: world.clock.day, totalCount: 1, earnedMoney: 0 };

    const states = Object.fromEntries(getSettlingInGoalStates(world).map((goal) => [goal.id, goal.complete]));

    expect(states.earn_your_keep).toBe(true);
    expect(states.touch_grass).toBe(true);
  });

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

describe("Act 2 social goals", () => {
  it("stay hidden before Act 2 and then track club rhythm plus relationship beats", () => {
    const world = createInitialWorldState();
    expect(getAct2GoalStates(world)).toEqual([]);
    expect(getAct2NextStep(world)).toBeNull();

    world.life.actProgress.currentAct = 2;
    let states = Object.fromEntries(getAct2GoalStates(world).map((goal) => [goal.id, goal.complete]));
    expect(states).toEqual({
      join_first_crew: false,
      attend_club_rhythm: false,
      deepen_a_bond: false,
      open_better_door: false
    });
    expect(getAct2NextStep(world)).toMatchObject({ title: "Join a first crew" });

    world.life.joinedClubIds.push("berawa_run_crew");
    states = Object.fromEntries(getAct2GoalStates(world).map((goal) => [goal.id, goal.complete]));
    expect(states.join_first_crew).toBe(true);
    expect(states.attend_club_rhythm).toBe(false);
    expect(getAct2NextStep(world)).toMatchObject({ title: "Attend Run Crew Sunrise Loop" });

    world.runtimeEvents.attendedEventIds.push("berawa_run_crew_loop");
    bumpRelationshipAffinity(world, "npc", "ari", 4, "showed up for Act 2", 2);
    expect(getAct2NextStep(world)).toMatchObject({ title: "Talk to ari" });
    completeNextRelationshipArcBeat(world, "ari", 2);
    world.clock.day = 2;
    world.clock.minuteOfDay = 9 * 60;
    expect(getAct2PayoffOpportunityState(world)).toMatchObject({
      templateId: "run_crew_breakfast_shift",
      status: "eligible"
    });
    expect(getAct2NextStep(world)).toMatchObject({ title: "Find Run crew breakfast shift" });
    world.opportunities.completedTemplateIds.push("run_crew_breakfast_shift");
    states = Object.fromEntries(getAct2GoalStates(world).map((goal) => [goal.id, goal.complete]));
    expect(states).toEqual({
      join_first_crew: true,
      attend_club_rhythm: true,
      deepen_a_bond: true,
      open_better_door: true
    });
    expect(getAct2NextStep(world)).toMatchObject({ title: "Act 2 foundation complete", urgency: "complete" });
  });
});

describe("Act 3 readiness hooks", () => {
  it("stay derived from Act 2 trust, capital, and business-lead signals", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    expect(getAct3ReadinessGoalStates(world)).toEqual([]);
    expect(getAct3ReadinessNextStep(world)).toBeNull();

    world.life.actProgress.currentAct = 2;
    world.life.hustle.moveOutReady = true;
    let states = Object.fromEntries(getAct3ReadinessGoalStates(world).map((goal) => [goal.id, goal.complete]));
    expect(states).toEqual({
      social_rhythm: false,
      mentor_trust: false,
      crew_candidate: false,
      seed_capital: false,
      business_lead: false
    });
    expect(getAct3ReadinessNextStep(world)).toMatchObject({ title: "Crew rhythm" });

    world.life.joinedClubIds.push("berawa_run_crew");
    world.runtimeEvents.attendedEventIds.push("berawa_run_crew_loop");
    bumpRelationshipAffinity(world, "npc", "ari", 4, "showed up for Act 2", 2);
    completeNextRelationshipArcBeat(world, "ari", 2);
    world.opportunities.completedTemplateIds.push("run_crew_breakfast_shift");
    bumpRelationshipAffinity(world, "npc", "ibu_sari", 8, "mentor trust", 3);
    player.money = 1250;
    world.opportunities.completedTemplateIds.push("sari_warung_seed_errand");

    states = Object.fromEntries(getAct3ReadinessGoalStates(world).map((goal) => [goal.id, goal.complete]));
    expect(states).toEqual({
      social_rhythm: true,
      mentor_trust: true,
      crew_candidate: true,
      seed_capital: true,
      business_lead: true
    });
    expect(isAct3Ready(world)).toBe(true);
    expect(getAct3ReadinessNextStep(world)).toMatchObject({ title: "CEO unlock needed", urgency: "ceo" });
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

  it("tracks hidden rooted and relational axes without changing visible score", () => {
    const reputation = createDefaultReputationState(60);

    expect(reputation.rootedAxis).toBe(0);
    expect(reputation.relationalAxis).toBe(0);

    adjustReputationAxis(reputation, "rooted", 35, "helped the corner", 1);
    adjustReputationAxis(reputation, "relational", -125, "optimized over people", 2);
    adjustReputationAxis(reputation, "rooted", 90, "stayed with the place", 3);

    expect(reputation.rootedAxis).toBe(100);
    expect(reputation.relationalAxis).toBe(-100);
    expect(reputation.score).toBe(60);
    expect(reputation.history.slice(-3)).toEqual([
      { at: 1, change: "helped the corner", delta: 0 },
      { at: 2, change: "optimized over people", delta: 0 },
      { at: 3, change: "stayed with the place", delta: 0 }
    ]);
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

  it("prioritizes a venue-dwelling NPC over the shop menu while they roam near the venue", () => {
    const baked = shopDefinitions.baked_berawa;
    const controller = new InteractionController({
      getPlayerPosition: () => ({ x: baked.x, y: baked.y }),
      getNpcSprite: (npcId) => (npcId === "kadek" ? ({ x: baked.x + 145, y: baked.y } as never) : undefined),
      isPickupAvailable: () => false,
      getWantedOffenders: () => [],
      getOffenderReward: () => 0
    });

    expect(controller.getNearestInteraction()).toMatchObject({ type: "npc", id: "kadek" });
  });

  it("keeps shop menus reachable when no NPC is occupying the venue", () => {
    const station = shopDefinitions.canggu_station;
    const controller = new InteractionController({
      getPlayerPosition: () => ({ x: station.x, y: station.y }),
      getNpcSprite: () => undefined,
      isPickupAvailable: () => false,
      getWantedOffenders: () => [],
      getOffenderReward: () => 0
    });

    expect(controller.getNearestInteraction()).toMatchObject({ type: "shop", id: "canggu_station" });
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

  it("resolves Milk & Madu at its authored objective point instead of adjacent Milu by Nook", () => {
    const milkMadu = shopDefinitions.milk_madu_berawa;
    const milu = curatedVenueNodes.find((venue) => venue.venueId === "milu_by_nook");
    expect(milu).toBeDefined();
    expect(Math.hypot(milkMadu.x - milu!.x, milkMadu.y - milu!.y)).toBeGreaterThan(
      milkMadu.radius + milu!.radius
    );

    const controller = new InteractionController({
      getPlayerPosition: () => ({ x: milkMadu.x, y: milkMadu.y }),
      getNpcSprite: () => undefined,
      isPickupAvailable: () => false,
      getWantedOffenders: () => [],
      getOffenderReward: () => 0
    });

    expect(controller.getNearestInteraction()).toMatchObject({
      type: "shop",
      id: "milk_madu_berawa",
      label: "Enter Milk & Madu Berawa"
    });
  });

  it("prioritizes a foreground pickup over a closer broad venue zone", () => {
    const pickup = pickupDefinitions.find((candidate) => candidate.id === "coconut-jetty");
    const venue = curatedVenueNodes.find((candidate) => candidate.venueId === "berawa_beach");
    expect(pickup).toBeDefined();
    expect(venue).toBeDefined();
    const dx = venue!.x - pickup!.x;
    const dy = venue!.y - pickup!.y;
    const distance = Math.hypot(dx, dy);
    const player = {
      x: pickup!.x + (dx / distance) * 50,
      y: pickup!.y + (dy / distance) * 50
    };
    expect(Math.hypot(player.x - pickup!.x, player.y - pickup!.y)).toBeLessThan(64 * 1.6);
    expect(Math.hypot(player.x - venue!.x, player.y - venue!.y)).toBeLessThan(Math.hypot(player.x - pickup!.x, player.y - pickup!.y));

    const controller = new InteractionController({
      getPlayerPosition: () => player,
      getNpcSprite: () => undefined,
      isPickupAvailable: (candidate) => candidate.id === pickup!.id,
      getWantedOffenders: () => [],
      getOffenderReward: () => 0
    });

    expect(controller.getNearestInteraction()).toMatchObject({ type: "pickup", id: "coconut-jetty" });
  });

  it("prioritizes an active delivery pickup over an overlapping shop", () => {
    const baked = shopDefinitions.baked_berawa;
    const controller = new InteractionController({
      getPlayerPosition: () => ({ x: baked.x, y: baked.y }),
      getNpcSprite: () => undefined,
      isPickupAvailable: () => false,
      getWantedOffenders: () => [],
      getOffenderReward: () => 0,
      getDeliveryTargets: () => [
        {
          id: "first_baked_villa_delivery",
          label: "Pick up sealed pastries at BAKED.",
          x: baked.x,
          y: baked.y,
          radius: baked.radius
        }
      ]
    });

    expect(controller.getNearestInteraction()).toMatchObject({ type: "delivery", id: "first_baked_villa_delivery" });
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
