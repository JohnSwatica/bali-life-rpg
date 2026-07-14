import { addItem, getQuantity } from "../Inventory";
import { adjustPlayerMeters } from "../meters/PlayerMeters";
import { adjustReputation } from "../reputation/ReputationState";
import { isAct1MoveOutReady } from "./HustleMilestones";
import type { WorldState } from "../../types";
import {
  isAct1ScooterBlown,
  markAct1BreakdownScooterRepaired
} from "../story/Act1Breakdown";

const SCOOTER_KEY_ITEM_ID = "scooter_key";
export const DAILY_SCOOTER_UPGRADE_COST = 260;
export const DAILY_SCOOTER_UPGRADE_MIN_DELIVERIES = 2;
export const DAILY_SCOOTER_UPGRADE_MIN_RATING = 3.6;
export const RENT_EXTENSION_DAYS = 3;
export const MIN_DELIVERY_BIKE_CONDITION = 18;

export interface HustleActionResult {
  ok: boolean;
  message: string;
}

export interface ScooterUpgradeStatus {
  available: boolean;
  reason: string | null;
  cost: number;
}

export interface ScooterRepairStatus {
  available: boolean;
  reason: string | null;
  cost: number;
  targetCondition: number;
}

export type RentPressureStatus = "comfortable" | "due_soon" | "due_today" | "overdue";

export interface RentPressureState {
  status: RentPressureStatus;
  daysRemaining: number;
  shortLabel: string;
  message: string;
}

