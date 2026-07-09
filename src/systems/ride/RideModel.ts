import type { HustleState } from "../../types";

export type RideScooterTier = HustleState["scooterTier"];

export interface RideModelState {
  velocityX: number;
  velocityY: number;
  leanDegrees: number;
  drift: number;
}

export interface RideModelInput {
  inputX: number;
  inputY: number;
  deltaMs: number;
  state: RideModelState;
  baseMaxSpeed: number;
  tier: RideScooterTier;
  bikeCondition: number;
  slick?: boolean;
}

export interface RideModelOutput extends RideModelState {
  speed: number;
  maxSpeed: number;
  speedRatio: number;
}

const ACCELERATION_SECONDS = 0.62;
const COAST_TO_STOP_SECONDS = 0.48;
const BASE_TOP_SPEED_COMPENSATION = 1.08;
const LOW_SPEED_DRIFT_CUTOFF = 0.22;

export function createRideModelState(): RideModelState {
  return {
    velocityX: 0,
    velocityY: 0,
    leanDegrees: 0,
    drift: 0
  };
}

export function updateRideModel(input: RideModelInput): RideModelOutput {
  const dt = Math.max(0, input.deltaMs) / 1000;
  const maxSpeed = getRideMaxSpeed(input.baseMaxSpeed, input.tier, input.bikeCondition);
  const speed = Math.hypot(input.state.velocityX, input.state.velocityY);
  const inputMagnitude = Math.hypot(input.inputX, input.inputY);
  let velocityX = input.state.velocityX;
  let velocityY = input.state.velocityY;
  let drift = 0;

  if (inputMagnitude > 0.001) {
    const desiredX = (input.inputX / inputMagnitude) * maxSpeed;
    const desiredY = (input.inputY / inputMagnitude) * maxSpeed;
    const currentDirectionX = speed > 0.001 ? velocityX / speed : desiredX / maxSpeed;
    const currentDirectionY = speed > 0.001 ? velocityY / speed : desiredY / maxSpeed;
    const desiredDirectionX = desiredX / maxSpeed;
    const desiredDirectionY = desiredY / maxSpeed;
    const turnDot = clamp(currentDirectionX * desiredDirectionX + currentDirectionY * desiredDirectionY, -1, 1);
    const speedRatio = clamp(speed / Math.max(1, maxSpeed), 0, 1);
    const turnSharpness = speedRatio > LOW_SPEED_DRIFT_CUTOFF ? clamp((1 - turnDot) / 2, 0, 1) : 0;
    const grip = getRideGrip(input.tier, input.bikeCondition, Boolean(input.slick));
    drift = clamp(turnSharpness * speedRatio * (input.slick ? 1.25 : 1), 0, 1);
    const steeringLoss = 1 - drift * (input.slick ? 0.48 : 0.32);
    const maxChange = (maxSpeed / ACCELERATION_SECONDS) * dt * grip * steeringLoss;
    const changed = moveVectorToward({ x: velocityX, y: velocityY }, { x: desiredX, y: desiredY }, maxChange);
    velocityX = changed.x;
    velocityY = changed.y;
  } else {
    const next = moveVectorToward({ x: velocityX, y: velocityY }, { x: 0, y: 0 }, (maxSpeed / COAST_TO_STOP_SECONDS) * dt);
    velocityX = next.x;
    velocityY = next.y;
  }

  const capped = capVectorLength({ x: velocityX, y: velocityY }, maxSpeed);
  velocityX = capped.x;
  velocityY = capped.y;
  const nextSpeed = Math.hypot(velocityX, velocityY);
  const speedRatio = clamp(nextSpeed / Math.max(1, maxSpeed), 0, 1.1);
  const leanFromVelocity = clamp((velocityX / Math.max(1, maxSpeed)) * 8.5, -8.5, 8.5);
  const leanFromDrift = drift * Math.sign(velocityX || input.inputX || 1) * (input.slick ? 4.2 : 2.6);
  const leanDegrees = clamp(leanFromVelocity + leanFromDrift, -12, 12);

  return {
    velocityX,
    velocityY,
    leanDegrees,
    drift,
    speed: nextSpeed,
    maxSpeed,
    speedRatio
  };
}

export function getRideMaxSpeed(baseMaxSpeed: number, tier: RideScooterTier, bikeCondition: number): number {
  const tierModifier = tier === "proper_bike" ? 1.18 : tier === "daily_rental" ? 1.12 : BASE_TOP_SPEED_COMPENSATION;
  const conditionPenalty = clamp((70 - bikeCondition) / 70, 0, 1) * (tier === "borrowed_rattletrap" ? 0.09 : 0.05);
  return Math.max(1, baseMaxSpeed * tierModifier * (1 - conditionPenalty));
}

export function getRideGrip(tier: RideScooterTier, bikeCondition: number, slick: boolean): number {
  const tierGrip = tier === "proper_bike" ? 1.06 : tier === "daily_rental" ? 1 : 0.93;
  const conditionGripPenalty = clamp((55 - bikeCondition) / 55, 0, 1) * 0.16;
  const slickPenalty = slick ? 0.2 : 0;
  return clamp(tierGrip - conditionGripPenalty - slickPenalty, 0.62, 1.08);
}

export function estimateStraightRideTimeMs(distance: number, baseMaxSpeed: number, tier: RideScooterTier, bikeCondition: number): number {
  let state = createRideModelState();
  let traveled = 0;
  let elapsed = 0;
  while (traveled < distance && elapsed < 120_000) {
    const next = updateRideModel({
      inputX: 1,
      inputY: 0,
      deltaMs: 100,
      state,
      baseMaxSpeed,
      tier,
      bikeCondition
    });
    state = next;
    traveled += next.speed * 0.1;
    elapsed += 100;
  }
  return elapsed;
}

function moveVectorToward(from: { x: number; y: number }, to: { x: number; y: number }, maxDistance: number): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= maxDistance || distance <= 0.0001) {
    return { x: to.x, y: to.y };
  }
  return {
    x: from.x + (dx / distance) * maxDistance,
    y: from.y + (dy / distance) * maxDistance
  };
}

function capVectorLength(vector: { x: number; y: number }, maxLength: number): { x: number; y: number } {
  const length = Math.hypot(vector.x, vector.y);
  if (length <= maxLength || length <= 0.0001) {
    return vector;
  }
  return {
    x: (vector.x / length) * maxLength,
    y: (vector.y / length) * maxLength
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
