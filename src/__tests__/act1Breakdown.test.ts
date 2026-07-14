import { describe, expect, it } from "vitest";
import { getDeliveryDefinition } from "../data/deliveries";
import { createInitialWorldState } from "../systems/WorldState";
import { getAmbientNpcLine } from "../systems/dialogue/DialoguePresentation";
import { getFieldObjective } from "../systems/guidance/FieldObjective";
import {
  acceptDelivery,
  completeDelivery,
  getDeliveryOfferAvailability,
  pickupDelivery
} from "../systems/hustle/DeliverySystem";
import {
  getScooterRepairStatus,
  repairScooter
} from "../systems/hustle/HustleEconomy";
import { getHustleNextStep } from "../systems/hustle/HustleGoals";
import { getAct1MoveOutReadiness } from "../systems/hustle/HustleMilestones";
import {
  ACT1_BREAKDOWN_ARMED_DELIVERY_FLAG,
  ACT1_BREAKDOWN_DRIVER_RATING,
  ACT1_BREAKDOWN_FLAG,
  ACT1_BREAKDOWN_LEO_MESSAGE_ID,
  ACT1_BREAKDOWN_MIN_RIDE_MS,
  isAct1BreakdownArmed,
  isAct1BreakdownPushActive,
  isAct1ScooterBlown,
  shouldTriggerAct1Breakdown,
  triggerAct1Breakdown
} from "../systems/story/Act1Breakdown";
import {
  KADEK_PRIORITY_DELIVERY_ID,
  KADEK_PRIORITY_FLAG
} from "../systems/story/Act1KadekPriority";
import {
  getMadeRoomGoalState,
  MADE_ROOM_OFFER_SCENE_FLAG
} from "../systems/story/Act1MadeRoomOffer";
import type { WorldState } from "../types";

const BREAKDOWN_DELIVERY_ID = "milk_madu_brunch_bag";

function act1BoardWorld(): WorldState {
  const world = createInitialWorldState();
  const player = world.players[world.localPlayerId];
  world.life.actProgress.currentAct = 1;
  world.life.actProgress.firstDayComplete = true;
  world.life.actProgress.act0Step = "complete";
  world.life.hustle.completedDeliveryCount = 3;
  world.life.hustle.deliveryEarnings = 420;
  world.life.hustle.driverRating = 4.4;
  player.hasBike = true;
  player.onBike = true;
  player.bikeCondition = 72;
  player.money = 1_000;
  return world;
}

function addBothTurningPoints(world: WorldState): void {
  world.collectedPickups[KADEK_PRIORITY_FLAG] = 700;
  world.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG] = 710;
}

function startAndTriggerBreakdown(world = act1BoardWorld(), now = 800): WorldState {
  addBothTurningPoints(world);
  expect(acceptDelivery(world, BREAKDOWN_DELIVERY_ID, now)).toMatchObject({ ok: true });
  expect(pickupDelivery(world, now + 8)).toMatchObject({ ok: true });
  world.players[world.localPlayerId].onBike = true;
  world.life.hustle.activeDelivery!.rideRun!.elapsedMs = ACT1_BREAKDOWN_MIN_RIDE_MS;
  const dropoff = getDeliveryDefinition(BREAKDOWN_DELIVERY_ID)!.dropoffPoint;
  expect(
    triggerAct1Breakdown(world, {
      x: dropoff.x + 500,
      y: dropoff.y,
      now: now + 20
    })
  ).toMatchObject({ fired: true });
  return world;
}

