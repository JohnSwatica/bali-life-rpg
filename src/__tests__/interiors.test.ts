import { describe, expect, it } from "vitest";
import { interiorDefinitions } from "../data/interiors";
import { createInitialWorldState } from "../systems/WorldState";
import {
  getInteriorByVenueId,
  getInteriorStationActivityContext,
  getOccupiedInteriorNpcSlots,
  isInteriorPointInsideRoom
} from "../systems/interiors/InteriorState";

describe("interior definitions", () => {
  it("maps Warung Sari to the Canggu Station exterior door", () => {
    const interior = interiorDefinitions.warung_sari_interior;

    expect(interior.venueId).toBe("canggu_station");
    expect(getInteriorByVenueId("canggu_station")).toBe(interior);
  });

  it("keeps the Warung Sari entrance and exit mat inside the room rect", () => {
    const interior = interiorDefinitions.warung_sari_interior;

    expect(isInteriorPointInsideRoom(interior, interior.entrance)).toBe(true);
    expect(isInteriorPointInsideRoom(interior, interior.exitMat, interior.exitMat.radius)).toBe(true);
  });

  it("occupies Ibu Sari's counter slot when her schedule is at Canggu Station", () => {
    const world = createInitialWorldState();
    world.clock.minuteOfDay = 8 * 60;

    expect(getOccupiedInteriorNpcSlots(world, interiorDefinitions.warung_sari_interior)).toEqual([
      expect.objectContaining({ npcId: "ibu_sari" })
    ]);
  });

  it("routes the meal counter station to the existing Canggu Station activity context", () => {
    const station = interiorDefinitions.warung_sari_interior.stations.find((candidate) => candidate.id === "meal_counter");

    expect(station).toBeDefined();
    expect(station?.activityVenueId).toBe("canggu_station");
    expect(station ? getInteriorStationActivityContext(station)?.venueId : undefined).toBe("canggu_station");
  });
});
