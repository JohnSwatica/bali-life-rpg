import { describe, expect, it } from "vitest";
import { interiorDefinitions } from "../data/interiors";
import { createInitialWorldState } from "../systems/WorldState";
import { acceptDelivery, pickupDelivery } from "../systems/hustle/DeliverySystem";
import { calculateInteriorCameraBounds, calculateInteriorCameraZoom } from "../systems/interiors/InteriorCamera";
import { getFieldObjective } from "../systems/guidance/FieldObjective";
import { scaleDistance } from "../systems/map/WorldScale";
import {
  getInteriorByVenueId,
  getInteriorDeliveryPickupForStation,
  getInteriorStationActivityContext,
  getOccupiedInteriorNpcSlots,
  getPrimaryInteriorStationForVenue,
  getScheduledInteriorForNpc,
  INTERIOR_NPC_INTERACTION_RADIUS,
  isInteriorPointInsideRoom,
  resolveInteriorObjectiveTargets
} from "../systems/interiors/InteriorState";

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

describe("interior definitions", () => {
  it("maps first-day venue interiors to their exterior doors", () => {
    expect(getInteriorByVenueId("canggu_station")).toBe(interiorDefinitions.warung_sari_interior);
    expect(getInteriorByVenueId("baked_berawa")).toBe(interiorDefinitions.baked_berawa_interior);
    expect(getInteriorByVenueId("milk_madu_berawa")).toBe(interiorDefinitions.milk_madu_interior);
    expect(getInteriorByVenueId("cheap_kos")).toBe(interiorDefinitions.cheap_kos_interior);
    expect(getInteriorByVenueId("bali_family_rental_scooter")).toBe(interiorDefinitions.scooter_rental_interior);
    expect(getInteriorByVenueId("satu_satu_coffee")).toBe(interiorDefinitions.satu_satu_interior);
    expect(getInteriorByVenueId("bungalow_living")).toBe(interiorDefinitions.bungalow_living_interior);
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

  it("keeps interior stations, entrances, and exits out of NPC talk radius", () => {
    const stationClearance = scaleDistance(45);
    const matClearance = scaleDistance(40);

    for (const interior of Object.values(interiorDefinitions)) {
      for (const slot of interior.npcSlots) {
        expect(distance(interior.entrance, slot), `${interior.id} entrance vs ${slot.npcId}`).toBeGreaterThanOrEqual(matClearance);
        expect(distance(interior.exitMat, slot), `${interior.id} exit vs ${slot.npcId}`).toBeGreaterThanOrEqual(matClearance);

        for (const station of interior.stations) {
          expect(distance(station, slot), `${interior.id} ${station.id} vs ${slot.npcId}`).toBeGreaterThanOrEqual(stationClearance);
        }
      }
    }
  });

  it("calculates an interior camera zoom that fills the viewport without exceeding the pixel-art cap", () => {
    expect(calculateInteriorCameraZoom(1280, 720, interiorDefinitions.warung_sari_interior)).toBeCloseTo(2.5875);
    expect(calculateInteriorCameraZoom(390, 844, interiorDefinitions.warung_sari_interior)).toBeCloseTo(0.934375);
    expect(calculateInteriorCameraZoom(2560, 1440, interiorDefinitions.warung_sari_interior)).toBe(2.8);
  });

  it("centers small interiors in a viewport-sized camera bounds rect", () => {
    const interior = interiorDefinitions.cheap_kos_interior;
    const zoom = calculateInteriorCameraZoom(1280, 800, interior);
    const bounds = calculateInteriorCameraBounds(1280, 800, zoom, interior);

    expect(zoom).toBe(2.8);
    expect(bounds.width).toBeCloseTo(1280 / zoom);
    expect(bounds.height).toBeCloseTo(800 / zoom);
    expect(bounds.x).toBeCloseTo(interior.origin.x - (bounds.width - interior.width) / 2);
    expect(bounds.y).toBeCloseTo(interior.origin.y - (bounds.height - interior.height) / 2);
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

  it("occupies authored interior slots when those NPC schedules are active", () => {
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

    world.clock.minuteOfDay = 8 * 60;
    expect(getOccupiedInteriorNpcSlots(world, interiorDefinitions.scooter_rental_interior)).toEqual([
      expect.objectContaining({ npcId: "rio" })
    ]);
    expect(getScheduledInteriorForNpc(world, "rio")).toMatchObject({
      interior: expect.objectContaining({ id: "scooter_rental_interior" }),
      slot: expect.objectContaining({ npcId: "rio" })
    });

    world.clock.minuteOfDay = 16.5 * 60;
    expect(getOccupiedInteriorNpcSlots(world, interiorDefinitions.satu_satu_interior)).toEqual([
      expect.objectContaining({ npcId: "kadek" }),
      expect.objectContaining({ npcId: "made" }),
      expect.objectContaining({ npcId: "pak_bagus" })
    ]);

    world.clock.minuteOfDay = 10 * 60;
    expect(getOccupiedInteriorNpcSlots(world, interiorDefinitions.bungalow_living_interior)).toEqual([
      expect.objectContaining({ npcId: "made" })
    ]);
    expect(getScheduledInteriorForNpc(world, "made")).toMatchObject({
      interior: expect.objectContaining({ id: "bungalow_living_interior" }),
      slot: expect.objectContaining({ npcId: "made" })
    });
  });

  it("routes interior stations to existing venue activity contexts", () => {
    const stations = [
      interiorDefinitions.warung_sari_interior.stations.find((candidate) => candidate.id === "meal_counter"),
      interiorDefinitions.baked_berawa_interior.stations.find((candidate) => candidate.id === "bakery_counter"),
      interiorDefinitions.milk_madu_interior.stations.find((candidate) => candidate.id === "cafe_table"),
      interiorDefinitions.cheap_kos_interior.stations.find((candidate) => candidate.id === "kos_room_corner"),
      interiorDefinitions.scooter_rental_interior.stations.find((candidate) => candidate.id === "scooter_counter"),
      interiorDefinitions.satu_satu_interior.stations.find((candidate) => candidate.id === "focus_table"),
      interiorDefinitions.bungalow_living_interior.stations.find((candidate) => candidate.id === "design_counter")
    ];

    expect(stations.map((station) => station?.activityVenueId)).toEqual([
      "canggu_station",
      "baked_berawa",
      "milk_madu_berawa",
      "cheap_kos",
      "bali_family_rental_scooter",
      "satu_satu_coffee",
      "bungalow_living"
    ]);
    expect(stations.map((station) => (station ? getInteriorStationActivityContext(station)?.venueId : undefined))).toEqual([
      "canggu_station",
      "baked_berawa",
      "milk_madu_berawa",
      "cheap_kos",
      "bali_family_rental_scooter",
      "satu_satu_coffee",
      "bungalow_living"
    ]);
  });

  it("resolves venue objectives to the matching interior station while inside", () => {
    expect(getPrimaryInteriorStationForVenue(interiorDefinitions.baked_berawa_interior, "baked_berawa")).toMatchObject({
      id: "bakery_counter",
      activityVenueId: "baked_berawa"
    });
    expect(getPrimaryInteriorStationForVenue(interiorDefinitions.baked_berawa_interior, "milk_madu_berawa")).toBeUndefined();
  });

  it("resolves the first Act 0 objective to Ibu Sari's occupied Warung slot", () => {
    const world = createInitialWorldState();
    const interior = interiorDefinitions.warung_sari_interior;
    world.clock.minuteOfDay = 8 * 60;

    const [target] = resolveInteriorObjectiveTargets(world, interior, getFieldObjective(world).targets);
    const slot = getOccupiedInteriorNpcSlots(world, interior).find((candidate) => candidate.npcId === "ibu_sari");

    expect(slot).toBeDefined();
    expect(target).toMatchObject({
      id: "act0_ibu_sari",
      type: "npc",
      x: slot!.x,
      y: slot!.y,
      radius: INTERIOR_NPC_INTERACTION_RADIUS
    });
    expect(distance(target, slot!)).toBeLessThanOrEqual(INTERIOR_NPC_INTERACTION_RADIUS);
  });

  it("retargets an exterior delivery objective to the current interior exit mat", () => {
    const world = createInitialWorldState();
    const interior = interiorDefinitions.warung_sari_interior;
    world.life.actProgress.act0Step = "pickup_first_delivery";

    const targets = resolveInteriorObjectiveTargets(world, interior, getFieldObjective(world).targets);

    expect(targets).toEqual([
      {
        id: `interior_exit:${interior.id}`,
        label: `Leave ${interior.name}`,
        x: interior.exitMat.x,
        y: interior.exitMat.y,
        radius: interior.exitMat.radius,
        type: "point"
      }
    ]);
  });

  it("surfaces active delivery pickups at matching interior stations", () => {
    const world = createInitialWorldState();
    const station = interiorDefinitions.baked_berawa_interior.stations.find((candidate) => candidate.id === "bakery_counter");

    expect(station).toBeDefined();
    expect(getInteriorDeliveryPickupForStation(world, station!)).toBeUndefined();
    expect(acceptDelivery(world, "first_baked_villa_delivery", 8 * 60)).toMatchObject({ ok: true });

    expect(getInteriorDeliveryPickupForStation(world, station!)).toEqual({
      deliveryId: "first_baked_villa_delivery",
      label: "Pick up sealed pastries at BAKED."
    });

    expect(pickupDelivery(world, 8 * 60 + 4)).toMatchObject({ ok: true });
    expect(getInteriorDeliveryPickupForStation(world, station!)).toBeUndefined();
  });
});
