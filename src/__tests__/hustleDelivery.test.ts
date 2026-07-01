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
  getRentPressureState,
  getScooterRepairStatus,
  getScooterUpgradeStatus,
  payHustleRent,
  repairScooter,
  upgradeToDailyScooter
} from "../systems/hustle/HustleEconomy";
import { getHustleGoalStates, getHustleNextStep } from "../systems/hustle/HustleGoals";
import { shouldOpenIbuHustleBoard } from "../systems/hustle/IbuHustleBoard";
import {
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
import { playerHomeBase } from "../data/homeBase";

describe("Act 0 hustle and deliveries", () => {
  it("leads the first-run panel with arrival story before control reminders", () => {
    const copy = getAct0ColdOpenCopy();

    expect(copy.title).toContain("Berawa");
    expect(copy.body.startsWith("WASD")).toBe(false);
    expect(copy.body).toContain("Dusk");
    expect(copy.body).toContain("Ibu Sari");
    expect(copy.body).toContain("Canggu Station");
    expect(copy.body.indexOf("Controls")).toBeGreaterThan(copy.body.indexOf("Ibu Sari"));
  });

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

  it("keeps Ibu Sari's Act 1 Hustle Board reachable when her starter quest is still unresolved", () => {
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

  it("announces move-out readiness when a delivery crosses the Act 1 threshold", () => {
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
    expect(world.life.actProgress.currentAct).toBe(2);
    expect(completed.message).toContain("Move-out ready");
    expect(completed.message).toContain("Act 2 begins");
  });

  it("keeps the Act 2 chapter turn ahead of scooter repair guidance when condition is low", () => {
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

    expect(rent.message).toContain("Act 2 begins");
    expect(world.life.hustle.moveOutReady).toBe(true);
    expect(getHustleNextStep(world)).toMatchObject({ title: "Start Act 2" });
    expect(getFieldObjective(world)).toMatchObject({
      source: "act2",
      title: "Join a first crew"
    });

    world.life.actProgress.currentAct = 1;
    expect(getFieldObjective(world)).toMatchObject({
      source: "act2",
      title: "Join a first crew"
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
    expect(player.onBike).toBe(true);
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
