import { addItem, getQuantity } from "../Inventory";
import { adjustPlayerMeters } from "../meters/PlayerMeters";
import { adjustReputation } from "../reputation/ReputationState";
import type { WorldState } from "../../types";

const SCOOTER_KEY_ITEM_ID = "scooter_key";
export const DAILY_SCOOTER_UPGRADE_COST = 260;
export const DAILY_SCOOTER_UPGRADE_MIN_DELIVERIES = 2;
export const DAILY_SCOOTER_UPGRADE_MIN_RATING = 3.6;
export const RENT_EXTENSION_DAYS = 3;

export interface HustleActionResult {
  ok: boolean;
  message: string;
}

export interface ScooterUpgradeStatus {
  available: boolean;
  reason: string | null;
  cost: number;
}

export function payHustleRent(world: WorldState, now: number): HustleActionResult {
  const player = world.players[world.localPlayerId];
  const amount = world.life.hustle.rentAmount;
  if (player.money < amount) {
    return { ok: false, message: `Need Rp ${amount - player.money} more for rent.` };
  }

  player.money -= amount;
  world.life.hustle.rentDueDay = Math.max(world.clock.day, world.life.hustle.rentDueDay) + RENT_EXTENSION_DAYS;
  adjustPlayerMeters(world, { wellbeing: 8, focus: 3 });
  adjustReputation(world.reputation, 1, "Paid local rent on time", now);
  return {
    ok: true,
    message: `Rent paid. Next rent target: Rp ${world.life.hustle.rentAmount} by Day ${world.life.hustle.rentDueDay}.`
  };
}

export function getScooterUpgradeStatus(world: WorldState): ScooterUpgradeStatus {
  const player = world.players[world.localPlayerId];
  if (world.life.hustle.scooterTier !== "borrowed_rattletrap") {
    return { available: false, reason: "Scooter already upgraded for this act.", cost: DAILY_SCOOTER_UPGRADE_COST };
  }
  if (world.life.hustle.completedDeliveryCount < DAILY_SCOOTER_UPGRADE_MIN_DELIVERIES) {
    return {
      available: false,
      reason: `Need ${DAILY_SCOOTER_UPGRADE_MIN_DELIVERIES} completed deliveries.`,
      cost: DAILY_SCOOTER_UPGRADE_COST
    };
  }
  if (world.life.hustle.driverRating < DAILY_SCOOTER_UPGRADE_MIN_RATING) {
    return {
      available: false,
      reason: `Need ${DAILY_SCOOTER_UPGRADE_MIN_RATING.toFixed(1)}★ driver rating.`,
      cost: DAILY_SCOOTER_UPGRADE_COST
    };
  }
  if (player.money < DAILY_SCOOTER_UPGRADE_COST) {
    return {
      available: false,
      reason: `Need Rp ${DAILY_SCOOTER_UPGRADE_COST - player.money} more.`,
      cost: DAILY_SCOOTER_UPGRADE_COST
    };
  }
  return { available: true, reason: null, cost: DAILY_SCOOTER_UPGRADE_COST };
}

export function upgradeToDailyScooter(world: WorldState, now: number): HustleActionResult {
  const status = getScooterUpgradeStatus(world);
  if (!status.available) {
    return { ok: false, message: status.reason ?? "Scooter upgrade is not available yet." };
  }

  const player = world.players[world.localPlayerId];
  player.money -= DAILY_SCOOTER_UPGRADE_COST;
  player.hasBike = true;
  player.onBike = true;
  player.bikeStuck = false;
  player.bikeCondition = 100;
  world.life.hustle.scooterTier = "daily_rental";
  if (getQuantity(player, SCOOTER_KEY_ITEM_ID) === 0) {
    addItem(player, SCOOTER_KEY_ITEM_ID, 1);
  }
  adjustPlayerMeters(world, { wellbeing: 5, focus: 2 });
  adjustReputation(world.reputation, 1, "Upgraded from the borrowed rattletrap", now);
  return { ok: true, message: "Scooter upgraded to a proper daily rental. Cleaner rides, fewer excuses." };
}
