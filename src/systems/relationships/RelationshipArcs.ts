import { relationshipArcDefinitions } from "../../data/relationshipArcs";
import { joinSocialGroup } from "../groups/GroupRegistry";
import { getRelationship } from "./RelationshipMemory";
import type { RelationshipArcBeat, RelationshipArcDefinition, WorldState } from "../../types";

export interface RelationshipArcBeatState {
  arc: RelationshipArcDefinition;
  beat: RelationshipArcBeat;
  complete: boolean;
  available: boolean;
  blockedReason: string | null;
}

export interface CompletedRelationshipArcBeat {
  arc: RelationshipArcDefinition;
  beat: RelationshipArcBeat;
  payoffMessage: string;
}

export function getRelationshipArcsForNpc(npcId: string): RelationshipArcDefinition[] {
  return relationshipArcDefinitions.filter((arc) => arc.npcId === npcId);
}

export function getRelationshipArcStates(world: WorldState): RelationshipArcBeatState[] {
  return relationshipArcDefinitions.flatMap((arc) => getRelationshipArcStatesForNpc(world, arc.npcId));
}

export function getRelationshipArcStatesForNpc(world: WorldState, npcId: string): RelationshipArcBeatState[] {
  return getRelationshipArcsForNpc(npcId).flatMap((arc) => {
    const progress = world.life.relationshipArcProgress[arc.id]?.completedBeatIds ?? [];
    return arc.beats.map((beat, index) => {
      const complete = progress.includes(beat.id);
      const priorComplete = index === 0 || progress.includes(arc.beats[index - 1].id);
      const blockedReason = complete ? null : requirementBlocker(world, arc, beat, priorComplete);
      return {
        arc,
        beat,
        complete,
        available: !complete && blockedReason === null,
        blockedReason
      };
    });
  });
}

export function completeNextRelationshipArcBeat(world: WorldState, npcId: string, at: number): CompletedRelationshipArcBeat | null {
  for (const arc of getRelationshipArcsForNpc(npcId)) {
    const progress = world.life.relationshipArcProgress[arc.id] ?? { completedBeatIds: [], lastAdvancedAt: 0 };
    const nextBeat = arc.beats.find((beat, index) => {
      const priorComplete = index === 0 || progress.completedBeatIds.includes(arc.beats[index - 1].id);
      return !progress.completedBeatIds.includes(beat.id) && requirementBlocker(world, arc, beat, priorComplete) === null;
    });
    if (!nextBeat) {
      continue;
    }

    progress.completedBeatIds.push(nextBeat.id);
    progress.lastAdvancedAt = at;
    world.life.relationshipArcProgress[arc.id] = progress;

    let payoffMessage = nextBeat.payoff.text;
    if (nextBeat.payoff.kind === "club_invite" && nextBeat.payoff.groupId) {
      payoffMessage = joinSocialGroup(world, nextBeat.payoff.groupId, at).message;
    }
    return { arc, beat: nextBeat, payoffMessage };
  }
  return null;
}

function requirementBlocker(
  world: WorldState,
  arc: RelationshipArcDefinition,
  beat: RelationshipArcBeat,
  priorComplete: boolean
): string | null {
  if (!priorComplete) {
    return "previous beat incomplete";
  }
  const relationship = getRelationship(world, "npc", arc.npcId);
  if ((relationship?.affinity ?? 0) < beat.minAffinity) {
    return `needs affinity ${beat.minAffinity}`;
  }
  const missingEvent = beat.requiresEventIds?.find((eventId) => !world.runtimeEvents.attendedEventIds.includes(eventId));
  if (missingEvent) {
    return `attend ${missingEvent}`;
  }
  const missingClub = beat.requiresJoinedClubIds?.find((groupId) => !world.life.joinedClubIds.includes(groupId));
  if (missingClub) {
    return `join ${missingClub}`;
  }
  const player = world.players[world.localPlayerId];
  const missingQuest = beat.requiresCompletedQuestIds?.find((questId) => !player.completedQuestIds.includes(questId));
  if (missingQuest) {
    return `complete ${missingQuest}`;
  }
  return null;
}
