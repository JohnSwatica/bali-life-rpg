import { adjustPlayerMeters } from "../meters/PlayerMeters";
import { adjustReputation, recordRecklessDamageFlag } from "./ReputationState";
import type { WorldState } from "../../types";

export interface RecklessBikeHitLimits {
  maxWantedLevel: number;
  maxBounty: number;
  firstFlagBounty: number;
  repeatFlagBounty: number;
}

export interface RecklessBikeHitResult {
  flagged: boolean;
  toast: string;
  wantedLevel: number;
  bounty: number;
}

export function applyPlayerBikeHitConsequence(
  world: WorldState,
  victimName: string,
  at: number,
  limits: RecklessBikeHitLimits
): RecklessBikeHitResult {
  if (world.life.actProgress.currentAct <= 1) {
    return {
      flagged: false,
      toast: "Aduh — sorry! You wobble past.",
      wantedLevel: world.reputation.wantedLevel,
      bounty: world.reputation.bounty
    };
  }

  const standing = recordRecklessDamageFlag(world.reputation, victimName, at, limits);
  adjustReputation(world.reputation, -8, `Flagged by ${victimName} for reckless riding`, at);
  adjustPlayerMeters(world, { focus: -6 });
  return {
    flagged: true,
    toast: `${victimName} flagged you for reckless bike damage. Wanted level ${standing.wantedLevel}.`,
    wantedLevel: standing.wantedLevel,
    bounty: standing.bounty
  };
}
