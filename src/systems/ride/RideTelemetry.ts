import type { RideModelOutput } from "./RideModel";

export interface RideTelemetry {
  speed: number;
  speedRatio: number;
  leanDegrees: number;
  drift: number;
}

export function getRideTelemetry(output: RideModelOutput | null, onBike: boolean): RideTelemetry | null {
  if (!onBike || !output) {
    return null;
  }
  return {
    speed: round(output.speed, 2),
    speedRatio: round(output.speedRatio, 3),
    leanDegrees: round(output.leanDegrees, 2),
    drift: round(output.drift, 3)
  };
}

function round(value: number, digits: number): number {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}
