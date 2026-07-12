import { describe, expect, it } from "vitest";
import { DELIVERY_RIDE_FEEL_TUNING } from "../tuning/FeelTuning";
import {
  applyDeliveryHazardContact,
  calculateDeliveryRunScore,
  createDeliveryRideRun,
  getDeliveryHazards,
  getDeliveryRideDensity,
  getHazardVisibilityDistance
} from "../systems/ride/DeliveryRideMode";
import { applyCargoDamage } from "../systems/ride/CargoCare";

describe("continuous delivery riding", () => {
  it("authors a forgiving Ibu Sari hook run and denser Act 1 board runs from one street knob", () => {
    const tutorialDensity = getDeliveryRideDensity(0, "act0_ibu_milk_madu_catering");
    const act1Density = getDeliveryRideDensity(1, "milk_madu_brunch_bag");

    expect(tutorialDensity).toBe(DELIVERY_RIDE_FEEL_TUNING.streets.jl_pantai_berawa.tutorialDensity);
    expect(act1Density).toBe(DELIVERY_RIDE_FEEL_TUNING.streets.jl_pantai_berawa.act1Density);
    expect(getDeliveryHazards(0, "act0_ibu_milk_madu_catering").length).toBeLessThan(
      getDeliveryHazards(1, "milk_madu_brunch_bag").length
    );
  });

  it("scores avoidance, near-misses, contacts, and time while retaining a fail-forward floor", () => {
    const clean = calculateDeliveryRunScore({
      elapsedMs: 28_000,
      hazardsSpawned: 10,
      hazardsAvoided: 10,
      nearMisses: 3,
      contacts: 0
    });
    const rough = calculateDeliveryRunScore({
      elapsedMs: 65_000,
      hazardsSpawned: 10,
      hazardsAvoided: 2,
      nearMisses: 0,
      contacts: 5
    });

    expect(clean).toBeGreaterThan(rough);
    expect(clean).toBeLessThanOrEqual(1);
    expect(rough).toBe(DELIVERY_RIDE_FEEL_TUNING.score.failForwardFloor);
    expect(calculateDeliveryRunScore(createDeliveryRideRun())).toBeGreaterThanOrEqual(
      DELIVERY_RIDE_FEEL_TUNING.score.failForwardFloor
    );
  });

  it("wires hazard contact to cargo damage and a speed stumble without a fail state", () => {
    const contact = applyDeliveryHazardContact();
    const cargo = applyCargoDamage(100, contact.cargoReason);

    expect(contact.speedMultiplier).toBeGreaterThan(0);
    expect(contact.speedMultiplier).toBeLessThan(1);
    expect(cargo).toMatchObject({ damaged: true, after: 82 });
  });

  it("reduces hazard visibility distance slightly at night", () => {
    expect(getHazardVisibilityDistance(true)).toBeLessThan(getHazardVisibilityDistance(false));
    expect(getHazardVisibilityDistance(true)).toBeGreaterThan(getHazardVisibilityDistance(false) * 0.7);
  });

  it("keeps the Leo ghost-race route compatible with the same live hazard field", () => {
    expect(getDeliveryHazards(1, "leo_rival_race").length).toBe(
      DELIVERY_RIDE_FEEL_TUNING.streets.jl_pantai_berawa.baseHazardCount
    );
  });
});
