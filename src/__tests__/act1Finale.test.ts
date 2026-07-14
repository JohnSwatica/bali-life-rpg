import { describe, expect, it } from "vitest";
import { getPlayerHomeBase } from "../data/homeBase";
import { interiorDefinitions } from "../data/interiors";
import { buildDevProofBootState } from "../dev/DevProofStates";
import { loadWorldState, saveWorldState } from "../systems/Persistence";
import { createInitialWorldState } from "../systems/WorldState";
import { getHustleGoalStates } from "../systems/hustle/HustleGoals";
import {
  ACT1_MOVE_OUT_DELIVERIES,
  ACT1_MOVE_OUT_DELIVERY_EARNINGS,
  ACT1_MOVE_OUT_DRIVER_RATING,
  getAct1MoveOutReadiness
} from "../systems/hustle/HustleMilestones";
import { isAct2Unlocked } from "../systems/life/Act2Goals";
import {
  ACT1_FINALE_LEO_MESSAGE_ID,
  ACT1_MADE_KEY_FLAG,
  ACT1_MOVE_OUT_COMPLETE_FLAG,
  ACT1_MOVE_OUT_MONTAGE_STARTED_FLAG,
  ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG,
  ACT2_INTRO_CARD_FLAG,
  acceptMadeFinale,
  canStartIbuGuaranteeScene,
  completeAct1MoveOut,
  completeIbuGuaranteeScene,
  markMoveOutMontageStarted,
  signWeeklyScooterContract,
  startAct2AfterFinale
} from "../systems/story/Act1Finale";
import {
  MADE_RECOMMENDATION_LETTER_FLAG,
  MADE_ROOM_OFFER_SCENE_FLAG,
  getMadeRoomGoalState
} from "../systems/story/Act1MadeRoomOffer";
import { installMemoryLocalStorage } from "./testUtils";

installMemoryLocalStorage();

function finaleWorld(rating = 3.2) {
  const world = createInitialWorldState();
  const player = world.players[world.localPlayerId];
  world.life.actProgress.currentAct = 1;
  world.life.actProgress.firstDayComplete = true;
  world.life.actProgress.act0Step = "complete";
  world.life.hustle.completedDeliveryCount = ACT1_MOVE_OUT_DELIVERIES;
  world.life.hustle.deliveryEarnings = ACT1_MOVE_OUT_DELIVERY_EARNINGS;
  world.life.hustle.driverRating = rating;
  world.life.hustle.rentDueDay = 7;
  world.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG] = 800;
  player.hasBike = true;
  player.bikeCondition = 72;
  player.money = 125;
  return world;
}

