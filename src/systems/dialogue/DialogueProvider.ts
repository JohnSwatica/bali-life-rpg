import { npcDefinitions } from "../../data/npcs";
import type { RelationshipMemory } from "../../types";

export interface DialogueProvider {
  getLine(npcId: string, ctx: { memory?: RelationshipMemory; topic?: string }): Promise<string> | string;
}

export class ScriptedDialogueProvider implements DialogueProvider {
  getLine(npcId: string, ctx: { memory?: RelationshipMemory; topic?: string }): string {
    const npc = npcDefinitions[npcId];
    if (!npc) {
      return "The neighborhood hums around you.";
    }
    const memoryHint = ctx.memory && ctx.memory.affinity > 10 ? " They recognize you from earlier help." : "";
    return `${npc.defaultLine}${memoryHint}`;
  }
}

export class AIDialogueProvider implements DialogueProvider {
  getLine(): string {
    throw new Error("AIDialogueProvider is not implemented in this local vertical slice.");
  }
}
