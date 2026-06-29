import { describe, expect, it } from "vitest";
import { getQuantity } from "../systems/Inventory";
import { acceptDelivery, completeDelivery, getDeliveryOfferAvailability, pickupDelivery } from "../systems/hustle/DeliverySystem";
import { completeAct0Step, markAct0MealProgress } from "../systems/life/ActProgression";
import { getRelationship } from "../systems/relationships/RelationshipMemory";
import { createInitialWorldState } from "../systems/WorldState";

describe("Act 0 hustle and deliveries", () => {
  it("accepts, picks up, completes, and rewards the first BAKED delivery", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    const acceptedAt = 18 * 60 + 10;

    const accepted = acceptDelivery(world, "first_baked_villa_delivery", acceptedAt);
    expect(accepted).toMatchObject({ ok: true });
    expect(world.life.hustle.activeDelivery).toMatchObject({
      deliveryId: "first_baked_villa_delivery",
      stage: "accepted",
      acceptedAt,
      dueAt: acceptedAt + 90
    });

    const pickedUp = pickupDelivery(world, acceptedAt + 12);
    expect(pickedUp).toMatchObject({ ok: true });
    expect(world.life.hustle.activeDelivery).toMatchObject({
      deliveryId: "first_baked_villa_delivery",
      stage: "picked_up",
      pickedUpAt: acceptedAt + 12
    });
    expect(getQuantity(player, "delivery_pastry_box")).toBe(1);

    const completed = completeDelivery(world, acceptedAt + 35, 1);
    expect(completed).toMatchObject({ ok: true, starRating: 5, payout: 160 });
    expect(world.life.hustle.activeDelivery).toBeNull();
    expect(world.life.hustle.completedDeliveryIds).toEqual(["first_baked_villa_delivery"]);
    expect(world.life.hustle.completedDeliveryCount).toBe(1);
    expect(world.life.hustle.deliveryEarnings).toBe(160);
    expect(world.life.hustle.driverRating).toBe(3.6);
    expect(player.money).toBe(230);
    expect(getQuantity(player, "delivery_pastry_box")).toBe(0);
    expect(world.meters.energy).toBe(66);
    expect(world.reputation.tags).toContain("reliable");
    expect(world.reputation.score).toBe(62);
    expect(getRelationship(world, "npc", "ibu_sari")?.affinity).toBe(3);
    expect(getRelationship(world, "npc", "kadek")?.affinity).toBe(2);
  });

  it("keeps Act 0 progression in order through delivery, meal, and first sleep", () => {
    const world = createInitialWorldState();

    expect(world.life.actProgress.act0Step).toBe("meet_ibu_sari");
    expect(markAct0MealProgress(world, "coffee")).toBe(false);
    expect(world.questFlags.act0_coffee_done).toBeUndefined();

    expect(completeAct0Step(world, "meet_ibu_sari")).toBe(true);
    expect(world.life.actProgress.act0Step).toBe("pickup_first_delivery");
    expect(completeAct0Step(world, "pickup_first_delivery")).toBe(true);
    expect(world.life.actProgress.act0Step).toBe("dropoff_first_delivery");
    expect(completeAct0Step(world, "dropoff_first_delivery")).toBe(true);
    expect(world.life.actProgress.act0Step).toBe("buy_meal_and_coffee");

    expect(markAct0MealProgress(world, "coffee")).toBe(false);
    expect(world.life.actProgress.act0Step).toBe("buy_meal_and_coffee");
    expect(markAct0MealProgress(world, "meal")).toBe(true);
    expect(world.life.actProgress.act0Step).toBe("sleep_first_night");

    expect(completeAct0Step(world, "sleep_first_night")).toBe(true);
    expect(world.life.actProgress).toMatchObject({
      currentAct: 1,
      act0Step: "complete",
      firstDayComplete: true
    });
  });

  it("offers Act 1 deliveries only after first-day completion and rating/count gates", () => {
    const world = createInitialWorldState();
    let offers = getDeliveryOfferAvailability(world);
    expect(offers.every((offer) => !offer.available)).toBe(true);
    expect(offers[0]?.reason).toBe("Finish Ibu Sari's first-day run first.");

    world.players[world.localPlayerId].hasBike = true;
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.life.hustle.completedDeliveryCount = 1;
    world.life.hustle.driverRating = 3.6;

    offers = getDeliveryOfferAvailability(world);
    expect(offers.find((offer) => offer.delivery.id === "milk_madu_brunch_bag")).toMatchObject({ available: true });
    expect(offers.find((offer) => offer.delivery.id === "satu_satu_invoice_pouch")).toMatchObject({ available: true });
    expect(offers.find((offer) => offer.delivery.id === "finns_linen_bundle")).toMatchObject({
      available: false,
      reason: "Need 3 completed deliveries."
    });

    const accepted = acceptDelivery(world, "milk_madu_brunch_bag", 2 * 1440 + 9 * 60);
    expect(accepted.ok).toBe(true);
    expect(world.life.hustle.activeDelivery?.deliveryId).toBe("milk_madu_brunch_bag");
    expect(getDeliveryOfferAvailability(world).every((offer) => !offer.available)).toBe(true);
  });
});