describe("Act 1 Beat 5 — Ibu guarantee and move-out finale", () => {
  it("uses deliveries + earnings + first rent + (4.2★ OR Ibu guarantee)", () => {
    const lowRating = finaleWorld(3.2);
    expect(getAct1MoveOutReadiness(lowRating)).toMatchObject({
      deliveriesComplete: true,
      earningsComplete: true,
      firstRentCovered: true,
      ratingComplete: false,
      guaranteeComplete: false,
      ratingOrGuaranteeComplete: false,
      complete: false
    });

    lowRating.collectedPickups[MADE_RECOMMENDATION_LETTER_FLAG] = 901;
    expect(getAct1MoveOutReadiness(lowRating)).toMatchObject({
      ratingComplete: false,
      guaranteeComplete: true,
      ratingOrGuaranteeComplete: true,
      complete: true
    });

    const ratingEdge = finaleWorld(ACT1_MOVE_OUT_DRIVER_RATING);
    expect(getAct1MoveOutReadiness(ratingEdge)).toMatchObject({
      ratingComplete: true,
      guaranteeComplete: false,
      complete: true
    });
    expect(getAct1MoveOutReadiness(finaleWorld(ACT1_MOVE_OUT_DRIVER_RATING - 0.01)).complete).toBe(false);

    for (const incomplete of [
      { deliveries: ACT1_MOVE_OUT_DELIVERIES - 1, earnings: ACT1_MOVE_OUT_DELIVERY_EARNINGS, rentDueDay: 7 },
      { deliveries: ACT1_MOVE_OUT_DELIVERIES, earnings: ACT1_MOVE_OUT_DELIVERY_EARNINGS - 1, rentDueDay: 7 },
      { deliveries: ACT1_MOVE_OUT_DELIVERIES, earnings: ACT1_MOVE_OUT_DELIVERY_EARNINGS, rentDueDay: 4 }
    ]) {
      const world = finaleWorld(4.8);
      world.life.hustle.completedDeliveryCount = incomplete.deliveries;
      world.life.hustle.deliveryEarnings = incomplete.earnings;
      world.life.hustle.rentDueDay = incomplete.rentDueDay;
      expect(getAct1MoveOutReadiness(world).complete).toBe(false);
    }
  });

  it("flips Made's letter condition only through Ibu's eligible scene", () => {
    const world = finaleWorld();
    world.life.hustle.completedDeliveryCount -= 1;
    expect(completeIbuGuaranteeScene(world, 910).ok).toBe(false);
    expect(world.collectedPickups[MADE_RECOMMENDATION_LETTER_FLAG]).toBeUndefined();

    world.life.hustle.completedDeliveryCount = ACT1_MOVE_OUT_DELIVERIES;
    expect(canStartIbuGuaranteeScene(world)).toBe(true);
    expect(completeIbuGuaranteeScene(world, 911)).toMatchObject({
      ok: true,
      dialogue: expect.stringContaining("The app counted your worst day")
    });
    expect(world.collectedPickups[MADE_RECOMMENDATION_LETTER_FLAG]).toBe(911);
    expect(getMadeRoomGoalState(world)).toMatchObject({
      recommendationLetterReady: true,
      description: expect.stringContaining("recommendation letter ✓")
    });
    expect(completeIbuGuaranteeScene(world, 912).ok).toBe(false);
  });

  it("runs key, montage, home swap, weekly contract, and Act 2 boundary once without resetting rating", () => {
    const world = finaleWorld();
    const walletBefore = world.players[world.localPlayerId].money;
    const ratingBefore = world.life.hustle.driverRating;
    expect(completeIbuGuaranteeScene(world, 920).ok).toBe(true);
    expect(acceptMadeFinale(world, 921)).toMatchObject({
      ok: true,
      dialogue: expect.stringContaining("paper is worth more than the app's stars")
    });
    expect(world.collectedPickups[ACT1_MADE_KEY_FLAG]).toBe(921);

    expect(markMoveOutMontageStarted(world, 922)).toBe(true);
    expect(world.collectedPickups[ACT1_MOVE_OUT_MONTAGE_STARTED_FLAG]).toBe(922);
    expect(completeAct1MoveOut(world, 923)).toBe(true);
    expect(world.collectedPickups[ACT1_MOVE_OUT_COMPLETE_FLAG]).toBe(923);
    expect(getPlayerHomeBase(world).id).toBe("shared_room");
    expect(interiorDefinitions.shared_room_interior).toMatchObject({
      venueId: "shared_room",
      name: "Bungalow Shared Room"
    });

    expect(signWeeklyScooterContract(world, 924)).toMatchObject({ ok: true });
    expect(world.collectedPickups[ACT1_WEEKLY_SCOOTER_CONTRACT_FLAG]).toBe(924);
    expect(world.life.hustle.scooterTier).toBe("daily_rental");
    expect(world.players[world.localPlayerId]).toMatchObject({ hasBike: true, bikeStuck: false, bikeCondition: 100 });
    expect(world.players[world.localPlayerId].money).toBe(walletBefore);
    expect(world.life.hustle.driverRating).toBe(ratingBefore);
    expect(world.opportunities.messages.filter((message) => message.id === ACT1_FINALE_LEO_MESSAGE_ID)).toHaveLength(1);
    expect(isAct2Unlocked(world)).toBe(false);

    expect(startAct2AfterFinale(world, 925)).toBe(true);
    expect(world.collectedPickups[ACT2_INTRO_CARD_FLAG]).toBe(925);
    expect(world.life.actProgress.currentAct).toBe(2);
    expect(isAct2Unlocked(world)).toBe(true);
    expect(startAct2AfterFinale(world, 926)).toBe(false);
    expect(signWeeklyScooterContract(world, 926).ok).toBe(false);
  });

  it("keeps a valid home across saves before, during, and after the swap", () => {
    const before = finaleWorld();
    saveWorldState(before);
    expect(getPlayerHomeBase(loadWorldState()).id).toBe("cheap_kos");

    completeIbuGuaranteeScene(before, 930);
    acceptMadeFinale(before, 931);
    markMoveOutMontageStarted(before, 932);
    saveWorldState(before);
    const during = loadWorldState();
    expect(during.collectedPickups[ACT1_MADE_KEY_FLAG]).toBe(931);
    expect(during.collectedPickups[ACT1_MOVE_OUT_MONTAGE_STARTED_FLAG]).toBe(932);
    expect(getPlayerHomeBase(during).id).toBe("cheap_kos");

    completeAct1MoveOut(during, 933);
    saveWorldState(during);
    const after = loadWorldState();
    expect(getPlayerHomeBase(after).id).toBe("shared_room");
    expect(interiorDefinitions[`${getPlayerHomeBase(after).id}_interior`]).toBeDefined();
  });

  it("renders milestone goal copy from constants and does not unlock Act 2 from readiness alone", () => {
    const world = finaleWorld(ACT1_MOVE_OUT_DRIVER_RATING);
    world.life.hustle.moveOutReady = true;
    const goal = getHustleGoalStates(world).find((candidate) => candidate.id === "move_out_ready");
    expect(goal?.description).toContain(`${ACT1_MOVE_OUT_DELIVERIES} deliveries`);
    expect(goal?.description).toContain(`Rp ${ACT1_MOVE_OUT_DELIVERY_EARNINGS}`);
    expect(goal?.description).toContain(`${ACT1_MOVE_OUT_DRIVER_RATING.toFixed(1)}★`);
    expect(goal?.description).toContain("Ibu Sari's guarantee");
    expect(isAct2Unlocked(world)).toBe(false);
  });

  it("reaches every finale precondition from the post-reversal gameplay mutation chain", () => {
    const world = buildDevProofBootState("act1_finale_ready");
    expect(world.life.actProgress.currentAct).toBe(1);
    expect(world.life.hustle.driverRating).toBeLessThan(ACT1_MOVE_OUT_DRIVER_RATING);
    expect(getAct1MoveOutReadiness(world)).toMatchObject({
      deliveriesComplete: true,
      earningsComplete: true,
      firstRentCovered: true,
      ratingComplete: false,
      guaranteeComplete: false,
      complete: false
    });
    expect(canStartIbuGuaranteeScene(world)).toBe(true);
  });
});
