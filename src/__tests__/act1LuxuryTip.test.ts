import { describe, expect, it } from "vitest";
import { getRelationshipChoiceScene, getRelationshipChoiceSkipOption } from "../systems/relationships/RelationshipChoiceScenes";
import { acceptDelivery, completeDelivery, pickupDelivery } from "../systems/hustle/DeliverySystem";
import { createInitialWorldState } from "../systems/WorldState";
import {
  ACT1_BREAKDOWN_FLAG,
  ACT1_BREAKDOWN_RESOLVED_FLAG
} from "../systems/story/Act1Breakdown";
import {
  ACT1_LUXURY_TIP_KEEP_AMOUNT,
  ACT1_LUXURY_TIP_KEEP_FLAG,
  ACT1_LUXURY_TIP_KEEP_MESSAGE_ID,
  ACT1_LUXURY_TIP_PENDING_FLAG,
  ACT1_LUXURY_TIP_RESOLVED_FLAG,
  ACT1_LUXURY_TIP_RETURN_AMOUNT,
  ACT1_LUXURY_TIP_RETURN_FLAG,
  ACT1_LUXURY_TIP_RETURN_MESSAGE_ID,
  ACT1_LUXURY_TIP_SCENE_ID,
  ACT1_VILLA_REGULAR_FLAG,
  getVillaRegularAmbientLine,
  resolveAct1LuxuryTipChoice,
  triggerAct1LuxuryTipDilemma
} from "../systems/story/Act1LuxuryTip";
import type { WorldState } from "../types";
import { loadWorldState, saveWorldState } from "../systems/Persistence";
import { installMemoryLocalStorage } from "./testUtils";

installMemoryLocalStorage();

const VILLA_DELIVERY_ID = "milk_madu_brunch_bag";
const NON_VILLA_DELIVERY_ID = "satu_satu_invoice_pouch";

function act1BoardWorld(reversal = false): WorldState {
  const world = createInitialWorldState();
  const player = world.players[world.localPlayerId];
  world.life.actProgress.currentAct = 1;
  world.life.actProgress.firstDayComplete = true;
  world.life.actProgress.act0Step = "complete";
  world.life.hustle.completedDeliveryCount = 3;
  world.life.hustle.driverRating = 4.4;
  player.hasBike = true;
  player.bikeCondition = 80;
  player.money = 100;
  if (reversal) {
    world.collectedPickups[ACT1_BREAKDOWN_FLAG] = 700;
    world.collectedPickups[ACT1_BREAKDOWN_RESOLVED_FLAG] = 720;
  }
  return world;
}

function completeRun(world: WorldState, deliveryId: string, now = 800) {
  expect(acceptDelivery(world, deliveryId, now)).toMatchObject({ ok: true });
  expect(pickupDelivery(world, now + 8)).toMatchObject({ ok: true });
  return completeDelivery(world, now + 30, 1);
}

