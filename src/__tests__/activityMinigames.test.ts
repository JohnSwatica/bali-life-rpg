import { describe, expect, it } from "vitest";
import { opportunityTemplates } from "../data/opportunities";
import { applyActivity, getVenueActivityContext } from "../systems/life/ActivityEngine";
import {
  createActiveMinigame,
  getActivityMinigameDefinition,
  getOpportunityMinigameDefinition,
  resolvePerformanceScore,
  rewardMultiplier,
  scoreChoice,
  scoreTimingAttempt
} from "../systems/minigames/ActivityMinigames";
import { createDefaultOpportunityState, getAbsoluteMinute, resolveOpportunity, spawnOpportunity } from "../systems/opportunities/OpportunityEngine";
import { createInitialWorldState } from "../systems/WorldState";

describe("activity minigames", () => {
  it("scores timing attempts and resolves a default score when skipped", () => {
    const definition = getActivityMinigameDefinition("remote_work_session");
    const active = createActiveMinigame(definition);

    expect(active).toBeDefined();
    expect(scoreTimingAttempt(0.5, active!.targetStart, active!.targetEnd)).toBe(1);
    expect(scoreTimingAttempt(0.05, active!.targetStart, active!.targetEnd)).toBeLessThan(0.5);
    expect(resolvePerformanceScore(active)).toBeCloseTo(0.68);
  });

  it("scores choice minigames from authored choices", () => {
    const definition = getActivityMinigameDefinition("relax_hangout");
    const active = createActiveMinigame(definition);
    const best = scoreChoice(active?.choices, "listen");
    const weak = scoreChoice(active?.choices, "drift");

    expect(best?.score).toBe(1);
    expect(weak?.score).toBeLessThan(best!.score);
    expect(getOpportunityMinigameDefinition("social")?.kind).toBe("choice");
  });

  it("provides station-specific minigames for the main gameplay stations", () => {
    expect(getActivityMinigameDefinition("cafe_deep_work")?.kind).toBe("timing");
    expect(getActivityMinigameDefinition("beach_surf_session")?.kind).toBe("balance");
    expect(getActivityMinigameDefinition("beach_club_big_night")?.kind).toBe("choice");
    expect(getActivityMinigameDefinition("warung_local_chat")?.kind).toBe("choice");
    expect(getActivityMinigameDefinition("coworking_focus_sprint")?.kind).toBe("timing");
    expect(getActivityMinigameDefinition("home_plan_tomorrow")?.kind).toBe("choice");
  });

  it("scales only upside activity rewards when a performance score is supplied", () => {
    const world = createInitialWorldState();
    const context = getVenueActivityContext("milk_madu_berawa")!;
    const player = world.players[world.localPlayerId];
    const startingFocus = world.meters.focus;

    const result = applyActivity(world, context, "remote_work_session", { performanceScore: 1 });

    expect(result.ok).toBe(true);
    expect(result.moneyDelta).toBe(Math.round(125 * rewardMultiplier(1)));
    expect(player.money).toBe(70 + result.moneyDelta);
    expect(world.meters.energy).toBe(48);
    expect(world.meters.focus).toBe(startingFocus + Math.round(10 * rewardMultiplier(1)));
  });

  it("scales opportunity gig rewards through the shared performance path", () => {
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();
    const startingFocus = world.meters.focus;
    world.clock.minuteOfDay = 10.75 * 60;
    const template = opportunityTemplates.find((candidate) => candidate.id === "milk_madu_lunch_rush_shift")!;
    const live = spawnOpportunity(state, template, getAbsoluteMinute(world.clock));

    const result = resolveOpportunity(state, world, live.id, undefined, 1);

    expect(result.ok).toBe(true);
    expect(world.players[world.localPlayerId].money).toBe(70 + Math.round(95 * rewardMultiplier(1)));
    expect(world.meters.focus).toBe(startingFocus + Math.round(6 * rewardMultiplier(1)));
    expect(world.meters.energy).toBe(60);
  });
});
