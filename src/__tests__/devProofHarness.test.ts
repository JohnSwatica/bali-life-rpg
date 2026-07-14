import { describe, expect, it } from "vitest";
import {
  DEV_PROOF_BOOT_STATE_NAMES,
  buildDevProofBootState
} from "../dev/DevProofStates";
import { acceptDelivery, getDeliveryOfferAvailability } from "../systems/hustle/DeliverySystem";
import { isAct0Complete } from "../systems/life/ActProgression";
import { loadWorldState, saveWorldState } from "../systems/Persistence";
import {
  ACT1_LEO_ENCOUNTER_FLAG,
  ACT1_RATE_CUT_FLAG,
  isAct1LeoEncounterPending
} from "../systems/story/Act1IncitingHook";
import {
  isKadekPriorityDriver,
  KADEK_PRIORITY_DELIVERY_ID,
  KADEK_PRIORITY_FLAG,
  KADEK_RUSH_DELIVERY_ID
} from "../systems/story/Act1KadekPriority";
import { installMemoryLocalStorage } from "./testUtils";

installMemoryLocalStorage();

describe("dev proof harness authored boot states", () => {
  it("constructs fresh Act 1 entry through the real Act 0 and rate-cut mutations", () => {
    const world = buildDevProofBootState("act0_complete");
    const player = world.players[world.localPlayerId];

    expect(isAct0Complete(world)).toBe(true);
    expect(world.life.actProgress.currentAct).toBe(1);
    expect(world.collectedPickups[ACT1_RATE_CUT_FLAG]).toBeTruthy();
    expect(isAct1LeoEncounterPending(world)).toBe(true);
    expect(world.collectedPickups[ACT1_LEO_ENCOUNTER_FLAG]).toBeUndefined();
    expect(world.life.hustle.completedDeliveryCount).toBe(1);
    expect(player.money).toBeGreaterThanOrEqual(0);
    expect(player.money).toBeLessThan(1_000);
    expect(world.life.hustle.driverRating).toBeGreaterThanOrEqual(1);
    expect(world.life.hustle.driverRating).toBeLessThanOrEqual(5);
  });

  it("constructs Leo-resolved state with the real story gate and Kadek offer", () => {
    const world = buildDevProofBootState("act1_leo_resolved");

    expect(isAct1LeoEncounterPending(world)).toBe(false);
    expect(world.collectedPickups[ACT1_LEO_ENCOUNTER_FLAG]).toBeTruthy();
    expect(isKadekPriorityDriver(world)).toBe(false);
    expect(getDeliveryOfferAvailability(world).find((offer) => offer.delivery.id === KADEK_RUSH_DELIVERY_ID)).toMatchObject({
      available: true
    });
  });

  it("constructs Steady Runner with three counted deliveries and Kadek residue", () => {
    const world = buildDevProofBootState("act1_steady_runner");
    const player = world.players[world.localPlayerId];

    expect(world.life.actProgress.currentAct).toBe(1);
    expect(world.life.hustle.completedDeliveryCount).toBe(3);
    expect(world.collectedPickups[ACT1_RATE_CUT_FLAG]).toBeTruthy();
    expect(world.collectedPickups[KADEK_PRIORITY_FLAG]).toBeTruthy();
    expect(isKadekPriorityDriver(world)).toBe(true);
    expect(world.life.hustle.completedDeliveryIds).toContain(KADEK_RUSH_DELIVERY_ID);
    expect(player.money).toBeGreaterThanOrEqual(0);
    expect(player.money).toBeLessThan(1_000);
    expect(world.life.hustle.driverRating).toBeGreaterThanOrEqual(1);
    expect(world.life.hustle.driverRating).toBeLessThanOrEqual(5);
  });

  it.each(DEV_PROOF_BOOT_STATE_NAMES)("persists and reloads %s through schema v11", (name) => {
    const world = buildDevProofBootState(name);
    saveWorldState(world);
    const loaded = loadWorldState();

    expect(loaded.schemaVersion).toBe(11);
    expect(loaded.life.actProgress).toEqual(world.life.actProgress);
    expect(loaded.life.hustle).toEqual(world.life.hustle);
    expect(loaded.collectedPickups).toEqual(world.collectedPickups);
  });

  it("rejects story-gated and unavailable deliveries through the same accept path as the API", () => {
    const leoPending = buildDevProofBootState("act0_complete");
    expect(acceptDelivery(leoPending, KADEK_RUSH_DELIVERY_ID, 2_000)).toMatchObject({
      ok: false,
      message: expect.stringContaining("Leo")
    });

    const leoResolved = buildDevProofBootState("act1_leo_resolved");
    expect(acceptDelivery(leoResolved, KADEK_PRIORITY_DELIVERY_ID, 2_000)).toMatchObject({
      ok: false,
      message: expect.stringContaining("priority list")
    });
    expect(acceptDelivery(leoResolved, "not_a_delivery", 2_000)).toMatchObject({ ok: false });
  });
});