describe("Act 1 Beat 4 — Luxury Tip Dilemma", () => {
  it("gates on a completed post-reversal villa board run", () => {
    const beforeReversal = act1BoardWorld(false);
    expect(completeRun(beforeReversal, VILLA_DELIVERY_ID).luxuryTipScene).toMatchObject({ fired: false });
    expect(beforeReversal.questFlags[ACT1_LUXURY_TIP_PENDING_FLAG]).toBeUndefined();

    const nonVilla = act1BoardWorld(true);
    expect(completeRun(nonVilla, NON_VILLA_DELIVERY_ID).luxuryTipScene).toMatchObject({ fired: false });
    expect(nonVilla.questFlags[ACT1_LUXURY_TIP_PENDING_FLAG]).toBeUndefined();

    const villa = act1BoardWorld(true);
    expect(completeRun(villa, VILLA_DELIVERY_ID).luxuryTipScene).toEqual({
      fired: true,
      sceneId: ACT1_LUXURY_TIP_SCENE_ID
    });
    expect(villa.questFlags[ACT1_LUXURY_TIP_PENDING_FLAG]).toBe(VILLA_DELIVERY_ID);
  });

  it("never fires on the authored breakdown run itself", () => {
    const world = act1BoardWorld(true);
    expect(triggerAct1LuxuryTipDilemma(world, VILLA_DELIVERY_ID, true)).toEqual({ fired: false });
  });

  it("keeps Rp 500 once, writes efficiency residue, and leaves rating and delivery earnings alone", () => {
    const world = act1BoardWorld(true);
    const moneyBefore = world.players[world.localPlayerId].money;
    const earningsBefore = world.life.hustle.deliveryEarnings;
    const ratingBefore = world.life.hustle.driverRating;
    expect(triggerAct1LuxuryTipDilemma(world, VILLA_DELIVERY_ID).fired).toBe(true);

    expect(resolveAct1LuxuryTipChoice(world, "keep", 900)).toEqual({
      ok: true,
      choice: "keep",
      walletDelta: ACT1_LUXURY_TIP_KEEP_AMOUNT
    });
    expect(world.players[world.localPlayerId].money).toBe(moneyBefore + 500);
    expect(world.life.hustle.deliveryEarnings).toBe(earningsBefore);
    expect(world.life.hustle.driverRating).toBe(ratingBefore);
    expect(world.reputation.relationalAxis).toBe(-8);
    expect(world.reputation.hiddenFlags).toContainEqual(expect.objectContaining({ type: "red", source: ACT1_LUXURY_TIP_SCENE_ID }));
    expect(world.collectedPickups[ACT1_LUXURY_TIP_KEEP_FLAG]).toBe(900);
    expect(world.collectedPickups[ACT1_LUXURY_TIP_RESOLVED_FLAG]).toBe(900);
    expect(world.opportunities.messages.filter((message) => message.id === ACT1_LUXURY_TIP_KEEP_MESSAGE_ID)).toHaveLength(1);
    expect(resolveAct1LuxuryTipChoice(world, "keep", 901).ok).toBe(false);
  });

  it("returns the excess, pays Rp 50, and plants the remembered villa regular", () => {
    const world = act1BoardWorld(true);
    const moneyBefore = world.players[world.localPlayerId].money;
    const earningsBefore = world.life.hustle.deliveryEarnings;
    expect(triggerAct1LuxuryTipDilemma(world, VILLA_DELIVERY_ID).fired).toBe(true);

    expect(resolveAct1LuxuryTipChoice(world, "return", 920)).toEqual({
      ok: true,
      choice: "return",
      walletDelta: ACT1_LUXURY_TIP_RETURN_AMOUNT
    });
    expect(world.players[world.localPlayerId].money).toBe(moneyBefore + 50);
    expect(world.life.hustle.deliveryEarnings).toBe(earningsBefore);
    expect(world.reputation.relationalAxis).toBe(8);
    expect(world.reputation.hiddenFlags).toContainEqual(expect.objectContaining({ type: "green", source: ACT1_LUXURY_TIP_SCENE_ID }));
    expect(world.collectedPickups[ACT1_LUXURY_TIP_RETURN_FLAG]).toBe(920);
    expect(world.collectedPickups[ACT1_VILLA_REGULAR_FLAG]).toBe(920);
    expect(world.opportunities.messages.filter((message) => message.id === ACT1_LUXURY_TIP_RETURN_MESSAGE_ID)).toHaveLength(1);
    expect(getVillaRegularAmbientLine(world, VILLA_DELIVERY_ID)).toContain("remembered your name");
    expect(getVillaRegularAmbientLine(world, NON_VILLA_DELIVERY_ID)).toBeUndefined();
  });

  it("fires only once after either branch", () => {
    const world = act1BoardWorld(true);
    expect(triggerAct1LuxuryTipDilemma(world, VILLA_DELIVERY_ID).fired).toBe(true);
    expect(resolveAct1LuxuryTipChoice(world, "return", 940).ok).toBe(true);
    expect(triggerAct1LuxuryTipDilemma(world, VILLA_DELIVERY_ID)).toEqual({ fired: false });
  });

  it("persists a pending choice across save/load and can still resolve it", () => {
    const world = act1BoardWorld(true);
    expect(triggerAct1LuxuryTipDilemma(world, VILLA_DELIVERY_ID).fired).toBe(true);
    saveWorldState(world);

    const restored = loadWorldState();
    expect(restored.questFlags[ACT1_LUXURY_TIP_PENDING_FLAG]).toBe(VILLA_DELIVERY_ID);
    expect(resolveAct1LuxuryTipChoice(restored, "return", 950)).toMatchObject({
      ok: true,
      choice: "return",
      walletDelta: ACT1_LUXURY_TIP_RETURN_AMOUNT
    });
  });

  it("uses the existing choice scene and resolves skip to RETURN", () => {
    const scene = getRelationshipChoiceScene(ACT1_LUXURY_TIP_SCENE_ID);
    expect(scene).toMatchObject({
      trigger: "manual",
      speakerName: "Villa Guest",
      skipOptionIndex: 1
    });
    expect(scene?.options.map((option) => option.actionId)).toEqual([
      "keep_act1_luxury_tip",
      "return_act1_luxury_tip"
    ]);
    expect(getRelationshipChoiceSkipOption(scene!)?.actionId).toBe("return_act1_luxury_tip");
    expect(scene?.options.every((option) => !/good|bad|karma/i.test(option.label))).toBe(true);
  });
});
