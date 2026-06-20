import type { ReputationState, ReputationTag, TrustFlag } from "../../types";

export function createDefaultReputationState(score = 60): ReputationState {
  return {
    score,
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
