import type { MemoryType, RelationshipMemory, WorldState } from "../../types";

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
