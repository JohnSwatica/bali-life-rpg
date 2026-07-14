import { describe, expect, it } from "vitest";
import { getDeliveryDefinition } from "../data/deliveries";
import { getQuantity } from "../systems/Inventory";
import { createInitialWorldState } from "../systems/WorldState";
import { getAmbientNpcLine } from "../systems/dialogue/DialoguePresentation";
import {
  acceptDelivery,
  calculateDeliveryStarRating,
  calculateDeliveryPayout,
  completeDelivery,
  getDeliveryOfferAvailability,
  getEffectiveDeliveryTerms,
  pickupDelivery
} from "../systems/hustle/DeliverySystem";
import { getInteriorDeliveryPickupForStation } from "../systems/interiors/InteriorState";
import { adjustPlayerMeters } from "../systems/meters/PlayerMeters";
import {
  FOCUS_BUFFER_DURATION_MIN,
  getFocusBufferRemainingMinutes,
  isFocusBufferActive
} from "../systems/meters/FocusBuffer";
import { ACT1_LEO_ENCOUNTER_FLAG, triggerAct1RateCut } from "../systems/story/Act1IncitingHook";
import {
  buildKadekRushOfferMessage,
  completeKadekPriorityScene,
  KADEK_FOCUS_BUFFER_ITEM_ID,
  KADEK_PRIORITY_DELIVERY_ID,
  KADEK_PRIORITY_FLAG,
  KADEK_RUSH_DELIVERY_ID,
  KADEK_RUSH_FEED_MESSAGE_ID
} from "../systems/story/Act1KadekPriority";
import { ACT0_VILLA_DELIVERY_ID } from "../systems/story/Act0BackHalf";
import { interiorDefinitions } from "../data/interiors";

function act1World() {
  const world = createInitialWorldState();
  const player = world.players[world.localPlayerId];
  player.hasBike = true;
  world.life.actProgress.currentAct = 1;
  world.life.actProgress.firstDayComplete = true;
  world.life.actProgress.act0Step = "complete";
  triggerAct1RateCut(world, 600);
  return world;
}

