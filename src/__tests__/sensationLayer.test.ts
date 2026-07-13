import { describe, expect, it } from "vitest";
import { createInitialWorldState, getTimePhase } from "../systems/WorldState";
import {
  createAuthoredDay1ClockState,
  DAY1_TIME_BEAT_MINUTES,
  releaseAuthoredDay1Clock,
  setTimePhaseForBeat
} from "../systems/time/AuthoredDay1Clock";
import { isRideSurfaceSlick, WorldWeatherController } from "../systems/weather/WorldWeather";

describe("Day-1 sensation controls", () => {
  it("sets the existing clock to authored phases while leaving its normal pipeline in charge", () => {
    const world = createInitialWorldState();
    const control = createAuthoredDay1ClockState();

    expect(setTimePhaseForBeat(world, control, "morning")).toBe(true);
    expect(world.clock.minuteOfDay).toBe(DAY1_TIME_BEAT_MINUTES.morning);
    expect(getTimePhase(world.clock.minuteOfDay)).toBe("day");

    expect(setTimePhaseForBeat(world, control, "stormDusk")).toBe(true);
    expect(getTimePhase(world.clock.minuteOfDay)).toBe("dusk");
    expect(setTimePhaseForBeat(world, control, "night")).toBe(true);
    expect(getTimePhase(world.clock.minuteOfDay)).toBe("night");
    expect(releaseAuthoredDay1Clock(control)).toBe(true);
    expect(releaseAuthoredDay1Clock(control)).toBe(false);
  });

  it("is inert outside unfinished Act 0", () => {
    const world = createInitialWorldState();
    const control = createAuthoredDay1ClockState();
    world.clock.minuteOfDay = 9 * 60;
    world.life.actProgress.currentAct = 1;

    expect(setTimePhaseForBeat(world, control, "night")).toBe(false);
    expect(world.clock.minuteOfDay).toBe(9 * 60);
    expect(control).toEqual({ active: false, beat: null });
  });

  it("uses canonical weather state as the only slick-surface input", () => {
    const weather = new WorldWeatherController();
    expect(isRideSurfaceSlick(weather.state)).toBe(false);

    weather.syncDeliveryCondition("rain_window");
    expect(weather.state).toMatchObject({ kind: "rain", source: "delivery" });
    expect(isRideSurfaceSlick(weather.state)).toBe(true);

    weather.syncDeliveryCondition(undefined);
    expect(weather.state.kind).toBe("clear");
    expect(isRideSurfaceSlick(weather.state)).toBe(false);
  });

  it("starts and stops storms idempotently and protects scene weather from delivery sync", () => {
    const weather = new WorldWeatherController();
    expect(weather.start("storm")).toBe(true);
    expect(weather.start("storm")).toBe(false);
    expect(weather.syncDeliveryCondition("rain_window")).toBe(false);
    expect(weather.state.kind).toBe("storm");
    expect(weather.update(5_499, () => 0).thunder).toBe(false);
    expect(weather.update(1, () => 0).thunder).toBe(true);
    expect(weather.stop()).toBe(true);
    expect(weather.stop()).toBe(false);
  });
});
