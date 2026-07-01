import { describe, expect, it } from "vitest";
import { discoveryLedgerEntries } from "../data/discoveryLedger";
import { itemDefinitions } from "../data/items";
import { pickupDefinitions } from "../data/map";
import { isDiscoveryLedgerEntryUnlocked } from "../systems/discovery/DiscoveryLedger";
import { createInitialWorldState } from "../systems/WorldState";

describe("Discovery Ledger", () => {
  it("defines the three seed ledger entries and their clue items", () => {
    expect(discoveryLedgerEntries.map((entry) => entry.id)).toEqual([
      "elena_notebook_1",
      "elena_sim_1",
      "codex_housing_ladder"
    ]);
    expect(itemDefinitions.elena_notebook.name).toBe("Water-Damaged Notebook");
    expect(itemDefinitions.elena_sim.name).toBe("Old SIM Card");
    expect(pickupDefinitions.find((pickup) => pickup.id === "elena-notebook-seat")).toMatchObject({
      itemId: "elena_notebook",
      label: "Something under the seat"
    });
    expect(pickupDefinitions.find((pickup) => pickup.id === "elena-sim-seat")).toMatchObject({
      itemId: "elena_sim",
      label: "A small plastic card"
    });
  });

  it("unlocks Elena fragments from collected pickup ids", () => {
    const world = createInitialWorldState();
    const notebook = discoveryLedgerEntries.find((entry) => entry.id === "elena_notebook_1");
    const sim = discoveryLedgerEntries.find((entry) => entry.id === "elena_sim_1");

    expect(notebook).toBeDefined();
    expect(sim).toBeDefined();
    expect(isDiscoveryLedgerEntryUnlocked(world, notebook!)).toBe(false);
    expect(isDiscoveryLedgerEntryUnlocked(world, sim!)).toBe(false);

    world.collectedPickups["elena-notebook-seat"] = world.clock.day;

    expect(isDiscoveryLedgerEntryUnlocked(world, notebook!)).toBe(true);
    expect(isDiscoveryLedgerEntryUnlocked(world, sim!)).toBe(false);
  });

  it("unlocks codex notes from completed Act 0 steps", () => {
    const world = createInitialWorldState();
    const housing = discoveryLedgerEntries.find((entry) => entry.id === "codex_housing_ladder");

    expect(housing).toBeDefined();
    expect(isDiscoveryLedgerEntryUnlocked(world, housing!)).toBe(false);

    world.life.actProgress.completedAct0StepIds.push("meet_ibu_sari");

    expect(isDiscoveryLedgerEntryUnlocked(world, housing!)).toBe(true);
  });
});