describe("Act 1 TP1 — Kadek's priority list", () => {
  it("gates the persistent special offer on Leo's resolved encounter and flags the feed once", () => {
    const world = act1World();

    expect(getDeliveryOfferAvailability(world).some((offer) => offer.delivery.id === KADEK_RUSH_DELIVERY_ID)).toBe(false);
    expect(acceptDelivery(world, KADEK_RUSH_DELIVERY_ID, 610)).toMatchObject({
      ok: false,
      message: expect.stringContaining("Leo")
    });
    expect(buildKadekRushOfferMessage(world, 610)).toBeUndefined();

    world.collectedPickups[ACT1_LEO_ENCOUNTER_FLAG] = 611;
    const message = buildKadekRushOfferMessage(world, 612);
    expect(message).toMatchObject({
      id: KADEK_RUSH_FEED_MESSAGE_ID,
      from: "BAKED. · SPECIAL",
      body: expect.stringContaining("stays reserved")
    });
    world.opportunities.messages.push(message!);
    expect(buildKadekRushOfferMessage(world, 613)).toBeUndefined();

    world.clock.day = 4;
    world.clock.minuteOfDay = 20 * 60;
    const reoffer = getDeliveryOfferAvailability(world).find((offer) => offer.delivery.id === KADEK_RUSH_DELIVERY_ID);
    expect(reoffer).toMatchObject({ available: true });
  });

  it("runs Canggu Station to the BAKED. interior, fires Kadek's portrait scene once, and unlocks residue", () => {
    const world = act1World();
    world.collectedPickups[ACT1_LEO_ENCOUNTER_FLAG] = 611;
    const stationCounter = interiorDefinitions.warung_sari_interior.stations[0];
    const bakedCounter = interiorDefinitions.baked_berawa_interior.stations[0];

    expect(acceptDelivery(world, KADEK_RUSH_DELIVERY_ID, 620)).toMatchObject({ ok: true });
    expect(getInteriorDeliveryPickupForStation(world, stationCounter)).toMatchObject({
      deliveryId: KADEK_RUSH_DELIVERY_ID,
      label: expect.stringContaining("ingredient crate")
    });
    expect(pickupDelivery(world, 628)).toMatchObject({ ok: true });
    expect(getInteriorDeliveryPickupForStation(world, bakedCounter)).toMatchObject({
      deliveryId: KADEK_RUSH_DELIVERY_ID,
      label: expect.stringContaining("Kadek")
    });

    const completed = completeDelivery(world, 650, 0.92);
    expect(completed).toMatchObject({
      ok: true,
      storyScene: { fired: true, cleanEnough: true }
    });
    expect(completed.storyScene?.dialogue?.match(/corporate people pay triple/g)).toHaveLength(1);
    expect(completed.storyScene?.dialogue).toContain("PRIORITY LIST UNLOCKED");
    expect(world.collectedPickups[KADEK_PRIORITY_FLAG]).toBe(650);
    expect(getQuantity(world.players[world.localPlayerId], KADEK_FOCUS_BUFFER_ITEM_ID)).toBe(0);
    expect(completeKadekPriorityScene(world, 100, 651)).toEqual({ fired: false });

    expect(getDeliveryOfferAvailability(world).some((offer) => offer.delivery.id === KADEK_RUSH_DELIVERY_ID)).toBe(false);
    expect(getDeliveryOfferAvailability(world).find((offer) => offer.delivery.id === KADEK_PRIORITY_DELIVERY_ID)).toMatchObject({
      available: true
    });
    expect(getAmbientNpcLine(world, "kadek", "fallback")).toContain("Priority list");
  });

  it("fails forward with rough cargo and lets Kadek acknowledge the battered box", () => {
    const world = act1World();
    world.collectedPickups[ACT1_LEO_ENCOUNTER_FLAG] = 611;
    expect(acceptDelivery(world, KADEK_RUSH_DELIVERY_ID, 620)).toMatchObject({ ok: true });
    expect(pickupDelivery(world, 628)).toMatchObject({ ok: true });
    world.life.hustle.activeDelivery!.cargoIntegrity = 24;

    const completed = completeDelivery(world, 650, 0.35);
    expect(completed).toMatchObject({ ok: true, storyScene: { fired: true, cleanEnough: false } });
    expect(completed.storyScene?.dialogue).toContain("dented crate");
    expect(world.collectedPickups[KADEK_PRIORITY_FLAG]).toBeTruthy();
  });

  it("freezes negative Focus changes for exactly three in-game hours, then expires", () => {
    const world = act1World();
    world.clock.day = 2;
    world.clock.minuteOfDay = 10 * 60;
    const now = 1440 + 10 * 60;
    const focusBefore = world.meters.focus;

    expect(completeKadekPriorityScene(world, 100, now)).toMatchObject({
      fired: true,
      bufferUntil: now + FOCUS_BUFFER_DURATION_MIN
    });
    expect(isFocusBufferActive(world, now)).toBe(true);
    expect(getFocusBufferRemainingMinutes(world, now)).toBe(180);
    adjustPlayerMeters(world, { focus: -7, energy: -2 });
    expect(world.meters.focus).toBe(focusBefore);
    expect(world.meters.energy).toBe(76);

    world.clock.minuteOfDay += FOCUS_BUFFER_DURATION_MIN;
    expect(isFocusBufferActive(world)).toBe(false);
    expect(getFocusBufferRemainingMinutes(world)).toBe(0);
    adjustPlayerMeters(world, { focus: -7 });
    expect(world.meters.focus).toBe(focusBefore - 7);
  });

  it("keeps priority pay premium at unlock, below the Act 0 villa setpiece, rate-cut, and five-run safe", () => {
    const world = act1World();
    world.collectedPickups[ACT1_LEO_ENCOUNTER_FLAG] = 611;
    world.collectedPickups[KADEK_PRIORITY_FLAG] = 612;
    world.life.hustle.completedDeliveryCount = 2;
    world.life.hustle.driverRating = 3.8;
    const rush = getDeliveryDefinition(KADEK_RUSH_DELIVERY_ID)!;
    const premium = getDeliveryDefinition(KADEK_PRIORITY_DELIVERY_ID)!;
    const villa = getDeliveryDefinition(ACT0_VILLA_DELIVERY_ID)!;
    const rushTerms = getEffectiveDeliveryTerms(rush, rush.conditions![0], world);
    const premiumTerms = getEffectiveDeliveryTerms(premium, premium.conditions![0], world);
    const villaTerms = getEffectiveDeliveryTerms(villa, villa.conditions![0], world);
    const availableNormalTerms = getDeliveryOfferAvailability(world)
      .filter((offer) => offer.available && !offer.delivery.boardStyle)
      .flatMap((offer) => (offer.delivery.conditions ?? [undefined]).map((condition) => getEffectiveDeliveryTerms(offer.delivery, condition, world).payout));

    expect(premium.conditions).toHaveLength(1);
    expect(premium.conditions![0].label).toContain("Fragile");
    expect(rushTerms.payout).toBe(132);
    expect(premiumTerms.payout).toBe(142);
    expect(Math.max(...availableNormalTerms)).toBe(141);
    expect(premiumTerms.payout).toBeGreaterThan(Math.max(...availableNormalTerms));
    expect(premiumTerms.payout).toBeLessThan(villaTerms.payout);
    expect(villaTerms.payout).toBe(260);

    const cleanRun = { deliveryId: rush.id, stage: "picked_up" as const, acceptedAt: 0, dueAt: 100 };
    const rushMaxRating = calculateDeliveryStarRating(cleanRun, 90, 1, rush.conditions![0]);
    const premiumMaxRating = calculateDeliveryStarRating({ ...cleanRun, deliveryId: premium.id }, 90, 1, premium.conditions![0]);
    const rushCleanMax = calculateDeliveryPayout(rushTerms.payout, rushMaxRating);
    const premiumCleanMax = calculateDeliveryPayout(premiumTerms.payout, premiumMaxRating);
    expect(rushMaxRating).toBe(4.5);
    expect(premiumMaxRating).toBe(4.5);
    expect(rushCleanMax).toBe(142);
    expect(premiumCleanMax).toBe(152);
    expect(rushCleanMax + premiumCleanMax * 3).toBeLessThan(600);
    expect(rushCleanMax + premiumCleanMax * 4).toBeGreaterThanOrEqual(600);
  });
});