describe("Act 1 Beat 3 — authored transmission breakdown", () => {
  it("arms only the first board run accepted after both turning points", () => {
    const beforeMade = act1BoardWorld();
    beforeMade.collectedPickups[KADEK_PRIORITY_FLAG] = 700;
    expect(acceptDelivery(beforeMade, BREAKDOWN_DELIVERY_ID, 800)).toMatchObject({ ok: true });
    expect(isAct1BreakdownArmed(beforeMade)).toBe(false);

    beforeMade.life.hustle.activeDelivery = null;
    beforeMade.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG] = 810;
    expect(acceptDelivery(beforeMade, BREAKDOWN_DELIVERY_ID, 820)).toMatchObject({ ok: true });
    expect(isAct1BreakdownArmed(beforeMade)).toBe(true);
    expect(beforeMade.questFlags[ACT1_BREAKDOWN_ARMED_DELIVERY_FLAG]).toBe(BREAKDOWN_DELIVERY_ID);

    const nonBoard = act1BoardWorld();
    addBothTurningPoints(nonBoard);
    expect(acceptDelivery(nonBoard, "first_baked_villa_delivery", 800)).toMatchObject({ ok: true });
    expect(isAct1BreakdownArmed(nonBoard)).toBe(false);
  });

  it("fires once in the scripted distance band, ruins cargo, and enters push state", () => {
    const world = act1BoardWorld();
    addBothTurningPoints(world);
    expect(acceptDelivery(world, BREAKDOWN_DELIVERY_ID, 800)).toMatchObject({ ok: true });
    expect(pickupDelivery(world, 808)).toMatchObject({ ok: true });
    const active = world.life.hustle.activeDelivery!;
    const dropoff = getDeliveryDefinition(BREAKDOWN_DELIVERY_ID)!.dropoffPoint;
    const point = { x: dropoff.x + 500, y: dropoff.y };
    world.players[world.localPlayerId].onBike = true;

    active.rideRun!.elapsedMs = ACT1_BREAKDOWN_MIN_RIDE_MS - 1;
    expect(shouldTriggerAct1Breakdown(world, point)).toBe(false);
    active.rideRun!.elapsedMs = ACT1_BREAKDOWN_MIN_RIDE_MS;
    expect(shouldTriggerAct1Breakdown(world, { x: dropoff.x, y: dropoff.y })).toBe(false);
    expect(triggerAct1Breakdown(world, { ...point, now: 820 })).toMatchObject({
      fired: true,
      message: expect.stringContaining("push it in")
    });

    const player = world.players[world.localPlayerId];
    expect(world.collectedPickups[ACT1_BREAKDOWN_FLAG]).toBe(820);
    expect(active.cargoIntegrity).toBe(0);
    expect(active.dueAt).toBeLessThan(820);
    expect(player).toMatchObject({ onBike: false, bikeStuck: true, bikeCondition: 0 });
    expect(isAct1BreakdownPushActive(world)).toBe(true);
    expect(getHustleNextStep(world)).toMatchObject({
      title: "TRANSMISSION GONE — push it in",
      urgency: "urgent"
    });
    expect(getFieldObjective(world).title).toBe("TRANSMISSION GONE — push it in");
    expect(world.opportunities.messages.filter((message) => message.id === ACT1_BREAKDOWN_LEO_MESSAGE_ID)).toHaveLength(1);
    expect(triggerAct1Breakdown(world, { ...point, now: 821 })).toEqual({ fired: false });
  });

  it("completes late with ruined cargo, sets 3.2 exactly, and locks premium work honestly", () => {
    const world = startAndTriggerBreakdown();
    const completed = completeDelivery(world, 825, 1);

    expect(completed).toMatchObject({
      ok: true,
      starRating: 1,
      onTime: false,
      breakdownScene: {
        fired: true,
        dialogue: expect.stringContaining("DRIVER RATING SET TO 3.2")
      }
    });
    expect(completed.message).toContain("cargo ruined");
    expect(world.life.hustle.driverRating).toBe(ACT1_BREAKDOWN_DRIVER_RATING);
    expect(world.life.hustle.activeDelivery).toBeNull();
    expect(isAct1BreakdownPushActive(world)).toBe(false);
    expect(isAct1ScooterBlown(world)).toBe(true);

    const offers = getDeliveryOfferAvailability(world);
    expect(offers.find((offer) => offer.delivery.id === KADEK_PRIORITY_DELIVERY_ID)).toMatchObject({
      available: false,
      reason: "Locked — rating. Requires 3.5★; current 3.2★."
    });
    expect(offers.find((offer) => offer.delivery.id === "satu_satu_invoice_pouch")).toMatchObject({
      available: false,
      reason: "Locked — rating. Requires 3.5★; current 3.2★."
    });
    expect(offers.find((offer) => offer.delivery.id === BREAKDOWN_DELIVERY_ID)).toMatchObject({
      available: false,
      reason: expect.stringContaining("Repair blown transmission")
    });
    expect(getAmbientNpcLine(world, "kadek", "fallback")).toBe(
      '"The list holds. Ratings are the app\'s opinion, not mine."'
    );
    expect(getMadeRoomGoalState(world)).toMatchObject({
      ratingCondition: false,
      description: expect.stringContaining("premium rating 3.2/3.5★ ✗")
    });
  });

  it("counter repair restores riding but never restores the authored rating", () => {
    const world = act1BoardWorld();
    world.players[world.localPlayerId].money = 0;
    startAndTriggerBreakdown(world);
    expect(completeDelivery(world, 825, 1)).toMatchObject({ ok: true });
    const ratingAfterDropoff = world.life.hustle.driverRating;

    expect(world.players[world.localPlayerId].money).toBeGreaterThanOrEqual(getScooterRepairStatus(world).cost);
    expect(getScooterRepairStatus(world)).toMatchObject({ available: true });
    expect(repairScooter(world, 850, 1)).toMatchObject({
      ok: true,
      message: expect.stringContaining("Driver rating stays 3.2★")
    });
    expect(world.players[world.localPlayerId]).toMatchObject({
      hasBike: true,
      bikeStuck: false
    });
    expect(world.players[world.localPlayerId].bikeCondition).toBeGreaterThan(0);
    expect(isAct1ScooterBlown(world)).toBe(false);
    expect(world.life.hustle.driverRating).toBe(ratingAfterDropoff);
  });

  it("keeps normal board income open and can reach finale preconditions without rating grinding", () => {
    const world = act1BoardWorld();
    world.life.hustle.deliveryEarnings = 470;
    world.life.hustle.rentDueDay = 7;
    startAndTriggerBreakdown(world, 800);
    expect(completeDelivery(world, 825, 1)).toMatchObject({ ok: true });
    expect(repairScooter(world, 850, 1)).toMatchObject({ ok: true });

    const normalOffer = getDeliveryOfferAvailability(world).find(
      (offer) => offer.delivery.id === BREAKDOWN_DELIVERY_ID
    );
    expect(normalOffer).toMatchObject({ available: true });
    expect(acceptDelivery(world, BREAKDOWN_DELIVERY_ID, 860)).toMatchObject({ ok: true });
    expect(isAct1BreakdownArmed(world)).toBe(false);
    expect(pickupDelivery(world, 868)).toMatchObject({ ok: true });
    expect(completeDelivery(world, 890, 1)).toMatchObject({ ok: true });

    const readiness = getAct1MoveOutReadiness(world);
    expect(world.life.hustle.completedDeliveryCount).toBe(5);
    expect(world.life.hustle.deliveryEarnings).toBeGreaterThanOrEqual(600);
    expect(readiness).toMatchObject({
      deliveriesComplete: true,
      earningsComplete: true,
      firstRentCovered: true,
      ratingComplete: false,
      complete: false
    });
    expect(world.life.actProgress.currentAct).toBe(1);
    expect(world.life.hustle.driverRating).toBeGreaterThan(ACT1_BREAKDOWN_DRIVER_RATING);
  });

  it("re-arms on the next board run when the armed delivery resolves without firing", () => {
    const world = act1BoardWorld();
    addBothTurningPoints(world);
    expect(acceptDelivery(world, BREAKDOWN_DELIVERY_ID, 800)).toMatchObject({ ok: true });
    expect(world.questFlags[ACT1_BREAKDOWN_ARMED_DELIVERY_FLAG]).toBe(BREAKDOWN_DELIVERY_ID);

    // Walked delivery: the ride trigger never fires, the run still completes.
    expect(pickupDelivery(world, 808)).toMatchObject({ ok: true });
    expect(completeDelivery(world, 820, 1)).toMatchObject({ ok: true });
    expect(world.collectedPickups[ACT1_BREAKDOWN_FLAG]).toBeUndefined();
    expect(world.questFlags[ACT1_BREAKDOWN_ARMED_DELIVERY_FLAG]).toBeUndefined();

    // The next accepted board run arms again, so the beat is never missable.
    expect(acceptDelivery(world, "satu_satu_invoice_pouch", 900)).toMatchObject({ ok: true });
    expect(world.questFlags[ACT1_BREAKDOWN_ARMED_DELIVERY_FLAG]).toBe("satu_satu_invoice_pouch");
    expect(isAct1BreakdownArmed(world)).toBe(true);
  });
});
