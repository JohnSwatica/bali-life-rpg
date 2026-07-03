import { describe, expect, it } from "vitest";
import { getMorningHandCards, shouldShowMorningHand } from "../systems/hustle/MorningHand";
import { createInitialWorldState } from "../systems/WorldState";

function prepareAct1Morning() {
  const world = createInitialWorldState();
  world.life.actProgress.act0Step = "complete";
  world.life.actProgress.firstDayComplete = true;
  world.life.actProgress.currentAct = 1;
  world.players[world.localPlayerId].hasBike = true;
  world.players[world.localPlayerId].onBike = true;
  world.clock.day = 2;
  world.clock.minuteOfDay = 7 * 60;
  world.life.hustle.completedDeliveryCount = 1;
  world.life.hustle.driverRating = 3.6;
  world.life.hustle.deliveryEarnings = 160;
  return world;
}

describe("Act 1 morning hand", () => {
  it("appears only for Act 1 mornings without an active delivery", () => {
    const world = prepareAct1Morning();

    expect(shouldShowMorningHand(world)).toBe(true);

    world.life.hustle.activeDelivery = {
      deliveryId: "milk_madu_brunch_bag",
      stage: "accepted",
      acceptedAt: 7 * 60,
      dueAt: 8 * 60
    };
    expect(shouldShowMorningHand(world)).toBe(false);

    world.life.hustle.activeDelivery = null;
    world.life.actProgress.currentAct = 2;
    expect(shouldShowMorningHand(world)).toBe(false);
  });

  it("offers available board runs as the primary morning decisions", () => {
    const world = prepareAct1Morning();
    const cards = getMorningHandCards(world, 2 * 1440 + 7 * 60);

    expect(cards.length).toBeGreaterThanOrEqual(3);
    expect(cards[0]).toMatchObject({
      kind: "delivery",
      action: "accept_delivery",
      deliveryId: "milk_madu_brunch_bag",
      available: true
    });
    expect(cards.some((card) => card.title.includes("Satu-Satu"))).toBe(true);
  });

  it("surfaces repair and the no-questions package without remote-resolving them", () => {
    const world = prepareAct1Morning();
    world.players[world.localPlayerId].bikeCondition = 35;
    world.players[world.localPlayerId].money = 80;
    world.life.hustle.completedDeliveryCount = 3;
    world.opportunities.live.push({
      id: "no_questions_package:test",
      templateId: "no_questions_package",
      status: "live",
      spawnedAt: 2 * 1440 + 7 * 60,
      expiresAt: 2 * 1440 + 11 * 60,
      locationVenueId: "bali_family_rental_scooter"
    });

    const cards = getMorningHandCards(world, 2 * 1440 + 7 * 60);

    expect(cards).toContainEqual(
      expect.objectContaining({
        kind: "repair",
        action: "close",
        venueId: "bali_family_rental_scooter"
      })
    );
    expect(cards).toContainEqual(
      expect.objectContaining({
        kind: "opportunity",
        action: "track_opportunity",
        opportunityId: "no_questions_package:test"
      })
    );
  });
});
