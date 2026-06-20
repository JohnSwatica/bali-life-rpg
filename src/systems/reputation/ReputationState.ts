import type { ReputationState, ReputationTag, TrustFlag } from "../../types";

export function createDefaultReputationState(score = 60): ReputationState {
  return {
    score,
    wantedLevel: 0,
    bounty: 0,
    flaggedByVictims: 0,
    tags: [],
    hiddenFlags: [],
    redemption: {
      active: false,
      challengeId: null
    },
    history: []
  };
}

export function adjustReputation(reputation: ReputationState, delta: number, reason: string, at: number): void {
  reputation.score = Math.max(-100, Math.min(100, reputation.score + delta));
  reputation.history.push({ at, change: reason, delta });
}

export function getReputationScore(reputation: ReputationState): number {
  return reputation.score;
}

export function getWantedLevel(reputation: ReputationState): number {
  return reputation.wantedLevel;
}

export function getBounty(reputation: ReputationState): number {
  return reputation.bounty;
}

export function getFlaggedByVictims(reputation: ReputationState): number {
  return reputation.flaggedByVictims;
}

export function getLastFlagReason(reputation: ReputationState): string | undefined {
  return reputation.lastFlagReason;
}

export function recordRecklessDamageFlag(
  reputation: ReputationState,
  victimName: string,
  at: number,
  limits: {
    maxWantedLevel: number;
    maxBounty: number;
    firstFlagBounty: number;
    repeatFlagBounty: number;
  }
): { wantedLevel: number; bounty: number; bountyIncrease: number; flaggedByVictims: number } {
  reputation.flaggedByVictims += 1;
  reputation.wantedLevel = Math.min(limits.maxWantedLevel, reputation.wantedLevel + 1);
  const bountyIncrease = reputation.flaggedByVictims === 1 ? limits.firstFlagBounty : limits.repeatFlagBounty;
  reputation.bounty = Math.min(limits.maxBounty, reputation.bounty + bountyIncrease);
  reputation.lastFlagReason = `Bike hit reported by ${victimName}`;
  reputation.history.push({
    at,
    change: `Flagged by ${victimName} for reckless riding`,
    delta: 0
  });
  return {
    wantedLevel: reputation.wantedLevel,
    bounty: reputation.bounty,
    bountyIncrease,
    flaggedByVictims: reputation.flaggedByVictims
  };
}

export function reduceWantedStanding(
  reputation: ReputationState,
  wantedReduction: number,
  bountyReduction: number,
  reason: string,
  at: number
): void {
  const previousWanted = reputation.wantedLevel;
  const previousBounty = reputation.bounty;
  reputation.wantedLevel = Math.max(0, reputation.wantedLevel - wantedReduction);
  reputation.bounty = Math.max(0, reputation.bounty - bountyReduction);
  if (reputation.wantedLevel === 0 || reputation.bounty === 0) {
    reputation.wantedLevel = 0;
    reputation.bounty = 0;
    reputation.lastFlagReason = undefined;
  }
  if (previousWanted !== reputation.wantedLevel || previousBounty !== reputation.bounty) {
    reputation.history.push({ at, change: reason, delta: 0 });
  }
}

export function clearWantedStanding(reputation: ReputationState, reason: string, at: number): void {
  if (reputation.wantedLevel === 0 && reputation.bounty === 0 && reputation.flaggedByVictims === 0) {
    return;
  }
  reputation.wantedLevel = 0;
  reputation.bounty = 0;
  reputation.flaggedByVictims = 0;
  reputation.lastFlagReason = undefined;
  reputation.history.push({ at, change: reason, delta: 0 });
}

export function awardReputationTag(reputation: ReputationState, tag: ReputationTag, reason: string, at: number): void {
  if (!reputation.tags.includes(tag)) {
    reputation.tags.push(tag);
  }
  reputation.history.push({ at, change: reason });
}

export function addHiddenTrustFlag(
  reputation: ReputationState,
  flag: Omit<TrustFlag, "createdAt">,
  at: number
): void {
  reputation.hiddenFlags.push({ ...flag, createdAt: at });
}
