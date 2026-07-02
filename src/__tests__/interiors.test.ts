import { describe, expect, it } from "vitest";
import { interiorDefinitions } from "../data/interiors";
import { createInitialWorldState } from "../systems/WorldState";
import {
  getInteriorByVenueId,
  getInteriorStationActivityContext,
  getOccupiedInteriorNpcSlots,
  getScheduledInteriorForNpc,
  isInteriorPointInsideRoom
} from "../systems/interiors/InteriorState";

describe("interior definitions", () => {
  it("maps first-day venue interiors to their exterior doors", () => {
    expect(getInteriorByVenueId("canggu_station")).toBe(interiorDefinitions.warung_sari_interior);
    expect(getInteriorByVenueId("baked_berawa")).toBe(interiorDefinitions.baked_berawa_interior);
    expect(getInteriorByVenueId("milk_madu_berawa")).toBe(interiorDefinitions.milk_madu_interior);
    expect(getInteriorByVenueId("cheap_kos")).toBe(interiorDefinitions.cheap_kos_interior);
  });

  it("keeps entrances, exit mats, stations, and NPC slots inside each room rect", () => {
    for (const interior of Object.values(interiorDefinitions)) {
      expect(isInteriorPointInsideRoom(interior, interior.entrance)).toBe(true);
      expect(isInteriorPointInsideRoom(interior, interior.exitMat, interior.exitMat.radius)).toBe(true);

      for (const station of interior.stations) {
        expect(isInteriorPointInsideRoom(interior, station, station.radius)).toBe(true);
      }
      for (const slot of interior.npcSlots) {
        expect(isInteriorPointInsideRoom(interior, slot)).toBe(true);
      }
    }
  });

  it("occupies Ibu Sari's counter slot when her schedule is at Canggu Station", () => {
    const world = createInitialWorldState();
    world.clock.minuteOfDay = 8 * 60;

    expect(getOccupiedInteriorNpcSlots(world, interiorDefinitions.warung_sari_interior)).toEqual([
      expect.objectContaining({ npcId: "ibu_sari" })
    ]);
    expect(getScheduledInteriorForNpc(world, "ibu_sari")).toMatchObject({
      interior: expect.objectContaining({ id: "warung_sari_interior" }),
      slot: expect.objectContaining({ npcId: "ibu_sari" })
    });
  });

  it("occupies first-day cafe and bakery slots when those NPC schedules are active", () => {
    const world = createInitialWorldState();
    world.clock.minuteOfDay = 13 * 60;

    expect(getOccupiedInteriorNpcSlots(world, interiorDefinitions.baked_berawa_interior)).toEqual([
      expect.objectContaining({ npcId: "kadek" })
    ]);
    expect(getOccupiedInteriorNpcSlots(world, interiorDefinitions.milk_madu_interior)).toEqual([
      expect.objectContaining({ npcId: "ari" }),
      expect.objectContaining({ npcId: "willow" })
    ]);
    expect(getScheduledInteriorForNpc(world, "kadek")).toMatchObject({
      interior: expect.objectContaining({ id: "baked_berawa_interior" }),
      slot: expect.objectContaining({ npcId: "kadek" })
    });
  });

  it("routes interior stations to existing venue activity contexts", () => {
    const stations = [
      interiorDefinitions.warung_sari_interior.stations.find((candidate) => candidate.id === "meal_counter"),
      interiorDefinitions.baked_berawa_interior.stations.find((candidate) => candidate.id === "bakery_counter"),
      interiorDefinitions.milk_madu_interior.stations.find((candidate) => candidate.id === "cafe_table"),
      interiorDefinitions.cheap_kos_interior.stations.find((candidate) => candidate.id === "kos_room_corner")
    ];

    expect(stations.map((station) => station?.activityVenueId)).toEqual([
      "canggu_station",
      "baked_berawa",
      "milk_madu_berawa",
      "cheap_kos"
    ]);
    expect(stations.map((station) => (station ? getInteriorStationActivityContext(station)?.venueId : undefined))).toEqual([
      "canggu_station",
      "baked_berawa",
      "milk_madu_berawa",
      "cheap_kos"
    ]);
  });
});