export function getRentPressureState(world: WorldState): RentPressureState {
  const daysRemaining = world.life.hustle.rentDueDay - world.clock.day;
  if (daysRemaining < 0) {
    return {
      status: "overdue",
      daysRemaining,
      shortLabel: "Rent overdue",
      message: `Rent was due ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} ago. Pay it when you can to steady your life.`
    };
  }
  if (daysRemaining === 0) {
    return {
      status: "due_today",
      daysRemaining,
      shortLabel: "Rent due today",
      message: "Rent is due today. One clean run can still buy breathing room."
    };
  }
  if (daysRemaining === 1) {
    return {
      status: "due_soon",
      daysRemaining,
      shortLabel: "Rent due tomorrow",
      message: "Rent is due tomorrow. Run NusaDrop now, sleep easier later."
    };
  }
  return {
    status: "comfortable",
    daysRemaining,
    shortLabel: `${daysRemaining} days to rent`,
    message: `Rent is due in ${daysRemaining} days. Keep stacking small wins.`
  };
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
  const wasMoveOutReady = world.life.hustle.moveOutReady;
  world.life.hustle.moveOutReady = isAct1MoveOutReady(world);
  if (!wasMoveOutReady && world.life.hustle.moveOutReady && world.life.actProgress.currentAct < 2) {
    world.life.actProgress.currentAct = 2;
  }
  const moveOutCopy =
    !wasMoveOutReady && world.life.hustle.moveOutReady
      ? " Found your feet: first rent covered, rating steady, and Act 2 begins."
      : "";
  return {
    ok: true,
    message: `Rent paid. Next rent target: Rp ${world.life.hustle.rentAmount} by Day ${world.life.hustle.rentDueDay}.${moveOutCopy}`
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

export function getScooterRepairStatus(world: WorldState): ScooterRepairStatus {
  const player = world.players[world.localPlayerId];
  const targetCondition = getRepairTargetCondition(world);
  const cost = getScooterRepairCost(world);
  if (!player.hasBike) {
    return { available: false, reason: "You need a scooter before repairs matter.", cost, targetCondition };
  }
  if (isAct1ScooterBlown(world) && player.money < cost) {
    return {
      available: false,
      reason: `Transmission blown — need Rp ${cost - player.money} more for the counter repair.`,
      cost,
      targetCondition
    };
  }
  if (player.bikeCondition >= targetCondition) {
    return { available: false, reason: "Scooter is as good as this tier gets.", cost: 0, targetCondition };
  }
  if (player.money < cost) {
    return { available: false, reason: `Need Rp ${cost - player.money} more for repairs.`, cost, targetCondition };
  }
  return { available: true, reason: null, cost, targetCondition };
}

export function repairScooter(world: WorldState, now: number, performanceScore?: number): HustleActionResult {
  const status = getScooterRepairStatus(world);
  if (!status.available) {
    return { ok: false, message: status.reason ?? "Scooter repair is not available yet." };
  }
  const player = world.players[world.localPlayerId];
  const repairedCondition = calculateScooterRepairOutcomeCondition(player.bikeCondition, status.targetCondition, performanceScore);
  player.money -= status.cost;
  player.bikeCondition = repairedCondition;
  player.bikeStuck = false;
  player.hasBike = true;
  const restoredBlownTransmission = markAct1BreakdownScooterRepaired(world);
  adjustPlayerMeters(world, { wellbeing: 3, focus: 1 });
  adjustReputation(world.reputation, 1, "Kept the scooter maintained for delivery work", now);
  const qualityCopy =
    performanceScore == null
      ? ""
      : performanceScore >= 0.85
        ? " Clean wrench work."
        : performanceScore >= 0.5
          ? " Good enough for the road."
          : " Rough patch, but it rolls.";
  return {
    ok: true,
    message: restoredBlownTransmission
      ? `Transmission repaired. Ride restored at ${repairedCondition}%. Rp -${status.cost}. Driver rating stays ${world.life.hustle.driverRating.toFixed(1)}★.${qualityCopy}`
      : `Scooter patched up to ${repairedCondition}%. Rp -${status.cost}.${qualityCopy}`
  };
}

export function calculateScooterRepairOutcomeCondition(currentCondition: number, targetCondition: number, performanceScore?: number): number {
  const current = Math.max(0, Math.min(100, Math.round(currentCondition)));
  const target = Math.max(current, Math.min(100, Math.round(targetCondition)));
  if (performanceScore == null) {
    return target;
  }
  const missing = target - current;
  if (missing <= 0) {
    return target;
  }
  const score = Math.max(0, Math.min(1, performanceScore));
  const repairRatio = 0.72 + score * 0.28;
  const repaired = current + Math.round(missing * repairRatio);
  return Math.max(Math.min(target, current + 12), Math.min(target, repaired));
}

export function applyDeliveryScooterWear(world: WorldState, extraWear = 0): number {
  const player = world.players[world.localPlayerId];
  if (!player.hasBike) {
    return 0;
  }
  const baseWear =
    world.life.hustle.scooterTier === "borrowed_rattletrap"
      ? 7
      : world.life.hustle.scooterTier === "daily_rental"
        ? 4
        : 2;
  const wear = Math.max(0, Math.round(baseWear + extraWear));
  player.bikeCondition = Math.max(0, player.bikeCondition - wear);
  return wear;
}

export function upgradeToDailyScooter(world: WorldState, now: number): HustleActionResult {
  const status = getScooterUpgradeStatus(world);
  if (!status.available) {
    return { ok: false, message: status.reason ?? "Scooter upgrade is not available yet." };
  }

  const player = world.players[world.localPlayerId];
  player.money -= DAILY_SCOOTER_UPGRADE_COST;
  player.hasBike = true;
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

function getRepairTargetCondition(world: WorldState): number {
  return world.life.hustle.scooterTier === "borrowed_rattletrap" ? 78 : 100;
}

function getScooterRepairCost(world: WorldState): number {
  const player = world.players[world.localPlayerId];
  const missing = Math.max(0, getRepairTargetCondition(world) - player.bikeCondition);
  const rate = world.life.hustle.scooterTier === "borrowed_rattletrap" ? 1.15 : 1.55;
  return Math.min(150, Math.max(35, Math.ceil(missing * rate)));
}
