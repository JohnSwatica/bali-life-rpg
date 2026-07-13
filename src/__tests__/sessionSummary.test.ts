import { describe, expect, it } from "vitest";
import { createFeedbackMailto, createSessionSummary, getApproximateSessionMinutes } from "../systems/feedback/SessionSummary";
import { createInitialWorldState } from "../systems/WorldState";

describe("session feedback summary", () => {
  it("formats the short local play summary and feedback prompts", () => {
    const world = createInitialWorldState();
    world.clock.day = 3;
    world.life.actProgress.currentAct = 1;
    world.players[world.localPlayerId].money = 245;
    world.life.hustle.driverRating = 4.2;
    world.life.hustle.completedDeliveryCount = 4;

    const summary = createSessionSummary(world, {
      buildStamp: "abc1234 · 2026-07-10",
      sessionStartedAt: 1_000,
      now: 185_000,
      lastObjectiveLine: "Now: Pay rent - Return to Ibu Sari."
    });

    expect(summary).toContain("Build: abc1234 · 2026-07-10");
    expect(summary).toContain("Act: 1");
    expect(summary).toContain("Day: 3");
    expect(summary).toContain("Money: Rp 245");
    expect(summary).toContain("Driver rating: 4.2");
    expect(summary).toContain("Completed deliveries: 4");
    expect(summary).toContain("Approx. minutes played this session: 3");
    expect(summary).toContain("Last objective: Now: Pay rent - Return to Ibu Sari.");
    expect(summary).toContain("Where did you get bored?");
    expect(summary).toContain("Where were you confused?");
    expect(summary).toContain("Anything you liked?");
  });

  it("creates a locally encoded mailto link without a network dependency", () => {
    const mailto = createFeedbackMailto(createInitialWorldState(), {
      buildStamp: "dev",
      sessionStartedAt: null,
      now: 0,
      lastObjectiveLine: "Now: Find Ibu Sari"
    });

    expect(mailto).toMatch(/^mailto:smartjonnyz@gmail\.com\?subject=/);
    expect(decodeURIComponent(mailto)).toContain("Bali Life RPG feedback dev");
    expect(decodeURIComponent(mailto)).toContain("Approx. minutes played this session: 0");
    expect(getApproximateSessionMinutes(50_000, 20_000)).toBe(0);
  });
});
