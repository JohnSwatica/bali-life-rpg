import { describe, expect, it } from "vitest";
import { createInitialWorldState } from "../systems/WorldState";
import { applyPlayerBikeHitConsequence } from "../systems/reputation/RecklessRiding";
import { getBounty, getReputationScore, getWantedLevel } from "../systems/reputation/ReputationState";

const limits = {
  maxWantedLevel: 3,
  maxBounty: 120,
  firstFlagBounty: 20,
  repeatFlagBounty: 35
};

describe("reckless riding pedestrian bumps", () => {
  it("does not create wanted, bounty, or reputation damage during Acts 0-1", () => {
    const world = createInitialWorldState();
    world.life.actProgress.currentAct = 1;
    const reputationBefore = getReputationScore(world.reputation);

    const result = applyPlayerBikeHitConsequence(world, "Ari", 8 * 60, limits);

    expect(result).toMatchObject({ flagged: false, wantedLevel: 0, bounty: 0 });
    expect(getWantedLevel(world.reputation)).toBe(0);
    expect(getBounty(world.reputation)).toBe(0);
    expect(getReputationScore(world.reputation)).toBe(reputationBefore);
    expect(world.reputation.history).toEqual([]);
  });

  it("keeps the existing permanent flagging path from Act 2 onward", () => {
    const world = createInitialWorldState();
    world.life.actProgress.currentAct = 2;
    const reputationBefore = getReputationScore(world.reputation);

    const result = applyPlayerBikeHitConsequence(world, "Ari", 2 * 1440 + 8 * 60, limits);

    expect(result).toMatchObject({ flagged: true, wantedLevel: 1, bounty: 20 });
    expect(getWantedLevel(world.reputation)).toBe(1);
    expect(getBounty(world.reputation)).toBe(20);
    expect(getReputationScore(world.reputation)).toBe(reputationBefore - 8);
    expect(world.reputation.history.map((event) => event.change)).toContain("Flagged by Ari for reckless riding");
  });
});
