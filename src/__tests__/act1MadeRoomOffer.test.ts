import { describe, expect, it } from "vitest";
import { getHustleGoalStates } from "../systems/hustle/HustleGoals";
import { interiorDefinitions } from "../data/interiors";
import { getOccupiedInteriorNpcSlots } from "../systems/interiors/InteriorState";
import {
  ACT1_MOVE_OUT_DELIVERIES,
  ACT1_MOVE_OUT_DELIVERY_EARNINGS,
  ACT1_MOVE_OUT_DRIVER_RATING,
  ACT1_STEADY_RUNNER_DELIVERIES
} from "../systems/hustle/HustleMilestones";
import { createInitialWorldState } from "../systems/WorldState";
import { getAmbientNpcLine } from "../systems/dialogue/DialoguePresentation";
import {
  buildMadeRoomOfferMessage,
  completeMadeRoomOfferScene,
  getMadeRoomGoalState,
  isMadeRoomOfferPending,
  MADE_ROOM_OFFER_FEED_MESSAGE_ID,
  MADE_ROOM_OFFER_SCENE_FLAG
} from "../systems/story/Act1MadeRoomOffer";
import { getMadeRoomOfferWorldScenes } from "../systems/world/WorldScenes";

function steadyRunnerWorld() {
  const world = createInitialWorldState();
  world.life.actProgress.currentAct = 1;
  world.life.actProgress.firstDayComplete = true;
  world.life.actProgress.act0Step = "complete";
  world.life.hustle.completedDeliveryCount = ACT1_STEADY_RUNNER_DELIVERIES;
  return world;
}

describe("Act 1 TP2 — Made's hidden room offer", () => {
  it("gates Made's persistent invitation on Steady Runner and keeps it until the scene is taken", () => {
    const world = steadyRunnerWorld();
    world.life.hustle.completedDeliveryCount = ACT1_STEADY_RUNNER_DELIVERIES - 1;

    expect(isMadeRoomOfferPending(world)).toBe(false);
    expect(buildMadeRoomOfferMessage(world, 800)).toBeUndefined();
    expect(getMadeRoomOfferWorldScenes(world)).toEqual([]);

    world.life.hustle.completedDeliveryCount = ACT1_STEADY_RUNNER_DELIVERIES;
    const invitation = buildMadeRoomOfferMessage(world, 801);
    expect(invitation).toMatchObject({
      id: MADE_ROOM_OFFER_FEED_MESSAGE_ID,
      from: "Made · Bungalow Living",
      body: expect.stringContaining("worth a conversation"),
      venueId: "bungalow_living"
    });
    world.opportunities.messages.push(invitation!);

    expect(buildMadeRoomOfferMessage(world, 802)).toBeUndefined();
    expect(isMadeRoomOfferPending(world)).toBe(true);
    expect(getMadeRoomOfferWorldScenes(world)).toMatchObject([
      { venueId: "bungalow_living", cue: "MADE", actors: [{ npcId: "made" }] }
    ]);
    world.clock.minuteOfDay = 17 * 60;
    expect(getOccupiedInteriorNpcSlots(world, interiorDefinitions.bungalow_living_interior)).toEqual([
      expect.objectContaining({ npcId: "made" })
    ]);
  });

  it("fires the portrait scene once and leaves the room goal without creating a letter path", () => {
    const world = steadyRunnerWorld();
    const result = completeMadeRoomOfferScene(world, 900);

    expect(result).toMatchObject({ fired: true });
    expect(result.dialogue).toContain("Rent never missed");
    expect(result.dialogue).toContain("recommendation letter from a local business owner");
    expect(result.dialogue).toContain("Everyone pays somebody");
    expect(world.collectedPickups[MADE_ROOM_OFFER_SCENE_FLAG]).toBe(900);
    expect(completeMadeRoomOfferScene(world, 901)).toEqual({ fired: false });
    expect(getMadeRoomOfferWorldScenes(world)).toEqual([]);

    const roomGoal = getMadeRoomGoalState(world);
    expect(roomGoal).toMatchObject({
      title: "Made's room",
      description: "rent record clean ✓ · recommendation letter ✗",
      rentRecordClean: true,
      recommendationLetterReady: false,
      complete: false
    });
    expect(getHustleGoalStates(world)).toContainEqual(expect.objectContaining(roomGoal!));
    expect(getAmbientNpcLine(world, "made", "fallback")).toContain("Business-owner letter");
  });

  it("reads the existing rent due-date state for the room condition and leaves all milestone values alone", () => {
    const world = steadyRunnerWorld();
    completeMadeRoomOfferScene(world, 900);
    world.clock.day = world.life.hustle.rentDueDay + 1;

    expect(getMadeRoomGoalState(world)).toMatchObject({
      description: "rent record clean ✗ · recommendation letter ✗",
      rentRecordClean: false,
      recommendationLetterReady: false
    });
    expect(ACT1_STEADY_RUNNER_DELIVERIES).toBe(3);
    expect(ACT1_MOVE_OUT_DELIVERIES).toBe(5);
    expect(ACT1_MOVE_OUT_DELIVERY_EARNINGS).toBe(600);
    expect(ACT1_MOVE_OUT_DRIVER_RATING).toBe(4.2);
  });
});
