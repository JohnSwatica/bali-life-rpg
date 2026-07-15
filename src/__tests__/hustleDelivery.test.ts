import { describe, expect, it } from "vitest";
import { getQuantity } from "../systems/Inventory";
import { getFieldObjective } from "../systems/guidance/FieldObjective";
import {
  acceptDelivery,
  calculateDeliveryPayout,
  completeDelivery,
  getDeliveryOfferAvailability,
  getEffectiveDeliveryTerms,
  pickupDelivery,
  previewDeliveryCondition
} from "../systems/hustle/DeliverySystem";
import {
  calculateScooterRepairOutcomeCondition,
  getRentPressureState,
  getScooterRepairStatus,
  getScooterUpgradeStatus,
  payHustleRent,
  repairScooter,
  upgradeToDailyScooter
} from "../systems/hustle/HustleEconomy";
import { getHustleGoalStates, getHustleNextStep } from "../systems/hustle/HustleGoals";
import { ACT1_MOVE_OUT_DELIVERY_EARNINGS } from "../systems/hustle/HustleMilestones";
import { shouldOpenIbuHustleBoard } from "../systems/hustle/IbuHustleBoard";
import {
  applyAct0NegotiatedCompletionFee,
  completeAct0Step,
  getAct0ColdOpenCopy,
  getAct0MealProgressKindForActivity,
  markAct0MealProgress
} from "../systems/life/ActProgression";
import { canUseHomeSleep, isPlayerAtHomeBase } from "../systems/life/HomeBase";
import { startQuest } from "../systems/QuestSystem";
import { resolveNpcQuestInteraction } from "../systems/quests/QuestRegistry";
import { getRelationship } from "../systems/relationships/RelationshipMemory";
import { createInitialWorldState } from "../systems/WorldState";
import { getDeliveryDefinition } from "../data/deliveries";
import { playerHomeBase } from "../data/homeBase";
import { getRelationshipChoiceScene } from "../systems/relationships/RelationshipChoiceScenes";
import { ACT0_OPENING_DURATION_MS, buildAct0OpeningCutscene } from "../systems/cutscene/Act0OpeningScript";
import { migrateLifeLoopState } from "../systems/life/LifeLoopState";

