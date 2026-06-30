import type { WorldState } from "../../types";

export const ACT1_STEADY_RUNNER_DELIVERIES = 3;
export const ACT1_MOVE_OUT_DELIVERIES = 5;
export const ACT1_MOVE_OUT_DELIVERY_EARNINGS = 700;
export const ACT1_MOVE_OUT_DRIVER_RATING = 4.2;
export const ACT1_INITIAL_RENT_DUE_DAY = 4;

export interface Act1MoveOutReadiness {
  deliveriesComplete: boolean;
  earningsComplete: boolean;
  ratingComplete: boolean;
  firstRentCovered: boolean;
  complete: boolean;
}

export function getAct1MoveOutReadiness(world: WorldState): Act1MoveOutReadiness {
  const hustle = world.life.hustle;
  const deliveriesComplete = hustle.completedDeliveryCount >= ACT1_MOVE_OUT_DELIVERIES;
  const earningsComplete = hustle.deliveryEarnings >= ACT1_MOVE_OUT_DELIVERY_EARNINGS;
  const ratingComplete = hustle.driverRating >= ACT1_MOVE_OUT_DRIVER_RATING;
  const firstRentCovered = hasCoveredFirstRent(world);
  return {
    deliveriesComplete,
    earningsComplete,
    ratingComplete,
    firstRentCovered,
    complete: deliveriesComplete && earningsComplete && ratingComplete && firstRentCovered
  };
}

export function isAct1MoveOutReady(world: WorldState): boolean {
  return getAct1MoveOutReadiness(world).complete;
}

export function hasCoveredFirstRent(world: WorldState): boolean {
  return world.life.hustle.rentDueDay > ACT1_INITIAL_RENT_DUE_DAY;
}
