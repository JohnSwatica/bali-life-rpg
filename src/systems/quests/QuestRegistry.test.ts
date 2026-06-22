import { describe, expect, it } from "vitest";
import { questDefinitions } from "../../data/quests";
import { addItem, getQuantity } from "../Inventory";
import { completeQuest } from "../QuestSystem";
import { createInitialWorldState } from "../WorldState";
import { IntentDispatcher } from "../intents/IntentDispatcher";
import { getRelationship } from "../relationships/RelationshipMemory";
import { getQuestObjectives, resolveNpcQuestInteraction } from "./QuestRegistry";

describe("QuestRegistry starter quests", () => {
  it("exposes data-driven deliver objectives for both starter quests", () => {
    expect(getQuestObjectives("canggu_station_restock")).toEqual([
      { type: "deliver", itemId: "coconut", quantity: 2 }
    ]);
    expect(getQuestObjectives("berawa_bakery_run")).toEqual([
      { type: "deliver", itemId: "butter_croissant", quantity: 1 }
    ]);
  });

  it("completes Ibu Sari's restock quest and returns reputation/relationship intents", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    const dispatcher = new IntentDispatcher();

    const start = resolveNpcQuestInteraction(player, "ibu_sari");
    expect(start).toMatchObject({ handled: true, shouldSave: true, intents: [] });
    expect(player.activeQuestIds).toEqual(["canggu_station_restock"]);

    const progress = resolveNpcQuestInteraction(player, "ibu_sari");
    expect(progress).toMatchObject({ handled: true, shouldSave: false, intents: [] });
    expect(player.completedQuestIds).toEqual([]);

    addItem(player, "coconut", 1);
    const moneyBefore = player.money;
    const turnIn = resolveNpcQuestInteraction(player, "ibu_sari");
    expect(turnIn?.handled).toBe(true);
    expect(turnIn?.shouldSave).toBe(true);
    expect(player.activeQuestIds).toEqual([]);
    expect(player.completedQuestIds).toEqual(["canggu_station_restock"]);
    expect(player.money).toBe(moneyBefore + questDefinitions.canggu_station_restock.rewardMoney);
    expect(getQuantity(player, "coconut")).toBe(0);
    expect(getQuantity(player, "kopi_bali")).toBe(1);

    for (const intent of turnIn?.intents ?? []) {
      dispatcher.dispatch(intent, world, 1440);
    }

    expect(world.reputation.score).toBe(66);
    expect(world.reputation.tags).toContain("helpful");
    expect(getRelationship(world, "npc", "ibu_sari")).toMatchObject({
      affinity: 8,
      memories: [{ type: "completed_quest", at: 1440, detail: "Canggu Station Restock" }]
    });
  });

  it("completes Kadek's bakery run without corrupting state on repeat completion", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    const dispatcher = new IntentDispatcher();

    const start = resolveNpcQuestInteraction(player, "kadek");
    expect(start).toMatchObject({ handled: true, shouldSave: true });
    expect(player.activeQuestIds).toEqual(["berawa_bakery_run"]);

    const progress = resolveNpcQuestInteraction(player, "kadek");
    expect(progress).toMatchObject({ handled: true, shouldSave: false, intents: [] });
    expect(player.completedQuestIds).toEqual([]);

    addItem(player, "butter_croissant", 1);
    const moneyBefore = player.money;
    const turnIn = resolveNpcQuestInteraction(player, "kadek");
    expect(turnIn?.handled).toBe(true);
    expect(player.activeQuestIds).toEqual([]);
    expect(player.completedQuestIds).toEqual(["berawa_bakery_run"]);
    expect(player.money).toBe(moneyBefore + questDefinitions.berawa_bakery_run.rewardMoney);
    expect(getQuantity(player, "butter_croissant")).toBe(0);
    expect(getQuantity(player, "surf_sticker")).toBe(2);

    for (const intent of turnIn?.intents ?? []) {
      dispatcher.dispatch(intent, world, 2880);
    }

    expect(world.reputation.score).toBe(65);
    expect(world.reputation.tags).toContain("reliable");
    expect(getRelationship(world, "npc", "kadek")).toMatchObject({
      affinity: 8,
      memories: [{ type: "completed_quest", at: 2880, detail: "Berawa Bakery Run" }]
    });

    const snapshot = {
      money: player.money,
      inventory: structuredClone(player.inventory),
      activeQuestIds: [...player.activeQuestIds],
      completedQuestIds: [...player.completedQuestIds]
    };
    const repeat = resolveNpcQuestInteraction(player, "kadek");
    expect(repeat).toMatchObject({ handled: true, shouldSave: false, intents: [] });
    expect({
      money: player.money,
      inventory: player.inventory,
      activeQuestIds: player.activeQuestIds,
      completedQuestIds: player.completedQuestIds
    }).toEqual(snapshot);
  });

  it("does not duplicate rewards when completeQuest is called twice", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    player.activeQuestIds.push("berawa_bakery_run");

    const first = completeQuest(player, "berawa_bakery_run");
    const afterFirst = {
      money: player.money,
      inventory: structuredClone(player.inventory),
      activeQuestIds: [...player.activeQuestIds],
      completedQuestIds: [...player.completedQuestIds]
    };
    const second = completeQuest(player, "berawa_bakery_run");

    expect(first).toBe(questDefinitions.berawa_bakery_run);
    expect(second).toBe(questDefinitions.berawa_bakery_run);
    expect({
      money: player.money,
      inventory: player.inventory,
      activeQuestIds: player.activeQuestIds,
      completedQuestIds: player.completedQuestIds
    }).toEqual(afterFirst);
  });
});

describe.skip("QuestRegistry generic objective handlers", () => {
  it("covers collect, visit, buy, and talk when those handlers are exported behind a testable public seam", () => {
    // The current public registry only exposes the authored starter quest flows, both of which use deliver objectives.
    // Exporting private handlers would change the runtime module surface during this hardening pass, so this stays skipped.
  });
});