describe("Act 0 hustle and deliveries", () => {
  it("stages the v4 cold-open inside the 45-60 second unskipped budget", () => {
    const script = buildAct0OpeningCutscene({
      player: { x: 10, y: 10 },
      busStart: { x: 20, y: 10 },
      busExit: { x: -200, y: 10 },
      ibuStart: { x: 60, y: 60 },
      ibuEnd: { x: 14, y: 12 },
      station: { x: 60, y: 60 }
    });
    const duration = script.steps.reduce((total, step) => total + step.durationMs, 0);

    expect(duration).toBe(ACT0_OPENING_DURATION_MS);
    expect(duration).toBeGreaterThanOrEqual(45_000);
    expect(duration).toBeLessThanOrEqual(60_000);
    expect(script.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "bus_pulls_away", kind: "scripted_walk", actorId: "arrival_bus" }),
        expect.objectContaining({ id: "kos_scam_message", kind: "act_card" }),
        expect.objectContaining({ id: "ibu_crosses_street", kind: "scripted_walk", actorId: "ibu_sari_cutscene" })
      ])
    );
  });

  it("offers two character choices with affinity, memory, and axis residue but no decline", () => {
    const scene = getRelationshipChoiceScene("ibu_sari_act0_scooter_deal");

    expect(scene?.npcId).toBe("ibu_sari");
    expect(scene?.options.map((option) => option.actionId)).toEqual(["accept_act0_humbly", "negotiate_act0_fee"]);
    expect(scene?.options[0]).toMatchObject({ affinityBonus: 3, axis: { kind: "relational", delta: 3 } });
    expect(scene?.options[1]).toMatchObject({ affinityBonus: -1, axis: { kind: "relational", delta: -2 } });
    expect(scene?.options.every((option) => Boolean(option.memory))).toBe(true);
  });

  it("pays the negotiated Act 0 fee exactly once on completion", () => {
    const world = createInitialWorldState();
    const moneyBefore = world.players[world.localPlayerId].money;
    world.questFlags.act0_negotiated_fee = true;

    expect(applyAct0NegotiatedCompletionFee(world, "act0_ibu_milk_madu_catering")).toBe(25);
    expect(world.players[world.localPlayerId].money).toBe(moneyBefore + 25);
    expect(world.life.hustle.deliveryEarnings).toBe(25);
    expect(applyAct0NegotiatedCompletionFee(world, "act0_ibu_milk_madu_catering")).toBe(0);
    expect(world.players[world.localPlayerId].money).toBe(moneyBefore + 25);
  });

  it("runs Ibu's catering hook for 15 minutes and fails forward without the on-time bonus", () => {
    const onTimeWorld = createInitialWorldState();
    expect(acceptDelivery(onTimeWorld, "act0_ibu_milk_madu_catering", 480)).toMatchObject({ ok: true });
    expect(pickupDelivery(onTimeWorld, 480)).toMatchObject({ ok: true });
    onTimeWorld.life.hustle.activeDelivery!.dueAt = 503;
    const onTime = completeDelivery(onTimeWorld, 502, 1);
    expect(onTime).toMatchObject({ ok: true, onTime: true, onTimeBonus: 40 });
    expect(onTime.cargoCare).toMatchObject({ eligible: true, originalBonus: 40, retainedBonus: 40 });

    const lateWorld = createInitialWorldState();
    expect(acceptDelivery(lateWorld, "act0_ibu_milk_madu_catering", 480)).toMatchObject({ ok: true });
    expect(pickupDelivery(lateWorld, 480)).toMatchObject({ ok: true });
    lateWorld.life.hustle.activeDelivery!.dueAt = 503;
    const late = completeDelivery(lateWorld, 504, 1);
    expect(late).toMatchObject({ ok: true, onTime: false, onTimeBonus: 0 });
    expect(late.message).toContain("Window missed");
    expect(lateWorld.life.hustle.completedDeliveryIds).toContain("act0_ibu_milk_madu_catering");
    expect((onTime.payout ?? 0) - (late.payout ?? 0)).toBeGreaterThanOrEqual(40);
  });

  it("preserves an old save already midway through Act 0 instead of replaying the new opening", () => {
    const migrated = migrateLifeLoopState({
      actProgress: {
        currentAct: 0,
        act0Step: "dropoff_first_delivery",
        completedAct0StepIds: ["meet_ibu_sari", "pickup_first_delivery"],
        firstDayComplete: false
      },
      hustle: {
        activeDelivery: {
          deliveryId: "first_baked_villa_delivery",
          stage: "picked_up",
          acceptedAt: 480,
          dueAt: 570,
          pickedUpAt: 492
        }
      }
    });

    expect(migrated.actProgress).toMatchObject({
      currentAct: 0,
      act0Step: "dropoff_first_delivery",
      completedAct0StepIds: ["meet_ibu_sari", "pickup_first_delivery"],
      firstDayComplete: false
    });
    expect(migrated.hustle.activeDelivery).toMatchObject({
      deliveryId: "first_baked_villa_delivery",
      stage: "picked_up",
      dueAt: 570
    });
  });
  it("leads the first-run panel with arrival story before control reminders", () => {
    const copy = getAct0ColdOpenCopy();

    expect(copy.title).toContain("Berawa");
    expect(copy.body.startsWith("WASD")).toBe(false);
    expect(copy.body).toContain("Morning");
    expect(copy.body).toContain("Ibu Sari");
    expect(copy.body).toContain("Canggu Station");
    expect(copy.body.indexOf("Controls")).toBeGreaterThan(copy.body.indexOf("Ibu Sari"));
  });

  it("accepts, picks up, completes, and rewards the first BAKED delivery", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    const acceptedAt = 8 * 60;

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
    expect(world.life.hustle.activeDelivery?.cargoIntegrity).toBe(100);
    expect(world.life.hustle.activeDelivery?.rideRun).toEqual({
      elapsedMs: 0,
      hazardsSpawned: 0,
      hazardsAvoided: 0,
      nearMisses: 0,
      contacts: 0
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

  it("never reduces base payout even for a degraded straight-line run", () => {
    expect(calculateDeliveryPayout(145, 1)).toBe(145);
    expect(calculateDeliveryPayout(145, 2.5)).toBeGreaterThanOrEqual(145);
    expect(calculateDeliveryPayout(145, 5)).toBe(160);
  });

  it("keeps the rebuilt Act 0 back half in authored order through the first sleep", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];

    expect(world.life.actProgress.act0Step).toBe("meet_ibu_sari");
    expect(completeAct0Step(world, "sleep_first_night")).toBe(false);
    expect(world.life.actProgress.completedAct0StepIds).toEqual([]);
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
    expect(world.life.actProgress.act0Step).toBe("nusadrop_signup");
    for (const step of [
      "nusadrop_signup",
      "dropoff_storm_delivery",
      "landlord_ultimatum",
      "villa_order_ping",
      "pickup_villa_delivery",
      "dropoff_villa_delivery",
      "pay_kos_deposit"
    ] as const) {
      expect(completeAct0Step(world, step)).toBe(true);
    }
    expect(world.life.actProgress.act0Step).toBe("sleep_first_night");
    expect(canUseHomeSleep(world)).toBe(false);
    player.x = playerHomeBase.x;
    player.y = playerHomeBase.y;
    expect(isPlayerAtHomeBase(world)).toBe(true);
    expect(canUseHomeSleep(world)).toBe(true);

    expect(completeAct0Step(world, "sleep_first_night")).toBe(true);
    expect(world.life.actProgress).toMatchObject({
      currentAct: 1,
      act0Step: "complete",
      firstDayComplete: true
    });
  });

  it("lets station activity choices satisfy the Act 0 meal and coffee beat", () => {
    expect(getAct0MealProgressKindForActivity("cafe_quick_caffeine")).toBe("coffee");
    expect(getAct0MealProgressKindForActivity("cafe_brunch_table")).toBe("meal");
    expect(getAct0MealProgressKindForActivity("warung_nasi_reset")).toBe("meal");
    expect(getAct0MealProgressKindForActivity("cafe_deep_work")).toBeNull();
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
    expect(offers.find((offer) => offer.delivery.id === "nude_cold_bag_run")).toMatchObject({
      available: false,
      reason: "Need 2 completed deliveries."
    });
    expect(offers.find((offer) => offer.delivery.id === "beach_wristband_pouch")).toMatchObject({
      available: false,
      reason: "Need 3 completed deliveries."
    });
    expect(offers.find((offer) => offer.delivery.id === "finns_linen_bundle")).toMatchObject({
      available: false,
      reason: "Need 3 completed deliveries."
    });

    world.life.hustle.completedDeliveryCount = 2;
    world.life.hustle.driverRating = 3.8;
    offers = getDeliveryOfferAvailability(world);
    expect(offers.find((offer) => offer.delivery.id === "nude_cold_bag_run")).toMatchObject({ available: true });
    expect(offers.find((offer) => offer.delivery.id === "beach_wristband_pouch")).toMatchObject({
      available: false,
      reason: "Need 3 completed deliveries."
    });

    world.life.hustle.completedDeliveryCount = 3;
    world.life.hustle.driverRating = 4;
    offers = getDeliveryOfferAvailability(world);
    expect(offers.find((offer) => offer.delivery.id === "beach_wristband_pouch")).toMatchObject({ available: true });
    expect(offers.find((offer) => offer.delivery.id === "finns_linen_bundle")).toMatchObject({
      available: false,
      reason: "Need 4.1★ driver rating."
    });

    const accepted = acceptDelivery(world, "milk_madu_brunch_bag", 2 * 1440 + 9 * 60);
    expect(accepted.ok).toBe(true);
    expect(world.life.hustle.activeDelivery?.deliveryId).toBe("milk_madu_brunch_bag");
    expect(getDeliveryOfferAvailability(world).every((offer) => !offer.available)).toBe(true);
  });

  it("keeps Ibu Sari's Act 1 NusaDrop Board reachable when her starter quest is still unresolved", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    player.hasBike = true;
    player.inventory = player.inventory.filter((entry) => entry.itemId !== "coconut");
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.currentAct = 1;
    world.life.hustle.completedDeliveryCount = 1;
    world.life.hustle.driverRating = 3.6;

    startQuest(player, "canggu_station_restock");
    const questInteraction = resolveNpcQuestInteraction(player, "ibu_sari");

    expect(questInteraction).toMatchObject({ handled: true, shouldSave: false });
    expect(questInteraction?.dialogue).toContain("Bring me two");
    expect(shouldOpenIbuHustleBoard(world, "ibu_sari")).toBe(true);
    expect(getDeliveryOfferAvailability(world).some((offer) => offer.available)).toBe(true);
  });

  it("applies deterministic delivery board conditions to deadline and payout", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    world.players[world.localPlayerId].hasBike = true;
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.life.hustle.completedDeliveryCount = 1;
    world.life.hustle.driverRating = 3.6;
    const now = 2 * 1440 + 9 * 60;
    const delivery = getDeliveryOfferAvailability(world).find((offer) => offer.delivery.id === "milk_madu_brunch_bag")?.delivery;
    expect(delivery).toBeDefined();
    const condition = previewDeliveryCondition(world, delivery!, now);
    expect(condition).toBeDefined();
    const terms = getEffectiveDeliveryTerms(delivery!, condition);

    const accepted = acceptDelivery(world, delivery!.id, now);
    expect(accepted).toMatchObject({ ok: true });
    expect(world.life.hustle.activeDelivery).toMatchObject({
      deliveryId: delivery!.id,
      conditionId: condition!.id,
      dueAt: now + terms.timeLimitMin
    });

    expect(pickupDelivery(world, now + 8)).toMatchObject({ ok: true });
    const completed = completeDelivery(world, now + 32, 0.9);
    expect(completed.ok).toBe(true);
    expect(completed.starRating).toBeDefined();
    expect(completed.payout).toBe(calculateDeliveryPayout(terms.payout, completed.starRating!));
    expect(world.life.hustle.deliveryEarnings).toBe(completed.payout);
    expect(player.bikeCondition).toBeLessThan(100);
  });

  it("lets cargo care reduce only the condition bonus while delivery still completes", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    player.hasBike = true;
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.life.hustle.completedDeliveryCount = 1;
    world.life.hustle.driverRating = 3.6;
    const now = 2 * 1440 + 9 * 60;
    const definition = getDeliveryDefinition("milk_madu_brunch_bag");
    expect(definition).toBeDefined();

    expect(acceptDelivery(world, definition!.id, now)).toMatchObject({ ok: true });
    expect(pickupDelivery(world, now + 8)).toMatchObject({ ok: true });
    expect(world.life.hustle.activeDelivery?.cargoIntegrity).toBe(100);
    if (world.life.hustle.activeDelivery) {
      world.life.hustle.activeDelivery.cargoIntegrity = 0;
      world.life.hustle.activeDelivery.cargoDamageEvents = 5;
    }

    const completed = completeDelivery(world, now + 40, 0.82);

    expect(completed.ok).toBe(true);
    expect(completed.cargoCare).toMatchObject({
      eligible: true,
      retainedBonus: 0,
      adjustedPayoutBase: definition!.payout
    });
    expect(completed.payout).toBe(calculateDeliveryPayout(definition!.payout, completed.starRating!));
    expect(completed.message).toContain("Box took some hits");
    expect(world.life.hustle.activeDelivery).toBeNull();
    expect(world.life.hustle.completedDeliveryIds).toContain(definition!.id);
    expect(world.life.hustle.completedDeliveryCount).toBe(2);
    expect(getQuantity(player, definition!.itemId)).toBe(0);
  });

  it("announces numeric move-out readiness without skipping the authored Act 1 finale", () => {
    const world = createInitialWorldState();
    world.players[world.localPlayerId].hasBike = true;
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.life.hustle.completedDeliveryCount = 4;
    world.life.hustle.deliveryEarnings = 660;
    world.life.hustle.driverRating = 4.8;
    world.life.hustle.rentDueDay = 7;
    const now = 3 * 1440 + 11 * 60;

    expect(acceptDelivery(world, "milk_madu_brunch_bag", now)).toMatchObject({ ok: true });
    expect(pickupDelivery(world, now + 8)).toMatchObject({ ok: true });
    const completed = completeDelivery(world, now + 32, 1);

    expect(completed.ok).toBe(true);
    expect(world.life.hustle.moveOutReady).toBe(true);
    expect(world.life.actProgress.currentAct).toBe(1);
    expect(completed.message).toContain("Move-out numbers ready");
    expect(completed.message).not.toContain("Act 2 begins");
  });

  it("does not unlock Act 2 from readiness alone when scooter condition is low", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    player.hasBike = true;
    player.bikeCondition = 17;
    player.money = 500;
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.currentAct = 1;
    world.life.hustle.completedDeliveryCount = 5;
    world.life.hustle.deliveryEarnings = 720;
    world.life.hustle.driverRating = 4.3;
    world.life.hustle.rentDueDay = 4;

    const rent = payHustleRent(world, 2 * 1440 + 14 * 60);

    expect(rent.message).toContain("move-out numbers are ready");
    expect(world.life.hustle.moveOutReady).toBe(true);
    expect(world.life.actProgress.currentAct).toBe(1);
    expect(getHustleNextStep(world)).toMatchObject({ title: "Repair scooter" });
    expect(getFieldObjective(world)).toMatchObject({
      source: "hustle",
      title: "Repair scooter"
    });
  });

  it("lets hustle earnings pay rent and upgrade the borrowed scooter", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];

    expect(payHustleRent(world, 100)).toMatchObject({ ok: false, message: "Need Rp 380 more for rent." });
    player.money = 500;
    world.clock.day = 3;
    expect(payHustleRent(world, 120)).toMatchObject({ ok: true });
    expect(player.money).toBe(50);
    expect(world.life.hustle.rentDueDay).toBe(7);
    expect(world.meters.wellbeing).toBe(74);
    expect(world.meters.focus).toBe(45);
    expect(world.reputation.score).toBe(61);

    expect(getScooterUpgradeStatus(world)).toMatchObject({
      available: false,
      reason: "Need 2 completed deliveries."
    });
    player.money = 300;
    player.hasBike = true;
    player.bikeCondition = 24;
    world.life.hustle.completedDeliveryCount = 2;
    world.life.hustle.driverRating = 3.6;

    expect(getScooterUpgradeStatus(world)).toMatchObject({ available: true, cost: 260 });
    expect(upgradeToDailyScooter(world, 140)).toMatchObject({ ok: true });
    expect(player.money).toBe(40);
    expect(player.hasBike).toBe(true);
    expect(player.onBike).toBe(false);
    expect(player.bikeCondition).toBe(100);
    expect(world.life.hustle.scooterTier).toBe("daily_rental");
    expect(getQuantity(player, "scooter_key")).toBe(1);
  });

  it("gates delivery work at low scooter condition and repairs locally", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    player.hasBike = true;
    player.money = 200;
    player.bikeCondition = 12;
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.life.hustle.completedDeliveryCount = 1;
    world.life.hustle.driverRating = 3.6;

    expect(getDeliveryOfferAvailability(world).find((offer) => offer.delivery.id === "milk_madu_brunch_bag")).toMatchObject({
      available: false,
      reason: "Repair scooter above 18% condition."
    });

    const repairStatus = getScooterRepairStatus(world);
    expect(repairStatus).toMatchObject({ available: true, targetCondition: 78 });
    expect(repairScooter(world, 3 * 1440 + 8 * 60)).toMatchObject({ ok: true });
    expect(player.money).toBe(200 - repairStatus.cost);
    expect(player.bikeCondition).toBe(78);
    expect(getDeliveryOfferAvailability(world).find((offer) => offer.delivery.id === "milk_madu_brunch_bag")).toMatchObject({
      available: true
    });
  });

  it("scales scooter repair quality with the wrench timing beat while preserving fail-forward repairs", () => {
    expect(calculateScooterRepairOutcomeCondition(20, 78, 1)).toBe(78);
    expect(calculateScooterRepairOutcomeCondition(20, 78, 0)).toBeGreaterThan(20);
    expect(calculateScooterRepairOutcomeCondition(20, 78, 0)).toBeLessThan(78);
    expect(calculateScooterRepairOutcomeCondition(20, 78)).toBe(78);

    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    player.hasBike = true;
    player.money = 200;
    player.bikeCondition = 20;

    const result = repairScooter(world, 8 * 60, 0.25);

    expect(result).toMatchObject({ ok: true });
    expect(player.bikeCondition).toBeGreaterThan(20);
    expect(player.bikeCondition).toBeLessThan(78);
    expect(result.message).toContain("Rough patch");
  });

  it("labels rent pressure without creating a fail state", () => {
    const world = createInitialWorldState();
    world.clock.day = 2;
    world.life.hustle.rentDueDay = 4;
    expect(getRentPressureState(world)).toMatchObject({
      status: "comfortable",
      daysRemaining: 2,
      shortLabel: "2 days to rent"
    });

    world.clock.day = 3;
    expect(getRentPressureState(world)).toMatchObject({ status: "due_soon", shortLabel: "Rent due tomorrow" });

    world.clock.day = 4;
    expect(getRentPressureState(world)).toMatchObject({ status: "due_today", shortLabel: "Rent due today" });

    world.clock.day = 5;
    expect(getRentPressureState(world)).toMatchObject({ status: "overdue", daysRemaining: -1, shortLabel: "Rent overdue" });
    expect(world.life.hustle.rentDueDay).toBe(4);
  });

  it("derives Act 1 hustle goals from delivery, rent, scooter, and move-out state", () => {
    const world = createInitialWorldState();
    let states = Object.fromEntries(getHustleGoalStates(world).map((goal) => [goal.id, goal.complete]));
    expect(states).toEqual({
      first_delivery: false,
      steady_runner: false,
      daily_scooter: false,
      cover_first_rent: false,
      move_out_ready: false
    });

    world.life.hustle.completedDeliveryCount = 5;
    world.life.hustle.deliveryEarnings = 720;
    world.life.hustle.driverRating = 4.3;
    world.life.hustle.scooterTier = "daily_rental";
    world.life.hustle.rentDueDay = 7;
    world.life.hustle.moveOutReady = true;

    states = Object.fromEntries(getHustleGoalStates(world).map((goal) => [goal.id, goal.complete]));
    expect(states).toEqual({
      first_delivery: true,
      steady_runner: true,
      daily_scooter: true,
      cover_first_rent: true,
      move_out_ready: true
    });
  });

  it("renders the move-out earnings requirement from the shared milestone constant", () => {
    const world = createInitialWorldState();
    const moveOutGoal = getHustleGoalStates(world).find((goal) => goal.id === "move_out_ready");

    expect(moveOutGoal?.description).toContain(`Rp ${ACT1_MOVE_OUT_DELIVERY_EARNINGS}`);
    expect(moveOutGoal?.description).not.toContain("Rp 700");
  });

  it("derives the next Act 1 hustle action from current pressure", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];

    expect(getHustleNextStep(world)).toMatchObject({ title: "Finish first day", urgency: "normal" });

    player.hasBike = true;
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.life.hustle.completedDeliveryCount = 1;
    world.life.hustle.driverRating = 3.6;
    expect(getHustleNextStep(world)).toMatchObject({ title: "Build delivery rhythm" });

    const now = 2 * 1440 + 9 * 60;
    expect(acceptDelivery(world, "milk_madu_brunch_bag", now)).toMatchObject({ ok: true });
    expect(getHustleNextStep(world)).toMatchObject({ title: "Pick up active delivery" });
    expect(pickupDelivery(world, now + 8)).toMatchObject({ ok: true });
    expect(getHustleNextStep(world)).toMatchObject({ title: "Drop off active delivery" });
    world.life.hustle.activeDelivery = null;

    player.bikeCondition = 12;
    expect(getHustleNextStep(world)).toMatchObject({ title: "Repair scooter", urgency: "blocked" });

    player.bikeCondition = 80;
    player.money = 450;
    world.clock.day = 4;
    expect(getHustleNextStep(world)).toMatchObject({ title: "Pay rent", urgency: "urgent" });

    player.money = 200;
    expect(getHustleNextStep(world)).toMatchObject({ title: "Earn rent money", urgency: "urgent" });

    player.money = 300;
    world.clock.day = 1;
    world.life.hustle.completedDeliveryCount = 3;
    expect(getHustleNextStep(world)).toMatchObject({ title: "Upgrade scooter" });

    world.life.hustle.scooterTier = "daily_rental";
    world.life.hustle.completedDeliveryCount = 5;
    world.life.hustle.deliveryEarnings = 720;
    world.life.hustle.driverRating = 4.3;
    player.money = 500;
    expect(getHustleNextStep(world)).toMatchObject({ title: "Cover first rent" });
  });
});
