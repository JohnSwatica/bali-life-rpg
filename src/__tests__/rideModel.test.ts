import { describe, expect, it } from "vitest";
import {
  createRideModelState,
  estimateStraightRideTimeMs,
  getRideGrip,
  getRideMaxSpeed,
  updateRideModel
} from "../systems/ride/RideModel";

const OLD_CONSTANT_BIKE_SPEED = 552;

describe("ride model", () => {
  it("accelerates toward top speed instead of snapping instantly", () => {
    const firstFrame = updateRideModel({
      inputX: 1,
      inputY: 0,
      deltaMs: 100,
      state: createRideModelState(),
      baseMaxSpeed: OLD_CONSTANT_BIKE_SPEED,
      tier: "borrowed_rattletrap",
      bikeCondition: 100
    });

    expect(firstFrame.speed).toBeGreaterThan(0);
    expect(firstFrame.speed).toBeLessThan(firstFrame.maxSpeed * 0.35);

    let state = firstFrame;
    for (let index = 0; index < 7; index += 1) {
      state = updateRideModel({
        inputX: 1,
        inputY: 0,
        deltaMs: 100,
        state,
        baseMaxSpeed: OLD_CONSTANT_BIKE_SPEED,
        tier: "borrowed_rattletrap",
        bikeCondition: 100
      });
    }
    expect(state.speed).toBeGreaterThan(state.maxSpeed * 0.92);
  });

  it("coasts/brakes down when input is released", () => {
    let state = updateRideModel({
      inputX: 1,
      inputY: 0,
      deltaMs: 900,
      state: createRideModelState(),
      baseMaxSpeed: OLD_CONSTANT_BIKE_SPEED,
      tier: "borrowed_rattletrap",
      bikeCondition: 100
    });
    const movingSpeed = state.speed;

    state = updateRideModel({
      inputX: 0,
      inputY: 0,
      deltaMs: 300,
      state,
      baseMaxSpeed: OLD_CONSTANT_BIKE_SPEED,
      tier: "borrowed_rattletrap",
      bikeCondition: 100
    });

    expect(state.speed).toBeLessThan(movingSpeed);
    expect(state.speed).toBeGreaterThan(0);
  });

  it("modulates top speed and grip by tier, condition, and slick surface", () => {
    expect(getRideMaxSpeed(OLD_CONSTANT_BIKE_SPEED, "proper_bike", 100)).toBeGreaterThan(
      getRideMaxSpeed(OLD_CONSTANT_BIKE_SPEED, "borrowed_rattletrap", 100)
    );
    expect(getRideMaxSpeed(OLD_CONSTANT_BIKE_SPEED, "borrowed_rattletrap", 20)).toBeLessThan(
      getRideMaxSpeed(OLD_CONSTANT_BIKE_SPEED, "borrowed_rattletrap", 100)
    );
    expect(getRideGrip("borrowed_rattletrap", 100, true)).toBeLessThan(getRideGrip("borrowed_rattletrap", 100, false));
  });

  it("reports drift and stronger lean on sharp high-speed turns", () => {
    let state = updateRideModel({
      inputX: 1,
      inputY: 0,
      deltaMs: 900,
      state: createRideModelState(),
      baseMaxSpeed: OLD_CONSTANT_BIKE_SPEED,
      tier: "daily_rental",
      bikeCondition: 100
    });
    state = updateRideModel({
      inputX: -1,
      inputY: 0,
      deltaMs: 100,
      state,
      baseMaxSpeed: OLD_CONSTANT_BIKE_SPEED,
      tier: "daily_rental",
      bikeCondition: 100
    });

    expect(state.drift).toBeGreaterThan(0.3);
    expect(Math.abs(state.leanDegrees)).toBeGreaterThan(3);
  });

  it("makes slick surfaces reduce steering grip without changing delivery balance math", () => {
    const dry = updateRideModel({
      inputX: 0,
      inputY: 1,
      deltaMs: 100,
      state: { velocityX: 500, velocityY: 0, leanDegrees: 0, drift: 0 },
      baseMaxSpeed: OLD_CONSTANT_BIKE_SPEED,
      tier: "borrowed_rattletrap",
      bikeCondition: 100,
      slick: false
    });
    const slick = updateRideModel({
      inputX: 0,
      inputY: 1,
      deltaMs: 100,
      state: { velocityX: 500, velocityY: 0, leanDegrees: 0, drift: 0 },
      baseMaxSpeed: OLD_CONSTANT_BIKE_SPEED,
      tier: "borrowed_rattletrap",
      bikeCondition: 100,
      slick: true
    });

    expect(slick.drift).toBeGreaterThan(dry.drift);
    expect(slick.velocityY).toBeLessThan(dry.velocityY);
  });

  it("keeps a typical straight delivery traversal within ten percent of the old constant speed", () => {
    const distance = 1600;
    const oldTimeMs = (distance / OLD_CONSTANT_BIKE_SPEED) * 1000;
    const newTimeMs = estimateStraightRideTimeMs(distance, OLD_CONSTANT_BIKE_SPEED, "borrowed_rattletrap", 100);
    const ratio = newTimeMs / oldTimeMs;

    expect(ratio).toBeGreaterThanOrEqual(0.9);
    expect(ratio).toBeLessThanOrEqual(1.1);
  });
});
