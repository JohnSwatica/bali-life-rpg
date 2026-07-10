import type { HustleState } from "../../types";
import { RIDE_FEEL_TUNING } from "../../tuning/FeelTuning";

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
    const turnSharpness = speedRatio > RIDE_FEEL_TUNING.lowSpeedDriftCutoff ? clamp((1 - turnDot) / 2, 0, 1) : 0;
    const grip = getRideGrip(input.tier, input.bikeCondition, Boolean(input.slick));
    drift = clamp(turnSharpness * speedRatio * (input.slick ? RIDE_FEEL_TUNING.slickDriftMultiplier : 1), 0, 1);
    const steeringLoss =
      1 - drift * (input.slick ? RIDE_FEEL_TUNING.slickSteeringLoss : RIDE_FEEL_TUNING.drySteeringLoss);
    const maxChange = (maxSpeed / RIDE_FEEL_TUNING.accelerationSeconds) * dt * grip * steeringLoss;
    const changed = moveVectorToward({ x: velocityX, y: velocityY }, { x: desiredX, y: desiredY }, maxChange);
    velocityX = changed.x;
    velocityY = changed.y;
  } else {
    const next = moveVectorToward(
      { x: velocityX, y: velocityY },
      { x: 0, y: 0 },
      (maxSpeed / RIDE_FEEL_TUNING.coastToStopSeconds) * dt
    );
    velocityX = next.x;
    velocityY = next.y;
  }

  const capped = capVectorLength({ x: velocityX, y: velocityY }, maxSpeed);
  velocityX = capped.x;
  velocityY = capped.y;
  const nextSpeed = Math.hypot(velocityX, velocityY);
  const speedRatio = clamp(nextSpeed / Math.max(1, maxSpeed), 0, RIDE_FEEL_TUNING.maximumSpeedRatio);
  const leanFromVelocity = clamp(
    (velocityX / Math.max(1, maxSpeed)) * RIDE_FEEL_TUNING.velocityLeanDegrees,
    -RIDE_FEEL_TUNING.velocityLeanDegrees,
    RIDE_FEEL_TUNING.velocityLeanDegrees
  );
  const leanFromDrift =
    drift *
    Math.sign(velocityX || input.inputX || 1) *
    (input.slick ? RIDE_FEEL_TUNING.slickDriftLeanDegrees : RIDE_FEEL_TUNING.dryDriftLeanDegrees);
  const leanDegrees = clamp(
    leanFromVelocity + leanFromDrift,
    -RIDE_FEEL_TUNING.maxLeanDegrees,
    RIDE_FEEL_TUNING.maxLeanDegrees
  );

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
  const tierModifier =
    tier === "proper_bike"
      ? RIDE_FEEL_TUNING.properBikeTopSpeedModifier
      : tier === "daily_rental"
        ? RIDE_FEEL_TUNING.rentalTopSpeedModifier
        : RIDE_FEEL_TUNING.borrowedTopSpeedModifier;
  const conditionPenalty =
    clamp(
      (RIDE_FEEL_TUNING.topSpeedConditionThreshold - bikeCondition) / RIDE_FEEL_TUNING.topSpeedConditionThreshold,
      0,
      1
    ) *
    (tier === "borrowed_rattletrap"
      ? RIDE_FEEL_TUNING.borrowedLowConditionSpeedPenalty
      : RIDE_FEEL_TUNING.upgradedLowConditionSpeedPenalty);
  return Math.max(1, baseMaxSpeed * tierModifier * (1 - conditionPenalty));
}

export function getRideGrip(tier: RideScooterTier, bikeCondition: number, slick: boolean): number {
  const tierGrip =
    tier === "proper_bike"
      ? RIDE_FEEL_TUNING.properBikeGrip
      : tier === "daily_rental"
        ? RIDE_FEEL_TUNING.rentalGrip
        : RIDE_FEEL_TUNING.borrowedGrip;
  const conditionGripPenalty =
    clamp(
      (RIDE_FEEL_TUNING.gripConditionThreshold - bikeCondition) / RIDE_FEEL_TUNING.gripConditionThreshold,
      0,
      1
    ) * RIDE_FEEL_TUNING.conditionGripPenalty;
  const slickPenalty = slick ? RIDE_FEEL_TUNING.slickGripPenalty : 0;
  return clamp(
    tierGrip - conditionGripPenalty - slickPenalty,
    RIDE_FEEL_TUNING.minimumGrip,
    RIDE_FEEL_TUNING.maximumGrip
  );
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
