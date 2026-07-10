import type { ActiveDeliveryState, ActProgressState } from "../../types";
import type { DeliveryCondition, DeliveryDefinition } from "../../data/deliveries";
import { CARGO_FEEL_TUNING } from "../../tuning/FeelTuning";

export type CargoDamageReason = "traffic_hit" | "hard_collision";

export interface CargoCareAdjustment {
  eligible: boolean;
  integrity: number;
  originalBonus: number;
  retainedBonus: number;
  lostBonus: number;
  bonusMultiplier: number;
  adjustedPayoutBase: number;
}

export interface CargoDamageResult {
  damaged: boolean;
  before: number;
  after: number;
  amount: number;
}

export function isCargoCareEligible(
  currentAct: ActProgressState["currentAct"],
  delivery: DeliveryDefinition,
  condition?: DeliveryCondition
): boolean {
  return currentAct >= 1 && !delivery.tutorialDelivery && (condition?.payoutBonus ?? 0) > 0;
}

export function getCargoIntegrity(activeDelivery: ActiveDeliveryState | null | undefined): number {
  return clamp(Math.round(activeDelivery?.cargoIntegrity ?? 100), 0, 100);
}

export function applyCargoDamage(integrity: number, reason: CargoDamageReason): CargoDamageResult {
  const before = clamp(Math.round(integrity), 0, 100);
  const amount =
    reason === "traffic_hit" ? CARGO_FEEL_TUNING.trafficHitDamage : CARGO_FEEL_TUNING.hardCollisionDamage;
  const after = clamp(before - amount, 0, 100);
  return {
    damaged: after < before,
    before,
    after,
    amount: before - after
  };
}

export function getCargoBonusMultiplier(integrity: number): number {
  const safeIntegrity = clamp(integrity, 0, 100);
  if (safeIntegrity >= CARGO_FEEL_TUNING.fullBonusIntegrity) {
    return 1;
  }
  return safeIntegrity / CARGO_FEEL_TUNING.fullBonusIntegrity;
}

export function shouldShowCargoCareChip(
  integrity: number | null,
  surface: "world" | "interior" | "overlay",
  rivalRaceActive: boolean
): boolean {
  return integrity != null && surface === "world" && !rivalRaceActive;
}

export function calculateCargoCareAdjustment(
  delivery: DeliveryDefinition,
  condition: DeliveryCondition | undefined,
  integrity: number,
  eligible: boolean
): CargoCareAdjustment {
  const originalBonus = Math.max(0, Math.round(condition?.payoutBonus ?? 0));
  if (!eligible || originalBonus <= 0) {
    return {
      eligible: false,
      integrity: 100,
      originalBonus: 0,
      retainedBonus: 0,
      lostBonus: 0,
      bonusMultiplier: 1,
      adjustedPayoutBase: delivery.payout
    };
  }
  const safeIntegrity = clamp(Math.round(integrity), 0, 100);
  const bonusMultiplier = getCargoBonusMultiplier(safeIntegrity);
  const retainedBonus = Math.round(originalBonus * bonusMultiplier);
  const lostBonus = Math.max(0, originalBonus - retainedBonus);
  return {
    eligible: true,
    integrity: safeIntegrity,
    originalBonus,
    retainedBonus,
    lostBonus,
    bonusMultiplier,
    adjustedPayoutBase: delivery.payout + retainedBonus
  };
}

export function describeCargoCareLoss(adjustment: CargoCareAdjustment): string {
  if (!adjustment.eligible || adjustment.lostBonus <= 0) {
    return "";
  }
  return ` Box took some hits — tip cut to Rp ${adjustment.retainedBonus}.`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
