import { describe, expect, it } from "vitest";
import { getRideTelemetry } from "../systems/ride/RideTelemetry";

describe("ride debug telemetry", () => {
  const output = {
    velocityX: 120,
    velocityY: 40,
    leanDegrees: 4.567,
    drift: 0.23456,
    speed: 126.491,
    maxSpeed: 180,
    speedRatio: 0.70273
  };

  it("reports compact ride-model values while mounted", () => {
    expect(getRideTelemetry(output, true)).toEqual({
      speed: 126.49,
      speedRatio: 0.703,
      leanDegrees: 4.57,
      drift: 0.235
    });
  });

  it("does not report stale riding values while on foot", () => {
    expect(getRideTelemetry(output, false)).toBeNull();
    expect(getRideTelemetry(null, true)).toBeNull();
  });
});
