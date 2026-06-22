import { describe, expect, it } from "vitest";
import { createInitialWorldState } from "../WorldState";
import {
  getAffinityTier,
  getRelationship,
  recordRelationshipMemory,
  summarizeRelationshipMemories
} from "./RelationshipMemory";

describe("RelationshipMemory", () => {
  it("creates relationship records and accumulates affinity by memory type", () => {
    const world = createInitialWorldState();

    expect(getRelationship(world, "npc", "made")).toBeUndefined();
    expect(getAffinityTier(undefined)).toBe("stranger");

    recordRelationshipMemory(world, "npc", "made", "visited", "Stopped by for coffee", 10);
    recordRelationshipMemory(world, "npc", "made", "bought_item", "Bought kopi Bali", 11);
    recordRelationshipMemory(world, "npc", "made", "attended_event", "Cafe rush", 12);

    const memory = getRelationship(world, "npc", "made");
    expect(memory).toMatchObject({
      subjectType: "npc",
      subjectId: "made",
      affinity: 10,
      lastInteractionAt: 12
    });
    expect(getAffinityTier(memory)).toBe("friendly");
  });

  it("derives regular and trusted tiers from repeated memories and high affinity", () => {
    const world = createInitialWorldState();

    for (let index = 0; index < 6; index += 1) {
      recordRelationshipMemory(world, "venue", "satu_satu_coffee", "visited", `Visit ${index + 1}`, 100 + index);
    }
    expect(getAffinityTier(getRelationship(world, "venue", "satu_satu_coffee"))).toBe("regular");

    for (let index = 0; index < 4; index += 1) {
      recordRelationshipMemory(world, "npc", "ari", "helped", `Help ${index + 1}`, 200 + index);
    }
    expect(getRelationship(world, "npc", "ari")?.affinity).toBe(32);
    expect(getAffinityTier(getRelationship(world, "npc", "ari"))).toBe("trusted");
  });

  it("summarizes recent memories newest-first with readable labels", () => {
    const world = createInitialWorldState();
    recordRelationshipMemory(world, "npc", "ibu_sari", "visited", "Said hello", 1);
    recordRelationshipMemory(world, "npc", "ibu_sari", "completed_quest", "Canggu Station Restock", 2);
    recordRelationshipMemory(world, "npc", "ibu_sari", "missed_opportunity", undefined, 3);

    expect(summarizeRelationshipMemories(getRelationship(world, "npc", "ibu_sari"), 2)).toEqual([
      "missed opportunity",
      "completed quest: Canggu Station Restock"
    ]);
  });
});
