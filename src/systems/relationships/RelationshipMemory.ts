import type { MemoryType, RelationshipMemory, WorldState } from "../../types";

export type AffinityTier = "stranger" | "acquaintance" | "friendly" | "regular" | "trusted";

export function getRelationship(
  world: WorldState,
  subjectType: "npc" | "venue",
  subjectId: string
): RelationshipMemory | undefined {
  return world.relationships.find((memory) => memory.subjectType === subjectType && memory.subjectId === subjectId);
}

export function recordRelationshipMemory(
  world: WorldState,
  subjectType: "npc" | "venue",
  subjectId: string,
  memory: MemoryType,
  detail: string | undefined,
  at: number
): RelationshipMemory {
  let relationship = getRelationship(world, subjectType, subjectId);
  if (!relationship) {
    relationship = {
      subjectType,
      subjectId,
      affinity: 0,
      lastInteractionAt: at,
      memories: []
    };
    world.relationships.push(relationship);
  }

  relationship.memories.push({ type: memory, at, detail });
  relationship.lastInteractionAt = at;
  relationship.affinity += affinityForMemory(memory);
  return relationship;
}

export function bumpRelationshipAffinity(
  world: WorldState,
  subjectType: "npc" | "venue",
  subjectId: string,
  affinityBump: number,
  detail: string | undefined,
  at: number
): RelationshipMemory {
  let relationship = getRelationship(world, subjectType, subjectId);
  if (!relationship) {
    relationship = {
      subjectType,
      subjectId,
      affinity: 0,
      lastInteractionAt: at,
      memories: []
    };
    world.relationships.push(relationship);
  }

  relationship.memories.push({ type: "visited", at, detail });
  relationship.lastInteractionAt = at;
  relationship.affinity += affinityBump;
  return relationship;
}

export function getAffinityTier(memory: RelationshipMemory | undefined): AffinityTier {
  if (!memory) {
    return "stranger";
  }

  let tier: AffinityTier = "stranger";
  if (memory.affinity >= 30) {
    tier = "trusted";
  } else if (memory.affinity >= 18) {
    tier = "regular";
  } else if (memory.affinity >= 8) {
    tier = "friendly";
  } else if (memory.affinity > 0) {
    tier = "acquaintance";
  }

  const completedQuest = memory.memories.some((event) => event.type === "completed_quest" || event.type === "helped");
  if (completedQuest && (tier === "stranger" || tier === "acquaintance")) {
    return "friendly";
  }
  if (memory.memories.length >= 6 && tier !== "trusted") {
    return "regular";
  }
  return tier;
}

export function summarizeRelationshipMemories(memory: RelationshipMemory | undefined, limit = 3): string[] {
  if (!memory) {
    return [];
  }
  return memory.memories
    .slice(-limit)
    .reverse()
    .map((event) => `${event.type.replace(/_/g, " ")}${event.detail ? `: ${event.detail}` : ""}`);
}

export function getAffinityPerk(memory: RelationshipMemory | undefined): string {
  const tier = getAffinityTier(memory);
  if (tier === "trusted") {
    return "trusted invite hook unlocked";
  }
  if (tier === "regular") {
    return "regular recognition and future discount hook";
  }
  if (tier === "friendly") {
    return "warmer dialogue unlocked";
  }
  if (tier === "acquaintance") {
    return "recognized on repeat visits";
  }
  return "none yet";
}

function affinityForMemory(memory: MemoryType): number {
  if (memory === "completed_quest" || memory === "helped") {
    return 8;
  }
  if (memory === "bought_item" || memory === "attended_event") {
    return 4;
  }
  if (memory === "visited") {
    return 2;
  }
  return -1;
}
