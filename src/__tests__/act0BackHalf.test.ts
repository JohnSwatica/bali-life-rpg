import { describe, expect, it } from "vitest";
import { getDeliveryCondition, getDeliveryDefinition } from "../data/deliveries";
import {
  buildAct0CafeScene,
  buildAct0CollapseScene,
  buildAct0KosResolveScene,
  buildAct0LandlordUltimatumScene
} from "../systems/cutscene/Act0BackHalfScripts";
import { skipCutscene } from "../systems/cutscene/CutsceneSequencer";
import {
  acceptDelivery,
  calculateDeliveryPayout,
  completeDelivery,
  getEffectiveDeliveryTerms,
  pickupDelivery
} from "../systems/hustle/DeliverySystem";
import { completeAct0Step } from "../systems/life/ActProgression";
import { mapLegacyAct0Step, migrateLifeLoopState } from "../systems/life/LifeLoopState";
import {
  ACT0_CAFE_SCENE_COST,
  ACT0_DEPOSIT_TARGET,
  ACT0_STORM_DELIVERY_ID,
  ACT0_VILLA_DELIVERY_ID,
  getAct0CriticalPathMenuOpenCount,
  getAct0StormTriggerCount,
  markAct0StormTriggered,
  recordAct0CriticalPathMenuOpen,
  resolveAct0Deposit,
  revealAct0Deposit
} from "../systems/story/Act0BackHalf";
import { createInitialWorldState } from "../systems/WorldState";

describe("Act 0 back-half rebuild", () => {
  it("progresses every new beat in order and lets every scene skip default-forward", () => {
    const world = createInitialWorldState();
    const ordered = [
      "meet_ibu_sari",
      "pickup_first_delivery",
      "dropoff_first_delivery",
      "buy_meal_and_coffee",
      "nusadrop_signup",
      "dropoff_storm_delivery",
      "landlord_ultimatum",
      "villa_order_ping",
      "pickup_villa_delivery",
      "dropoff_villa_delivery",
      "pay_kos_deposit",
      "sleep_first_night"
    ] as const;

    for (const step of ordered) expect(completeAct0Step(world, step), step).toBe(true);
    expect(world.life.actProgress).toMatchObject({ act0Step: "complete", currentAct: 1, firstDayComplete: true });

    const paid = { ...revealAct0Deposit(createInitialWorldState()), branch: "paid_in_full" as const };
    for (const script of [
      buildAct0CafeScene(),
      buildAct0LandlordUltimatumScene(ACT0_DEPOSIT_TARGET, 300),
      buildAct0KosResolveScene(paid),
      buildAct0CollapseScene()
    ]) {
      expect(skipCutscene(script).complete, script.id).toBe(true);
    }
  });

  it("maps changed legacy step ids without a schema bump or dead end", () => {
    expect(mapLegacyAct0Step("buy_meal_and_coffee")).toBe("buy_meal_and_coffee");
    expect(mapLegacyAct0Step("get_onto_nusadrop")).toBe("nusadrop_signup");
    expect(mapLegacyAct0Step("first_nusadrop_delivery")).toBe("dropoff_storm_delivery");
    expect(mapLegacyAct0Step("return_to_kos")).toBe("pay_kos_deposit");

    const migrated = migrateLifeLoopState({
      actProgress: {
        currentAct: 0,
        act0Step: "return_to_kos",
        completedAct0StepIds: ["get_onto_nusadrop", "first_nusadrop_delivery"],
        firstDayComplete: false
      }
    });
    expect(migrated.actProgress).toMatchObject({
      act0Step: "pay_kos_deposit",
      completedAct0StepIds: ["nusadrop_signup", "dropoff_storm_delivery"],
      firstDayComplete: false
    });
  });

  it("triggers the mid-ride storm exactly once", () => {
    const world = createInitialWorldState();
    expect(markAct0StormTriggered(world)).toBe(true);
    expect(markAct0StormTriggered(world)).toBe(false);
    expect(getAct0StormTriggerCount(world)).toBe(1);
  });

  it("makes the villa clean payout cover the revealed gap and preserves Act 1 milestone counts", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    player.money = 70 + 160 - ACT0_CAFE_SCENE_COST;

    expect(acceptDelivery(world, ACT0_STORM_DELIVERY_ID, 500)).toMatchObject({ ok: true });
    expect(pickupDelivery(world, 500)).toMatchObject({ ok: true });
    const storm = completeDelivery(world, 520, 1);
    expect(storm).toMatchObject({ ok: true, payout: 154 });
    const deposit = revealAct0Deposit(world);

    const villa = getDeliveryDefinition(ACT0_VILLA_DELIVERY_ID)!;
    const condition = getDeliveryCondition(villa, villa.conditions?.[0]?.id);
    const cleanPayout = calculateDeliveryPayout(getEffectiveDeliveryTerms(villa, condition, world).payout, 5);
    expect(cleanPayout).toBe(286);
    expect(cleanPayout).toBeGreaterThanOrEqual(deposit.gap);

    expect(acceptDelivery(world, ACT0_VILLA_DELIVERY_ID, 525)).toMatchObject({ ok: true });
    expect(pickupDelivery(world, 530)).toMatchObject({ ok: true });
    expect(completeDelivery(world, 550, 1)).toMatchObject({ ok: true, starRating: 5, payout: 286 });
    expect(player.money).toBe(640);
    expect(world.life.hustle.completedDeliveryCount).toBe(0);
    expect(world.life.hustle.deliveryEarnings).toBe(0);
  });

  it("resolves both deposit branches and never strands a short wallet", () => {
    const covered = createInitialWorldState();
    covered.players[covered.localPlayerId].money = ACT0_DEPOSIT_TARGET + 36;
    revealAct0Deposit(covered);
    expect(resolveAct0Deposit(covered)).toMatchObject({
      branch: "paid_in_full",
      paidByPlayer: ACT0_DEPOSIT_TARGET,
      coveredByIbu: 0,
      vouchedByIbu: false
    });
    expect(covered.players[covered.localPlayerId].money).toBe(36);

    const short = createInitialWorldState();
    short.players[short.localPlayerId].money = 409;
    revealAct0Deposit(short);
    expect(resolveAct0Deposit(short)).toMatchObject({
      branch: "ibu_vouches",
      paidByPlayer: 409,
      coveredByIbu: 151,
      vouchedByIbu: true
    });
    expect(short.players[short.localPlayerId].money).toBe(0);
  });

  it("records no activity-menu opening unless the critical path actually calls one", () => {
    const world = createInitialWorldState();
    expect(getAct0CriticalPathMenuOpenCount(world)).toBe(0);
    recordAct0CriticalPathMenuOpen(world);
    expect(getAct0CriticalPathMenuOpenCount(world)).toBe(1);
  });
});
