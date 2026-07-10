import { describe, expect, it } from "vitest";
import { getRivalRaceWorldScenes } from "../systems/world/WorldScenes";
import { getAmbientNpcLine } from "../systems/dialogue/DialoguePresentation";
import { getRelationshipChoiceScene, getRelationshipChoiceSceneForNpc } from "../systems/relationships/RelationshipChoiceScenes";
import {
  advanceRivalRaceGhost,
  applyRivalRaceOutcome,
  getRioRaceEligibility,
  resolveRivalRaceOutcome,
  RIO_RACE,
  RIO_RACE_COMPLETED_FLAG,
  RIO_RACE_LOST_FLAG,
  RIO_RACE_WON_FLAG
} from "../systems/ride/RivalRace";
import { createInitialWorldState } from "../systems/WorldState";
import { acceptDelivery, getDeliveryOfferAvailability } from "../systems/hustle/DeliverySystem";

function makeEligibleWorld() {
  const world = createInitialWorldState();
  world.life.actProgress.currentAct = 1;
  world.life.actProgress.firstDayComplete = true;
  world.life.actProgress.act0Step = "complete";
  world.life.hustle.completedDeliveryCount = 3;
  world.life.hustle.driverRating = 3.6;
  world.players[world.localPlayerId].hasBike = true;
  return world;
}

describe("Rio rival race", () => {
  it("gates the one-time race on Act 1 delivery credibility", () => {
    const world = createInitialWorldState();

    expect(getRioRaceEligibility(world)).toMatchObject({ eligible: false });

    const eligible = makeEligibleWorld();
    expect(getRioRaceEligibility(eligible)).toEqual({ eligible: true, reason: null });
    expect(getRivalRaceWorldScenes(eligible)).toContainEqual(
      expect.objectContaining({
        venueId: "bali_family_rental_scooter",
        sceneKind: "race_challenge",
        cue: "RACE",
        actors: [expect.objectContaining({ npcId: "rio" })]
      })
    );

    eligible.collectedPickups[RIO_RACE_COMPLETED_FLAG] = 123;
    expect(getRioRaceEligibility(eligible)).toMatchObject({ eligible: false });
  });

  it("keeps race and delivery work mutually exclusive in both directions", () => {
    const deliveryFirst = makeEligibleWorld();
    deliveryFirst.life.hustle.activeDelivery = {
      deliveryId: "milk_madu_brunch_bag",
      stage: "accepted",
      acceptedAt: 8 * 60,
      dueAt: 9 * 60
    };
    expect(getRioRaceEligibility(deliveryFirst)).toMatchObject({
      eligible: false,
      reason: "Finish the active delivery before racing Rio."
    });

    const raceFirst = makeEligibleWorld();
    raceFirst.activeActivity = {
      source: "rivalRace",
      raceId: RIO_RACE.id,
      venueId: RIO_RACE.venueId,
      venueName: "Bali Family Rental Scooter",
      label: RIO_RACE.title,
      durationMin: 0,
      elapsedMs: 5000,
      realDurationMs: RIO_RACE.maxRaceMs,
      startedAt: 8 * 60
    };
    expect(getDeliveryOfferAvailability(raceFirst).every((offer) => !offer.available)).toBe(true);
    expect(acceptDelivery(raceFirst, "milk_madu_brunch_bag", 8 * 60)).toEqual({
      ok: false,
      message: "Finish Rio's race before taking a delivery."
    });
  });

  it("keeps Rio's challenge as a manual scene, not an automatic quest turn-in", () => {
    const scene = getRelationshipChoiceScene("rio_streak_duel_challenge");

    expect(scene).toBeDefined();
    expect(scene?.trigger).toBe("manual");
    expect(scene?.options[0].actionId).toBe("start_rio_race");
    expect(scene?.options[1].actionId).toBe("decline_rio_race");
    expect(getRelationshipChoiceSceneForNpc("rio")).toBeUndefined();
  });

  it("rubber-bands the ghost within tuned caps without teleport catch-up", () => {
    const step = advanceRivalRaceGhost(RIO_RACE, 0.1, 20_000, 0.9, 1000);

    expect(step.progress).toBeLessThanOrEqual(0.1 + RIO_RACE.ghostMaxStepPerSecond);
    expect(step.progress).toBeLessThan(0.9);

    const closeStep = advanceRivalRaceGhost(RIO_RACE, 0.35, 30_000, 0.4, 1000);
    expect(closeStep.progress).toBeLessThanOrEqual(0.4 + RIO_RACE.ghostLeadCap);
  });

  it("resolves win, loss, timeout, and concede outcomes", () => {
    expect(resolveRivalRaceOutcome({ playerFinishMs: 39_000, ghostFinishMs: 42_000 })).toMatchObject({ result: "win" });
    expect(resolveRivalRaceOutcome({ playerFinishMs: 46_000, ghostFinishMs: 42_000 })).toMatchObject({ result: "loss" });
    expect(resolveRivalRaceOutcome({ timedOut: true })).toMatchObject({ result: "loss", reason: "timed_out" });
    expect(resolveRivalRaceOutcome({ conceded: true })).toMatchObject({ result: "loss", reason: "conceded" });
  });

  it("writes authored outcome consequences without gating progression", () => {
    const winWorld = makeEligibleWorld();
    const moneyBefore = winWorld.players[winWorld.localPlayerId].money;
    applyRivalRaceOutcome(winWorld, { result: "win", reason: "player_beat_ghost" }, 2 * 1440);

    expect(winWorld.players[winWorld.localPlayerId].money).toBe(moneyBefore + RIO_RACE.winPayout);
    expect(winWorld.reputation.relationalAxis).toBeGreaterThan(0);
    expect(winWorld.collectedPickups[RIO_RACE_WON_FLAG]).toBe(2 * 1440);
    expect(winWorld.relationships.find((memory) => memory.subjectId === "rio")?.memories).toContainEqual(
      expect.objectContaining({ type: "lost_to_you_clean" })
    );

    const lossWorld = makeEligibleWorld();
    applyRivalRaceOutcome(lossWorld, { result: "loss", reason: "ghost_beat_player" }, 2 * 1440);

    expect(lossWorld.collectedPickups[RIO_RACE_LOST_FLAG]).toBe(2 * 1440);
    expect(lossWorld.life.actProgress.currentAct).toBe(1);
    expect(lossWorld.life.hustle.completedDeliveryCount).toBe(3);
    expect(lossWorld.relationships.find((memory) => memory.subjectId === "rio")?.memories).toContainEqual(
      expect.objectContaining({ type: "beat_you" })
    );
  });

  it("gives Rio a later ambient follow-up line based on the race result", () => {
    const world = makeEligibleWorld();
    applyRivalRaceOutcome(world, { result: "win", reason: "player_beat_ghost" }, 8 * 60);
    world.clock.day = 2;
    world.clock.minuteOfDay = 9 * 60;

    expect(getAmbientNpcLine(world, "rio", "Rated 4.9.")).toContain("that lap");
  });
});
