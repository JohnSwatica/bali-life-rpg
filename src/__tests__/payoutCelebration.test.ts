import { describe, expect, it } from "vitest";
import {
  buildPayoutCelebrationSpec,
  buildPayoutCountUpSteps,
  didCrossRentThreshold,
  getChapterCutsceneDelayMs,
  getPayoutCelebrationTier
} from "../systems/animation/PayoutCelebration";

describe("payout celebration spec", () => {
  it("selects a subtle celebration tier from ride performance", () => {
    expect(getPayoutCelebrationTier(undefined)).toBe("standard");
    expect(getPayoutCelebrationTier(0.65)).toBe("standard");
    expect(getPayoutCelebrationTier(0.72)).toBe("clean");
    expect(getPayoutCelebrationTier(0.88)).toBe("great");
  });

  it("builds a monotonic count-up that reaches the exact payout", () => {
    const steps = buildPayoutCountUpSteps(137, 600, 6);

    expect(steps[0]).toEqual({ elapsedMs: 0, value: 0 });
    expect(steps.at(-1)).toEqual({ elapsedMs: 600, value: 137 });
    for (let index = 1; index < steps.length; index += 1) {
      expect(steps[index].elapsedMs).toBeGreaterThan(steps[index - 1].elapsedMs);
      expect(steps[index].value).toBeGreaterThanOrEqual(steps[index - 1].value);
    }
  });

  it("detects the rent-affordability crossing from plain money inputs", () => {
    expect(didCrossRentThreshold(120, 450, 450)).toBe(true);
    expect(didCrossRentThreshold(450, 520, 450)).toBe(false);
    expect(didCrossRentThreshold(100, 440, 450)).toBe(false);
    expect(didCrossRentThreshold(0, 10, 0)).toBe(false);
  });

  it("lets the payout finish before the Act 2 chapter card begins", () => {
    expect(getChapterCutsceneDelayMs(1, 2, 1180)).toBe(1180);
    expect(getChapterCutsceneDelayMs(1, 1, 1180)).toBe(0);
    expect(getChapterCutsceneDelayMs(2, 2, 1180)).toBe(0);
  });

  it("summarizes payout, rating motion, tier, and rent milestone", () => {
    const spec = buildPayoutCelebrationSpec({
      payout: 156,
      starRating: 4.8,
      previousDriverRating: 3.9,
      nextDriverRating: 4.1,
      previousMoney: 320,
      nextMoney: 476,
      rentAmount: 450,
      performanceScore: 0.91
    });

    expect(spec.tier).toBe("great");
    expect(spec.scalePunch).toBeGreaterThan(1.2);
    expect(spec.ratingMoved).toBe(true);
    expect(spec.rentMilestone).toBe(true);
    expect(spec.totalDurationMs).toBeLessThanOrEqual(1200);
  });
});
