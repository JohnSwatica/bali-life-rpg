import { adjustPlayerMeters } from "../meters/PlayerMeters";
import { completeAct0Step } from "../life/ActProgression";
import type { WorldState } from "../../types";

export const ACT0_STORM_DELIVERY_ID = "act0_nusadrop_storm_run";
export const ACT0_VILLA_DELIVERY_ID = "act0_nusadrop_villa_finale";
export const ACT0_DEPOSIT_TARGET = 560;
export const ACT0_CAFE_SCENE_COST = 30;
export const ACT0_STORM_TRIGGER_MS = 4_500;

export interface Act0DepositState {
  visible: boolean;
  target: number;
  wallet: number;
  gap: number;
  resolved: boolean;
  vouchedByIbu: boolean;
  paidByPlayer: number;
  coveredByIbu: number;
}

export interface Act0DepositResolution extends Act0DepositState {
  branch: "paid_in_full" | "ibu_vouches";
}

export function revealAct0Deposit(world: WorldState): Act0DepositState {
  world.questFlags.act0_deposit_target = ACT0_DEPOSIT_TARGET;
  world.questFlags.act0_deposit_visible = true;
  return getAct0DepositState(world);
}

export function completeAct0CafeScene(world: WorldState): boolean {
  if (world.life.actProgress.act0Step !== "buy_meal_and_coffee") {
    return false;
  }
  const player = world.players[world.localPlayerId];
  player.money -= Math.min(ACT0_CAFE_SCENE_COST, player.money);
  adjustPlayerMeters(world, { energy: 12, wellbeing: 7, focus: 4 });
  world.questFlags.act0_meal_done = true;
  world.questFlags.act0_coffee_done = true;
  world.questFlags.act0_cafe_scene_complete = true;
  return completeAct0Step(world, "buy_meal_and_coffee");
}

export function prepareAct0VillaOrder(world: WorldState): void {
  const player = world.players[world.localPlayerId];
  player.bikeStuck = false;
  player.bikeCondition = Math.max(30, player.bikeCondition);
}

export function getAct0DepositState(world: WorldState): Act0DepositState {
  const wallet = Math.max(0, Math.floor(world.players[world.localPlayerId].money));
  const target = readNonNegativeNumber(world.questFlags.act0_deposit_target, ACT0_DEPOSIT_TARGET);
  const resolved = world.questFlags.act0_deposit_resolved === true;
  const vouchedByIbu = world.questFlags.act0_deposit_vouched === true;
  const paidByPlayer = readNonNegativeNumber(world.questFlags.act0_deposit_paid_by_player, 0);
  const coveredByIbu = readNonNegativeNumber(world.questFlags.act0_deposit_covered_by_ibu, 0);
  return {
    visible: world.questFlags.act0_deposit_visible === true && !resolved,
    target,
    wallet,
    gap: Math.max(0, target - wallet),
    resolved,
    vouchedByIbu,
    paidByPlayer,
    coveredByIbu
  };
}

export function resolveAct0Deposit(world: WorldState): Act0DepositResolution {
  const existing = getAct0DepositState(world);
  if (existing.resolved) {
    return { ...existing, branch: existing.vouchedByIbu ? "ibu_vouches" : "paid_in_full" };
  }

  const player = world.players[world.localPlayerId];
  const paidByPlayer = Math.min(existing.target, Math.max(0, Math.floor(player.money)));
  const coveredByIbu = Math.max(0, existing.target - paidByPlayer);
  player.money -= paidByPlayer;
  world.questFlags.act0_deposit_resolved = true;
  world.questFlags.act0_deposit_vouched = coveredByIbu > 0;
  world.questFlags.act0_deposit_paid_by_player = paidByPlayer;
  world.questFlags.act0_deposit_covered_by_ibu = coveredByIbu;

  return {
    ...getAct0DepositState(world),
    branch: coveredByIbu > 0 ? "ibu_vouches" : "paid_in_full"
  };
}

export function recordAct0CriticalPathMenuOpen(world: WorldState): void {
  if (world.life.actProgress.currentAct !== 0 || world.life.actProgress.firstDayComplete) {
    return;
  }
  const count = readNonNegativeNumber(world.questFlags.act0_critical_path_menu_opens, 0);
  world.questFlags.act0_critical_path_menu_opens = count + 1;
}

export function getAct0CriticalPathMenuOpenCount(world: WorldState): number {
  return readNonNegativeNumber(world.questFlags.act0_critical_path_menu_opens, 0);
}

export function markAct0StormTriggered(world: WorldState): boolean {
  const count = readNonNegativeNumber(world.questFlags.act0_storm_trigger_count, 0);
  if (count > 0) {
    return false;
  }
  world.questFlags.act0_storm_trigger_count = 1;
  return true;
}

export function getAct0StormTriggerCount(world: WorldState): number {
  return readNonNegativeNumber(world.questFlags.act0_storm_trigger_count, 0);
}

export function isAct0StoryDelivery(deliveryId: string | undefined): boolean {
  return deliveryId === ACT0_STORM_DELIVERY_ID || deliveryId === ACT0_VILLA_DELIVERY_ID;
}

function readNonNegativeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}
