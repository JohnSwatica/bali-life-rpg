import { describe, expect, it } from "vitest";
import { discoveryLedgerEntries } from "../data/discoveryLedger";
import { isDiscoveryLedgerEntryUnlocked } from "../systems/discovery/DiscoveryLedger";
import { createInitialWorldState } from "../systems/WorldState";

describe("Discovery Ledger", () => {
  it("defines the v4 investigation entries without retired collectible clues", () => {
    expect(discoveryLedgerEntries.map((entry) => entry.id)).toEqual([
      "codex_housing_ladder",
      "nusadrop_commission_squeeze",
      "nusadrop_hidden_rating_metric"
    ]);
  });

  it("unlocks codex notes from completed Act 0 steps", () => {
    const world = createInitialWorldState();
    const housing = discoveryLedgerEntries.find((entry) => entry.id === "codex_housing_ladder");

    expect(housing).toBeDefined();
    expect(isDiscoveryLedgerEntryUnlocked(world, housing!)).toBe(false);

    world.life.actProgress.completedAct0StepIds.push("meet_ibu_sari");

    expect(isDiscoveryLedgerEntryUnlocked(world, housing!)).toBe(true);
  });

  it("unlocks the NusaDrop commission investigation at the third completed delivery", () => {
    const world = createInitialWorldState();
    const commission = discoveryLedgerEntries.find((entry) => entry.id === "nusadrop_commission_squeeze");

    expect(commission).toBeDefined();
    world.life.hustle.completedDeliveryCount = 2;
    expect(isDiscoveryLedgerEntryUnlocked(world, commission!)).toBe(false);

    world.life.hustle.completedDeliveryCount = 3;
    expect(isDiscoveryLedgerEntryUnlocked(world, commission!)).toBe(true);
  });

  it("unlocks the hidden-rating investigation after a completed 4.5-star run", () => {
    const world = createInitialWorldState();
    const ratingMetric = discoveryLedgerEntries.find((entry) => entry.id === "nusadrop_hidden_rating_metric");

    expect(ratingMetric).toBeDefined();
    world.life.hustle.completedDeliveryCount = 1;
    world.life.hustle.driverRating = 4.4;
    expect(isDiscoveryLedgerEntryUnlocked(world, ratingMetric!)).toBe(false);

    world.life.hustle.driverRating = 4.5;
    expect(isDiscoveryLedgerEntryUnlocked(world, ratingMetric!)).toBe(true);
  });
});
