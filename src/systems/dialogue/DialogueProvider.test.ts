import { describe, expect, it } from "vitest";
import type { RelationshipMemory } from "../../types";
import { AIDialogueProvider, ScriptedDialogueProvider } from "./DialogueProvider";

describe("DialogueProvider", () => {
  it("falls back gracefully for unknown NPCs", () => {
    const provider = new ScriptedDialogueProvider();

    expect(provider.getLine("missing_npc", {})).toBe("The neighborhood hums around you.");
  });

  it("selects tiered scripted lines from relationship affinity", () => {
    const provider = new ScriptedDialogueProvider();

    expect(provider.getLine("kadek", { memory: memoryFor("npc", "kadek", 0) })).toContain("The shortcut says five minutes.");
    expect(provider.getLine("kadek", { memory: memoryFor("npc", "kadek", 30) })).toContain("If I hand you a route");
  });

  it("references relevant memories without calling AI", () => {
    const provider = new ScriptedDialogueProvider();

    expect(
      provider.getLine("ibu_sari", {
        memory: memoryFor("npc", "ibu_sari", 8, [{ type: "completed_quest", at: 1, detail: "Canggu Station Restock" }])
      })
    ).toContain("I remember you helping with Canggu Station Restock.");

    expect(
      provider.getLine("made", {
        memory: memoryFor("npc", "made", 4, [{ type: "bought_item", at: 2, detail: "Woven Sarong" }])
      })
    ).toContain("I noticed what you picked up: Woven Sarong.");

    expect(
      provider.getLine("ari", {
        memory: memoryFor("npc", "ari", 6, [
          { type: "visited", at: 1 },
          { type: "visited", at: 2 },
          { type: "visited", at: 3 }
        ])
      })
    ).toContain("people are starting to place your face.");
  });

  it("keeps the AI dialogue provider as a non-functional local stub", () => {
    const provider = new AIDialogueProvider();

    expect(() => provider.getLine()).toThrow("AIDialogueProvider is not implemented in this local vertical slice.");
  });
});

function memoryFor(
  subjectType: RelationshipMemory["subjectType"],
  subjectId: string,
  affinity: number,
  memories: RelationshipMemory["memories"] = []
): RelationshipMemory {
  return {
    subjectType,
    subjectId,
    affinity,
    lastInteractionAt: memories.at(-1)?.at ?? 0,
    memories
  };
}
