import { describe, expect, it } from "vitest";
import { getDeliveryCondition, getDeliveryDefinition } from "../data/deliveries";
import {
  applyCargoDamage,
  calculateCargoCareAdjustment,
  getCargoBonusMultiplier,
  isCargoCareEligible
} from "../systems/ride/CargoCare";

describe("cargo care", () => {
  it("applies gentle, clamped cargo damage from traffic hits and hard collisions", () => {
    expect(applyCargoDamage(100, "traffic_hit")).toEqual({
      damaged: true,
      before: 100,
      after: 82,
      amount: 18
    });
    expect(applyCargoDamage(10, "hard_collision")).toEqual({
      damaged: true,
      before: 10,
      after: 0,
      amount: 10
    });
    expect(applyCargoDamage(0, "traffic_hit")).toEqual({
      damaged: false,
      before: 0,
      after: 0,
      amount: 0
    });
  });

  it("keeps full bonus at 70 integrity and scales linearly below it", () => {
    expect(getCargoBonusMultiplier(100)).toBe(1);
    expect(getCargoBonusMultiplier(70)).toBe(1);
    expect(getCargoBonusMultiplier(35)).toBe(0.5);
    expect(getCargoBonusMultiplier(0)).toBe(0);
  });

  it("never reduces base payout; only condition bonus margin is at risk", () => {
    const delivery = getDeliveryDefinition("milk_madu_brunch_bag");
    expect(delivery).toBeDefined();
    const condition = getDeliveryCondition(delivery!, "villa_tip");
    expect(condition).toBeDefined();

    const full = calculateCargoCareAdjustment(delivery!, condition, 100, true);
    const rattled = calculateCargoCareAdjustment(delivery!, condition, 35, true);
    const ruinedBonus = calculateCargoCareAdjustment(delivery!, condition, 0, true);

    expect(full.adjustedPayoutBase).toBe(delivery!.payout + condition!.payoutBonus!);
    expect(rattled.retainedBonus).toBe(Math.round(condition!.payoutBonus! * 0.5));
    expect(rattled.adjustedPayoutBase).toBe(delivery!.payout + rattled.retainedBonus);
    expect(ruinedBonus.retainedBonus).toBe(0);
    expect(ruinedBonus.adjustedPayoutBase).toBe(delivery!.payout);
  });

  it("excludes Act 0 tutorial deliveries and no-bonus deliveries from cargo care", () => {
    const tutorial = getDeliveryDefinition("first_baked_villa_delivery");
    const conditioned = getDeliveryDefinition("milk_madu_brunch_bag");
    expect(tutorial).toBeDefined();
    expect(conditioned).toBeDefined();
    const condition = getDeliveryCondition(conditioned!, "villa_tip");

    expect(isCargoCareEligible(0, tutorial!, undefined)).toBe(false);
    expect(isCargoCareEligible(1, tutorial!, condition)).toBe(false);
    expect(isCargoCareEligible(1, conditioned!, undefined)).toBe(false);
    expect(isCargoCareEligible(1, conditioned!, condition)).toBe(true);
  });
});
