import { PAYOUT_FEEL_TUNING } from "../../tuning/FeelTuning";

export type PayoutCelebrationTier = "standard" | "clean" | "great";

export interface PayoutCountUpStep {
  elapsedMs: number;
  value: number;
}

export interface PayoutCelebrationInput {
  payout: number;
  starRating: number;
  previousDriverRating: number;
  nextDriverRating: number;
  previousMoney: number;
  nextMoney: number;
  rentAmount: number;
  performanceScore?: number;
}

export interface PayoutCelebrationSpec {
  payout: number;
  starRating: number;
  previousDriverRating: number;
  nextDriverRating: number;
  ratingMoved: boolean;
  rentMilestone: boolean;
  tier: PayoutCelebrationTier;
  countUpDurationMs: number;
  totalDurationMs: number;
  scalePunch: number;
  countUpSteps: PayoutCountUpStep[];
}

export function getPayoutCelebrationTier(performanceScore: number | undefined): PayoutCelebrationTier {
  if (performanceScore == null) {
    return "standard";
  }
  if (performanceScore >= 0.88) {
    return "great";
  }
  if (performanceScore >= 0.72) {
    return "clean";
  }
  return "standard";
}

export function buildPayoutCountUpSteps(
  payout: number,
  durationMs: number = PAYOUT_FEEL_TUNING.countUpDurationMs,
  stepCount: number = PAYOUT_FEEL_TUNING.countUpStepCount
): PayoutCountUpStep[] {
  const safePayout = Math.max(0, Math.round(payout));
  const safeSteps = Math.max(1, Math.round(stepCount));
  return Array.from({ length: safeSteps + 1 }, (_unused, index) => {
    const progress = index / safeSteps;
    const eased = 1 - Math.pow(1 - progress, 3);
    return {
      elapsedMs: Math.round(durationMs * progress),
      value: index === safeSteps ? safePayout : Math.round(safePayout * eased)
    };
  });
}

export function didCrossRentThreshold(previousMoney: number, nextMoney: number, rentAmount: number): boolean {
  return rentAmount > 0 && previousMoney < rentAmount && nextMoney >= rentAmount;
}

export function getChapterCutsceneDelayMs(
  previousAct: number,
  currentAct: number,
  celebrationDurationMs: number
): number {
  return previousAct < 2 && currentAct >= 2 ? Math.max(0, celebrationDurationMs) : 0;
}

export function buildPayoutCelebrationSpec(input: PayoutCelebrationInput): PayoutCelebrationSpec {
  const tier = getPayoutCelebrationTier(input.performanceScore);
  const scalePunch =
    tier === "great"
      ? PAYOUT_FEEL_TUNING.greatScalePunch
      : tier === "clean"
        ? PAYOUT_FEEL_TUNING.cleanScalePunch
        : PAYOUT_FEEL_TUNING.standardScalePunch;
  return {
    payout: Math.max(0, Math.round(input.payout)),
    starRating: input.starRating,
    previousDriverRating: input.previousDriverRating,
    nextDriverRating: input.nextDriverRating,
    ratingMoved: Math.abs(input.nextDriverRating - input.previousDriverRating) >= 0.05,
    rentMilestone: didCrossRentThreshold(input.previousMoney, input.nextMoney, input.rentAmount),
    tier,
    countUpDurationMs: PAYOUT_FEEL_TUNING.countUpDurationMs,
    totalDurationMs: PAYOUT_FEEL_TUNING.totalDurationMs,
    scalePunch,
    countUpSteps: buildPayoutCountUpSteps(input.payout)
  };
}
