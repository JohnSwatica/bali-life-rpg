import type { ActiveDeliveryState, DeliveryRideRunState } from "../../types";
import { DELIVERY_RIDE_FEEL_TUNING } from "../../tuning/FeelTuning";

export type DeliveryHazardKind = "pothole" | "puddle" | "pedestrian";

export interface DeliveryHazardDefinition {
  id: string;
  kind: DeliveryHazardKind;
  x: number;
  y: number;
}

export interface DeliveryHazardContactResult {
  speedMultiplier: number;
  cargoReason: "traffic_hit";
}

const PANTAI_BERAWA_HAZARDS: DeliveryHazardDefinition[] = [
  { id: "road-pothole-01", kind: "pothole", x: 1872, y: 304 },
  { id: "crossing-local-01", kind: "pedestrian", x: 1968, y: 472 },
  { id: "rain-puddle-01", kind: "puddle", x: 1912, y: 632 },
  { id: "road-pothole-02", kind: "pothole", x: 1970, y: 812 },
  { id: "crossing-local-02", kind: "pedestrian", x: 1870, y: 992 },
  { id: "rain-puddle-02", kind: "puddle", x: 1948, y: 1168 },
  { id: "road-pothole-03", kind: "pothole", x: 1886, y: 1340 },
  { id: "crossing-local-03", kind: "pedestrian", x: 1972, y: 1512 },
  { id: "rain-puddle-03", kind: "puddle", x: 1898, y: 1692 },
  { id: "road-pothole-04", kind: "pothole", x: 1964, y: 1872 }
];

export function createDeliveryRideRun(): DeliveryRideRunState {
  return { elapsedMs: 0, hazardsSpawned: 0, hazardsAvoided: 0, nearMisses: 0, contacts: 0 };
}

export function getDeliveryRideDensity(currentAct: number, deliveryId: string): number {
  const tuning = DELIVERY_RIDE_FEEL_TUNING.streets.jl_pantai_berawa;
  return currentAct === 0 || deliveryId === "first_baked_villa_delivery" ? tuning.tutorialDensity : tuning.act1Density;
}

export function getDeliveryHazards(currentAct: number, deliveryId: string): DeliveryHazardDefinition[] {
  const density = getDeliveryRideDensity(currentAct, deliveryId);
  const count = Math.max(1, Math.round(PANTAI_BERAWA_HAZARDS.length * density));
  if (count >= PANTAI_BERAWA_HAZARDS.length) return PANTAI_BERAWA_HAZARDS.map((hazard) => ({ ...hazard }));
  const stride = PANTAI_BERAWA_HAZARDS.length / count;
  return Array.from({ length: count }, (_, index) => ({ ...PANTAI_BERAWA_HAZARDS[Math.floor(index * stride)] }));
}

export function getHazardVisibilityDistance(isNight: boolean): number {
  const base = DELIVERY_RIDE_FEEL_TUNING.awarenessRadius;
  return isNight ? base * DELIVERY_RIDE_FEEL_TUNING.nightVisibilityMultiplier : base;
}

export function applyDeliveryHazardContact(): DeliveryHazardContactResult {
  return {
    speedMultiplier: DELIVERY_RIDE_FEEL_TUNING.stumbleSpeedMultiplier,
    cargoReason: "traffic_hit"
  };
}

export function calculateDeliveryRunScore(run: DeliveryRideRunState): number {
  const tuning = DELIVERY_RIDE_FEEL_TUNING.score;
  const spawned = Math.max(1, run.hazardsSpawned);
  const avoidanceRatio = Math.min(1, run.hazardsAvoided / spawned);
  const nearMissRatio = Math.min(1, run.nearMisses / Math.max(1, spawned * 0.45));
  const targetMs = spawned * tuning.targetSecondsPerHazard * 1000;
  const timeRatio = Math.max(0, Math.min(1, targetMs / Math.max(targetMs, run.elapsedMs)));
  const score =
    tuning.failForwardFloor +
    avoidanceRatio * tuning.avoidanceWeight +
    nearMissRatio * tuning.nearMissWeight +
    timeRatio * tuning.timeWeight -
    run.contacts * tuning.contactPenalty;
  return clamp(score, tuning.failForwardFloor, 1);
}

export function getDeliveryRunPerformance(active: ActiveDeliveryState | null | undefined): number | undefined {
  return active?.rideRun ? calculateDeliveryRunScore(active.rideRun) : undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
