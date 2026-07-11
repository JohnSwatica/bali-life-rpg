import { describe, expect, it } from "vitest";
import { getDeliveryDefinition } from "../data/deliveries";
import { interiorDefinitions } from "../data/interiors";
import { getFieldObjective } from "../systems/guidance/FieldObjective";
import { completeAct0Step } from "../systems/life/ActProgression";
import { acceptDelivery, pickupDelivery } from "../systems/hustle/DeliverySystem";
import { getInteriorDeliveryPickupForStation } from "../systems/interiors/InteriorState";
import { canPlayerBeOnBike, canPlayerMountBike, resolveRequestedBikeState } from "../systems/ride/RideMode";
import { createInitialWorldState } from "../systems/WorldState";

describe("ride mode", () => {
  it("keeps every interior state foot-only", () => {
    expect(canPlayerBeOnBike("interior", true, "warung_sari_interior")).toBe(false);
    expect(canPlayerMountBike("interior", true, "warung_sari_interior")).toBe(false);
    expect(resolveRequestedBikeState(true, "interior", true, "warung_sari_interior")).toBe(false);
    expect(resolveRequestedBikeState(true, "world", true, "warung_sari_interior")).toBe(false);
  });

  it("separates scooter ownership from mounting across an interior visit", () => {
    const hasBike = true;

    const afterEntering = resolveRequestedBikeState(false, "interior", hasBike, "warung_sari_interior");
    const afterIndoorGrant = resolveRequestedBikeState(true, "interior", hasBike, "warung_sari_interior");
    const afterExiting = resolveRequestedBikeState(false, "world", hasBike, null);
    const afterWorldRemount = resolveRequestedBikeState(true, "world", hasBike, null);

    expect(afterEntering).toBe(false);
    expect(afterIndoorGrant).toBe(false);
    expect(afterExiting).toBe(false);
    expect(canPlayerMountBike("world", hasBike, null)).toBe(true);
    expect(afterWorldRemount).toBe(true);
  });

  it("hands the first BAKED pickup from an on-foot interior to a rideable exterior dropoff", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    const baked = interiorDefinitions.baked_berawa_interior;
    const counter = baked.stations.find((station) => station.id === "bakery_counter");
    const delivery = getDeliveryDefinition("first_baked_villa_delivery");

    player.hasBike = true;
    player.onBike = resolveRequestedBikeState(true, "interior", player.hasBike, baked.id);
    expect(player.onBike).toBe(false);
    expect(counter).toBeDefined();
    expect(delivery).toBeDefined();
    expect(acceptDelivery(world, delivery!.id, 8 * 60)).toMatchObject({ ok: true });
    expect(completeAct0Step(world, "meet_ibu_sari")).toBe(true);
    expect(getInteriorDeliveryPickupForStation(world, counter!)).toMatchObject({ deliveryId: delivery!.id });

    expect(pickupDelivery(world, 8 * 60 + 8)).toMatchObject({ ok: true });
    expect(completeAct0Step(world, "pickup_first_delivery")).toBe(true);
    expect(getFieldObjective(world).targets).toEqual([
      { type: "point", id: delivery!.dropoffId, label: delivery!.dropoffLabel, ...delivery!.dropoffPoint }
    ]);

    player.onBike = resolveRequestedBikeState(false, "world", player.hasBike, null);
    expect(player.onBike).toBe(false);
    player.onBike = resolveRequestedBikeState(true, "world", player.hasBike, null);
    expect(player.onBike).toBe(true);
  });
});
