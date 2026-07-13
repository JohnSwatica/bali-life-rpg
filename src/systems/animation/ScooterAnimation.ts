import type { HustleState } from "../../types";

export type ScooterTier = HustleState["scooterTier"];

export interface ScooterVisualInput {
  tier: ScooterTier;
  bikeCondition: number;
  velocityX: number;
  velocityY: number;
  maxSpeed: number;
  elapsedMs: number;
  leanDegrees?: number;
}

export interface ScooterVisualState {
  angleDegrees: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  speedCueAlpha: number;
  speedCueCount: number;
  speedRatio: number;
  rattleAmplitude: number;
}

export function getScooterRattleAmplitude(tier: ScooterTier, bikeCondition: number): number {
  const conditionWear = clamp((100 - bikeCondition) / 100, 0, 1);
  if (tier === "borrowed_rattletrap") {
    return 1.8 + conditionWear * 2.4;
  }
  if (tier === "daily_rental") {
    return 0.55 + conditionWear * 0.65;
  }
  return 0.18 + conditionWear * 0.24;
}

export function getScooterVisualState(input: ScooterVisualInput): ScooterVisualState {
  const speed = Math.hypot(input.velocityX, input.velocityY);
  const speedRatio = clamp(speed / Math.max(1, input.maxSpeed), 0, 1.2);
  const rattleAmplitude = getScooterRattleAmplitude(input.tier, input.bikeCondition);
  const idleFactor = speedRatio < 0.08 ? 1 : input.tier === "borrowed_rattletrap" ? 0.28 : 0.12;
  const wobbleWave = Math.sin(input.elapsedMs / 72);
  const rattleWave = Math.sin(input.elapsedMs / 39);
  const leanDegrees = input.leanDegrees ?? clamp((input.velocityX / Math.max(1, input.maxSpeed)) * 8.5, -8.5, 8.5);
  const wobbleDegrees = wobbleWave * rattleAmplitude * 0.55 * idleFactor;
  const speedCueAlpha = speedRatio > 0.72 ? clamp((speedRatio - 0.72) * 1.9, 0.16, 0.58) : 0;

  return {
    angleDegrees: leanDegrees + wobbleDegrees,
    offsetX: rattleWave * rattleAmplitude * 0.55 * idleFactor,
    offsetY: Math.abs(wobbleWave) * rattleAmplitude * 0.32 * idleFactor,
    scaleX: 1 + speedRatio * 0.018,
    scaleY: 1 - speedRatio * 0.012 + Math.abs(wobbleWave) * 0.008 * idleFactor,
    speedCueAlpha,
    speedCueCount: speedCueAlpha > 0 ? (input.tier === "borrowed_rattletrap" ? 2 : 3) : 0,
    speedRatio,
    rattleAmplitude
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
