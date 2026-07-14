import { getDeliveryDefinition } from "../../data/deliveries";
import type { WorldState } from "../../types";
import { KADEK_PRIORITY_DELIVERY_ID, KADEK_PRIORITY_FLAG } from "./Act1KadekPriority";
import { MADE_ROOM_OFFER_SCENE_FLAG } from "./Act1MadeRoomOffer";
import { queueAct1LeoCadenceMilestone } from "./Act1LeoCadence";

export { ACT1_BREAKDOWN_LEO_MESSAGE_ID } from "./Act1LeoCadence";

export const ACT1_BREAKDOWN_FLAG = "act1_transmission_breakdown_fired";
export const ACT1_BREAKDOWN_RESOLVED_FLAG = "act1_transmission_breakdown_delivery_resolved";
export const ACT1_BREAKDOWN_ARMED_DELIVERY_FLAG = "act1_transmission_breakdown_armed_delivery";
export const ACT1_BREAKDOWN_PUSH_ACTIVE_FLAG = "act1_transmission_breakdown_push_active";
export const ACT1_BREAKDOWN_SCOOTER_BLOWN_FLAG = "act1_transmission_breakdown_scooter_blown";
export const ACT1_BREAKDOWN_DRIVER_RATING = 3.2;
export const ACT1_BREAKDOWN_PREMIUM_RATING = 3.5;

// The run must have visibly started, then enter this deterministic band before the dropoff.
export const ACT1_BREAKDOWN_MIN_RIDE_MS = 400;
export const ACT1_BREAKDOWN_TRIGGER_DISTANCE = 620;
export const ACT1_BREAKDOWN_DROPOFF_CLEARANCE = 150;

export interface BreakdownTriggerInput {
  x: number;
  y: number;
  now: number;
}

export interface BreakdownTriggerResult {
  fired: boolean;
  message?: string;
}

export interface BreakdownDropoffResult {
  fired: boolean;
  dialogue?: string;
}

export function areAct1BreakdownTurningPointsComplete(world: WorldState): boolean {
  return Boolean(
    world.collectedPickups[KADEK_PRIORITY_FLAG] &&
      world.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG]
  );
}

export function armAct1BreakdownForAcceptedBoardRun(
  world: WorldState,
  deliveryId: string
): boolean {
  const delivery = getDeliveryDefinition(deliveryId);
  if (
    world.life.actProgress.currentAct !== 1 ||
    !delivery?.boardAvailable ||
    !areAct1BreakdownTurningPointsComplete(world) ||
    world.collectedPickups[ACT1_BREAKDOWN_FLAG] ||
    world.questFlags[ACT1_BREAKDOWN_ARMED_DELIVERY_FLAG]
  ) {
    return false;
  }
  world.questFlags[ACT1_BREAKDOWN_ARMED_DELIVERY_FLAG] = deliveryId;
  return true;
}

export function isAct1BreakdownArmed(world: WorldState): boolean {
  const active = world.life.hustle.activeDelivery;
  return Boolean(
    active &&
      world.questFlags[ACT1_BREAKDOWN_ARMED_DELIVERY_FLAG] === active.deliveryId &&
      !world.collectedPickups[ACT1_BREAKDOWN_FLAG]
  );
}

export function shouldTriggerAct1Breakdown(
  world: WorldState,
  position: Pick<BreakdownTriggerInput, "x" | "y">
): boolean {
  const active = world.life.hustle.activeDelivery;
  if (
    !active ||
    active.stage !== "picked_up" ||
    !isAct1BreakdownArmed(world) ||
    !world.players[world.localPlayerId].onBike ||
    (active.rideRun?.elapsedMs ?? 0) < ACT1_BREAKDOWN_MIN_RIDE_MS
  ) {
    return false;
  }
  const delivery = getDeliveryDefinition(active.deliveryId);
  if (!delivery) return false;
  const distance = Math.hypot(
    position.x - delivery.dropoffPoint.x,
    position.y - delivery.dropoffPoint.y
  );
  return (
    distance <= ACT1_BREAKDOWN_TRIGGER_DISTANCE &&
    distance >= Math.max(ACT1_BREAKDOWN_DROPOFF_CLEARANCE, delivery.dropoffPoint.radius + 48)
  );
}

