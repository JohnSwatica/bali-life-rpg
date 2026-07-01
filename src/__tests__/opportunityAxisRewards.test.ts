import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialWorldState } from "../systems/WorldState";
import type { OpportunityTemplate } from "../types";

const axisTemplate: OpportunityTemplate = {
  id: "test_axis_choice",
  type: "gig",
  title: "Test Axis Choice",
  blurb: "A test-only moral choice.",
  trigger: {},
  locationVenueId: "canggu_station",
  durationMin: 30,
  timeCostMin: 15,
  reward: {
    money: 10,
    axisImpact: { rooted: -15, relational: -5, reason: "Accepted the test shortcut" }
  },
  declineReward: {
    axisImpact: { rooted: 10, relational: 4, reason: "Declined the test shortcut" }
  }
};

const noDeclineTemplate: OpportunityTemplate = {
  id: "test_no_decline_reward",
  type: "gig",
  title: "Test No Decline Reward",
  blurb: "A test-only ordinary opportunity.",
  trigger: {},
  locationVenueId: "canggu_station",
  durationMin: 30,
  timeCostMin: 15,
  reward: { money: 10 }
};

describe("opportunity axis and decline rewards", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("../data/opportunities", () => ({
      opportunityTemplates: [axisTemplate, noDeclineTemplate]
    }));
  });

  it("applies axis impact on accept and decline reward on expiry", async () => {
    const {
      acceptOpportunity,
      createDefaultOpportunityState,
      expireOpportunities,
      getAbsoluteMinute,
      resolveOpportunity,
      spawnOpportunity
    } = await import("../systems/opportunities/OpportunityEngine");

    const acceptedWorld = createInitialWorldState();
    const acceptedState = createDefaultOpportunityState();
    const acceptedLive = spawnOpportunity(acceptedState, axisTemplate, getAbsoluteMinute(acceptedWorld.clock));

    expect(acceptOpportunity(acceptedState, acceptedLive.id, getAbsoluteMinute(acceptedWorld.clock)).ok).toBe(true);
    expect(resolveOpportunity(acceptedState, acceptedWorld, acceptedLive.id).ok).toBe(true);
    expireOpportunities(acceptedState, acceptedWorld, acceptedLive.expiresAt);
    expect(acceptedWorld.reputation.rootedAxis).toBe(-15);
    expect(acceptedWorld.reputation.relationalAxis).toBe(-5);
    expect(acceptedWorld.reputation.score).toBe(60);

    const declinedWorld = createInitialWorldState();
    const declinedState = createDefaultOpportunityState();
    const declinedLive = spawnOpportunity(declinedState, axisTemplate, getAbsoluteMinute(declinedWorld.clock));

    expireOpportunities(declinedState, declinedWorld, declinedLive.expiresAt);
    expect(declinedWorld.reputation.rootedAxis).toBe(10);
    expect(declinedWorld.reputation.relationalAxis).toBe(4);
    expect(declinedWorld.reputation.score).toBe(60);
    expect(declinedState.missedTemplateIds).toContain("test_axis_choice");
  });

  it("expires templates without decline rewards without changing world state", async () => {
    const { createDefaultOpportunityState, expireOpportunities, getAbsoluteMinute, spawnOpportunity } = await import(
      "../systems/opportunities/OpportunityEngine"
    );
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();
    const startMoney = world.players[world.localPlayerId].money;
    const startMinute = world.clock.minuteOfDay;
    const live = spawnOpportunity(state, noDeclineTemplate, getAbsoluteMinute(world.clock));

    expireOpportunities(state, world, live.expiresAt);

    expect(world.players[world.localPlayerId].money).toBe(startMoney);
    expect(world.clock.minuteOfDay).toBe(startMinute);
    expect(world.reputation.rootedAxis).toBe(0);
    expect(world.reputation.relationalAxis).toBe(0);
    expect(state.missedTemplateIds).toContain("test_no_decline_reward");
  });
});
