import { addItem } from "../Inventory";
import { adjustPlayerMeters } from "../meters/PlayerMeters";
import { bumpRelationshipAffinity } from "../relationships/RelationshipMemory";
import { advanceWorldMinutes } from "../time/DailyClock";
import { getStructuralEventMeterState } from "../story/Act2StructuralUnlocks";
import type { GameEvent, Meter, WorldState } from "../../types";

export interface EventParticipationResult {
  ok: boolean;
  message: string;
  moneyDelta: number;
  completedAt: number;
  meterDeltas: Partial<Record<Meter, number>>;
  benefitMessage?: string;
}

export function applyEventParticipation(world: WorldState, event: GameEvent, startedAt: number): EventParticipationResult {
  const player = world.players[world.localPlayerId];
  const cost = event.participation.cost ?? 0;
  if (cost > 0 && player.money < cost) {
    return {
      ok: false,
      message: `Need Rp ${cost} for ${event.title}.`,
      moneyDelta: 0,
      completedAt: startedAt,
      meterDeltas: {}
    };
  }

  const moneyDelta = -cost;
  player.money += moneyDelta;
  const structuralMeters = getStructuralEventMeterState(world, event);
  adjustPlayerMeters(world, structuralMeters.meterDeltas);
  advanceWorldMinutes(world, event.participation.timeCost);
  const completedAt = startedAt + event.participation.timeCost;

  for (const itemId of event.participation.itemIds ?? []) {
    addItem(player, itemId, 1);
  }

  const npcAffinity = new Map<string, number>();
  for (const npcId of event.participation.meetNpcs ?? []) {
    npcAffinity.set(npcId, (npcAffinity.get(npcId) ?? 0) + 1);
  }
  for (const bump of event.participation.affinityBumps ?? []) {
    npcAffinity.set(bump.npcId, (npcAffinity.get(bump.npcId) ?? 0) + bump.amount);
  }
  for (const [npcId, amount] of npcAffinity) {
    bumpRelationshipAffinity(world, "npc", npcId, amount, `Attended ${event.title}`, completedAt);
  }

  return {
    ok: true,
    message: `Joined ${event.title}.`,
    moneyDelta,
    completedAt,
    meterDeltas: structuralMeters.meterDeltas,
    benefitMessage: structuralMeters.benefitMessage
  };
}
