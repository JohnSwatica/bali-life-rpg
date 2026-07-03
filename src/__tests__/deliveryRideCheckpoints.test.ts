import { describe, expect, it } from "vitest";
import { venueMapNodes } from "../data/authoredStreetLayout";
import { getDeliveryDefinition } from "../data/deliveries";
import {
  getRideCheckpointsForDelivery,
  pickOutcomeToast,
  resolveRideCheckpointPosition
} from "../systems/ride/DeliveryRideCheckpoints";
import { acceptDelivery, completeDelivery, pickupDelivery } from "../systems/hustle/DeliverySystem";
import { createInitialWorldState } from "../systems/WorldState";

describe("DeliveryRideCheckpoints", () => {
  it("returns exactly two checkpoints for the Act 0 tutorial delivery", () => {
    const checkpoints = getRideCheckpointsForDelivery("first_baked_villa_delivery");
    expect(checkpoints).toHaveLength(2);
  });

  it("gives every repeatable board delivery at least one route beat", () => {
    const boardDeliveryIds = [
      "milk_madu_brunch_bag",
      "satu_satu_invoice_pouch",
      "nude_cold_bag_run",
      "beach_wristband_pouch",
      "finns_linen_bundle"
    ];

    for (const deliveryId of boardDeliveryIds) {
      expect(getRideCheckpointsForDelivery(deliveryId).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("adds condition-specific route beats only for the matching condition", () => {
    expect(getRideCheckpointsForDelivery("satu_satu_invoice_pouch").map((checkpoint) => checkpoint.id)).not.toContain(
      "satu_satu_invoice_rain_slick"
    );
    expect(getRideCheckpointsForDelivery("satu_satu_invoice_pouch", "rain_window").map((checkpoint) => checkpoint.id)).toContain(
      "satu_satu_invoice_rain_slick"
    );
  });

  it("resolves each checkpoint to a position strictly between pickup and dropoff", () => {
    const delivery = getDeliveryDefinition("first_baked_villa_delivery");
    const pickup = venueMapNodes.find((node) => node.venueId === delivery?.pickupVenueId);
    expect(delivery).toBeDefined();
    expect(pickup).toBeDefined();

    const checkpoints = getRideCheckpointsForDelivery("first_baked_villa_delivery");
    for (const checkpoint of checkpoints) {
      const position = resolveRideCheckpointPosition(checkpoint);
      expect(position).not.toBeNull();
      expect(position!.x).toBeGreaterThan(Math.min(pickup!.x, delivery!.dropoffPoint.x));
      expect(position!.x).toBeLessThan(Math.max(pickup!.x, delivery!.dropoffPoint.x));
      expect(position!.y).toBeGreaterThan(Math.min(pickup!.y, delivery!.dropoffPoint.y));
      expect(position!.y).toBeLessThan(Math.max(pickup!.y, delivery!.dropoffPoint.y));
    }
  });

  it("picks the correct outcome tier by score", () => {
    const [checkpoint] = getRideCheckpointsForDelivery("first_baked_villa_delivery");
    expect(pickOutcomeToast(checkpoint, 0.95)).toBe(checkpoint.outcomeToasts.high);
    expect(pickOutcomeToast(checkpoint, 0.6)).toBe(checkpoint.outcomeToasts.mid);
    expect(pickOutcomeToast(checkpoint, 0.1)).toBe(checkpoint.outcomeToasts.low);
  });

  it("keeps the tutorial delivery fail-forward at every ride performance score", () => {
    const payouts: number[] = [];
    for (const performanceScore of [0, 0.25, 0.5, 0.75, 1]) {
      const world = createInitialWorldState();
      const now = 8 * 60;
      expect(acceptDelivery(world, "first_baked_villa_delivery", now)).toMatchObject({ ok: true });
      expect(pickupDelivery(world, now + 8)).toMatchObject({ ok: true });
      const result = completeDelivery(world, now + 35, performanceScore);

      expect(result.ok).toBe(true);
      expect(result.starRating).toBeGreaterThanOrEqual(1);
      expect(result.payout).toBeGreaterThan(0);
      expect(world.life.hustle.activeDelivery).toBeNull();
      expect(world.life.hustle.completedDeliveryIds).toContain("first_baked_villa_delivery");
      payouts.push(result.payout!);
    }
    expect(payouts[0]).toBeLessThan(payouts[payouts.length - 1]);
  });
});
