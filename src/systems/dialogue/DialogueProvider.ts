import { npcDefinitions } from "../../data/npcs";
import { getAffinityTier, type AffinityTier } from "../relationships/RelationshipMemory";
import type { RelationshipMemory } from "../../types";

export interface DialogueProvider {
  getLine(npcId: string, ctx: { memory?: RelationshipMemory; topic?: string }): Promise<string> | string;
}

const tieredNpcLines: Record<string, Partial<Record<AffinityTier, string>>> = {
  ibu_sari: {
    stranger: "Selamat datang. Berawa shelves empty faster when the FINNS shuttle crowd arrives.",
    acquaintance: "You know this corner now. Canggu Station gets easier when people show up on time.",
    friendly: "You move like someone who understands the Berawa grocery rush.",
    regular: "Good to see you again. I can trust you with the small errands before the crowd rolls in.",
    trusted: "You are one of the people I call when the shelf needs saving before traffic."
  },
  kadek: {
    stranger: "The shortcut says five minutes. Berawa traffic says good luck.",
    acquaintance: "You found the bakery route once. That already puts you ahead of half the scooters.",
    friendly: "Nice timing. I was hoping someone reliable would cut through before the lunch crowd.",
    regular: "There you are. When the lane gets messy, I know you will still make the run.",
    trusted: "If I hand you a route, I know it gets done without drama."
  },
  made: {
    stranger: "Cushions, sarongs, beach totes, and the calm side of Berawa shopping.",
    acquaintance: "You have a good eye for the quiet corners of the neighborhood.",
    friendly: "I remember your taste. Practical, but still Berawa enough to feel alive.",
    regular: "Come in. I saved the better colors from the morning rush.",
    trusted: "For you, I can tell the real stories behind the pieces, not only the price."
  },
  ari: {
    stranger: "The tide left coconuts, wax marks, and stories. Berawa provides.",
    acquaintance: "You are starting to read the beach rhythm. That matters here.",
    friendly: "Good to see you back. The best stories happen before the sun gets loud.",
    regular: "You know the tide path now. Walk with me and you will spot what tourists miss.",
    trusted: "When the beach is busy, I still trust you to notice the small things."
  }
};

export class ScriptedDialogueProvider implements DialogueProvider {
  getLine(npcId: string, ctx: { memory?: RelationshipMemory; topic?: string }): string {
    const npc = npcDefinitions[npcId];
    if (!npc) {
      return "The neighborhood hums around you.";
    }
    const tier = getAffinityTier(ctx.memory);
    const line = tieredNpcLines[npcId]?.[tier] ?? npc.defaultLine;
    return `${line}${memoryReference(ctx.memory)}`;
  }
}

export class AIDialogueProvider implements DialogueProvider {
  getLine(): string {
    throw new Error("AIDialogueProvider is not implemented in this local vertical slice.");
  }
}

function memoryReference(memory: RelationshipMemory | undefined): string {
  if (!memory || memory.memories.length === 0) {
    return "";
  }

  const recentMemories = [...memory.memories].reverse();
  const completedQuest = recentMemories.find((event) => event.type === "completed_quest");
  if (completedQuest) {
    return ` I remember you helping with ${completedQuest.detail ?? "that errand"}.`;
  }

  const helped = recentMemories.find((event) => event.type === "helped");
  if (helped) {
    return ` That help still counts around here${helped.detail ? `: ${helped.detail}` : ""}.`;
  }

  const boughtItem = recentMemories.find((event) => event.type === "bought_item");
  if (boughtItem) {
    return ` I noticed what you picked up${boughtItem.detail ? `: ${boughtItem.detail}` : ""}.`;
  }

  const visits = memory.memories.filter((event) => event.type === "visited").length;
  if (visits >= 3) {
    return " You have been around enough that people are starting to place your face.";
  }

  return "";
}
