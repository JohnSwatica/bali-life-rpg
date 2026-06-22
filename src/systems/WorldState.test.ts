import { describe, expect, it } from "vitest";
import { advanceClock, createInitialWorldState, formatClock, getLocalPlayer, getTimePhase } from "./WorldState";

describe("WorldState helpers", () => {
  it("creates the initial local player and canonical world defaults", () => {
    const world = createInitialWorldState();

    expect(world.schemaVersion).toBe(4);
    expect(world.portal).toEqual({ current: "single", multiplayerStatus: "locked" });
    expect(world.reputation.score).toBe(60);
    expect(getLocalPlayer(world)).toBe(world.players[world.localPlayerId]);
  });

  it("advances and wraps the clock across days", () => {
    const world = createInitialWorldState();
    world.clock.minuteOfDay = 1438;
    world.clock.minutesPerSecond = 4;

    advanceClock(world, 1000);
    expect(world.clock.day).toBe(2);
    expect(world.clock.minuteOfDay).toBe(2);
  });

  it("derives time phases at documented thresholds", () => {
    expect(getTimePhase(0)).toBe("night");
    expect(getTimePhase(360)).toBe("dawn");
    expect(getTimePhase(450)).toBe("day");
    expect(getTimePhase(1080)).toBe("dusk");
    expect(getTimePhase(1170)).toBe("night");
  });

  it("formats the day clock with padded hours and minutes", () => {
    const world = createInitialWorldState();
    world.clock.day = 3;
    world.clock.minuteOfDay = 7 * 60 + 5;

    expect(formatClock(world)).toBe("Day 3 07:05");
  });
});