export function triggerAct1Breakdown(
  world: WorldState,
  input: BreakdownTriggerInput
): BreakdownTriggerResult {
  if (!shouldTriggerAct1Breakdown(world, input)) {
    return { fired: false };
  }
  const active = world.life.hustle.activeDelivery!;
  const player = world.players[world.localPlayerId];
  world.collectedPickups[ACT1_BREAKDOWN_FLAG] = Math.max(1, input.now);
  world.questFlags[ACT1_BREAKDOWN_PUSH_ACTIVE_FLAG] = true;
  world.questFlags[ACT1_BREAKDOWN_SCOOTER_BLOWN_FLAG] = true;
  active.cargoIntegrity = 0;
  active.cargoDamageEvents = (active.cargoDamageEvents ?? 0) + 1;
  active.dueAt = Math.min(active.dueAt, input.now - 1);
  player.onBike = false;
  player.bikeStuck = true;
  player.bikeCondition = 0;
  queueAct1LeoCadenceMilestone(world, "breakdown", input.now);
  return {
    fired: true,
    message: "TRANSMISSION GONE — push it in. The cargo is ruined, but the delivery still finishes."
  };
}

export function isAct1BreakdownPushActive(world: WorldState): boolean {
  return Boolean(
    world.questFlags[ACT1_BREAKDOWN_PUSH_ACTIVE_FLAG] &&
      world.life.hustle.activeDelivery?.stage === "picked_up"
  );
}

export function isAct1ScooterBlown(world: WorldState): boolean {
  return world.questFlags[ACT1_BREAKDOWN_SCOOTER_BLOWN_FLAG] === true;
}

export function completeAct1BreakdownDropoff(
  world: WorldState,
  now: number
): BreakdownDropoffResult {
  if (!isAct1BreakdownPushActive(world)) {
    return { fired: false };
  }
  world.questFlags[ACT1_BREAKDOWN_PUSH_ACTIVE_FLAG] = false;
  world.collectedPickups[ACT1_BREAKDOWN_RESOLVED_FLAG] = Math.max(1, now);
  world.life.hustle.driverRating = ACT1_BREAKDOWN_DRIVER_RATING;
  return {
    fired: true,
    dialogue: [
      'The customer lifts the collapsed bag, then looks at the smoke trailing from the scooter. "This is finished. You still pushed it all the way here?"',
      'You hand over what is left. The base fare clears. The cargo does not.',
      'NUSADROP · LATE · CARGO RUINED\nDRIVER RATING SET TO 3.2★ · PREMIUM TIERS LOCKED',
      'The scooter will ride again after a counter repair. The rating will not.'
    ].join("\n\n")
  };
}

/** The beat must never be missable: if the armed run resolves without firing (e.g. walked in), re-arm on the next accepted board run. */
export function rearmAct1BreakdownIfUnfired(world: WorldState, resolvedDeliveryId: string): boolean {
  if (
    world.collectedPickups[ACT1_BREAKDOWN_FLAG] ||
    world.questFlags[ACT1_BREAKDOWN_ARMED_DELIVERY_FLAG] !== resolvedDeliveryId
  ) {
    return false;
  }
  delete world.questFlags[ACT1_BREAKDOWN_ARMED_DELIVERY_FLAG];
  return true;
}

export function markAct1BreakdownScooterRepaired(world: WorldState): boolean {
  if (!isAct1ScooterBlown(world)) return false;
  world.questFlags[ACT1_BREAKDOWN_SCOOTER_BLOWN_FLAG] = false;
  return true;
}

export function getBreakdownRatingLockReason(
  world: WorldState,
  requiredRating: number
): string | null {
  if (
    !world.collectedPickups[ACT1_BREAKDOWN_FLAG] ||
    world.life.hustle.driverRating >= requiredRating
  ) {
    return null;
  }
  return `Locked — rating. Requires ${requiredRating.toFixed(1)}★; current ${world.life.hustle.driverRating.toFixed(1)}★.`;
}

export function getPostBreakdownRequiredRating(
  world: WorldState,
  deliveryId: string,
  configuredRating = 0
): number {
  if (
    world.collectedPickups[ACT1_BREAKDOWN_FLAG] &&
    deliveryId === KADEK_PRIORITY_DELIVERY_ID
  ) {
    return Math.max(configuredRating, ACT1_BREAKDOWN_PREMIUM_RATING);
  }
  return configuredRating;
}

export function getKadekBreakdownAmbientLine(world: WorldState): string | undefined {
  return world.collectedPickups[ACT1_BREAKDOWN_FLAG]
    ? '"The list holds. Ratings are the app\'s opinion, not mine."'
    : undefined;
}
