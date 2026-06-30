import type { RelationshipMemory } from "../../types";
import { getAffinityTier, type AffinityTier } from "../relationships/RelationshipMemory";

export interface NpcProximityReaction {
  active: boolean;
  tier: AffinityTier;
  cue: string;
  pauseMs: number;
  cooldownMs: number;
}

const REACTION_BY_TIER: Record<AffinityTier, Omit<NpcProximityReaction, "active" | "tier">> = {
  stranger: {
    cue: "glances",
    pauseMs: 0,
    cooldownMs: 3200
  },
  acquaintance: {
    cue: "nods",
    pauseMs: 0,
    cooldownMs: 3200
  },
  friendly: {
    cue: "smiles",
    pauseMs: 650,
    cooldownMs: 3600
  },
  regular: {
    cue: "waves",
    pauseMs: 900,
    cooldownMs: 3900
  },
  trusted: {
    cue: "brightens",
    pauseMs: 1150,
    cooldownMs: 4200
  }
};

export function getNpcProximityReaction(
  memory: RelationshipMemory | undefined,
  distancePx: number,
  nearRadiusPx: number
): NpcProximityReaction {
  const tier = getAffinityTier(memory);
  const reaction = REACTION_BY_TIER[tier];
  return {
    active: distancePx <= nearRadiusPx,
    tier,
    ...reaction
  };
}
