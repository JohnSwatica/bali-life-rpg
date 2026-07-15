import { describe, expect, it } from "vitest";
import { ARI_SURF_RUN_CREW_ID, KITCHEN_CIRCLE_CREW_ID } from "../data/crews";
import { gameEventDefinitions } from "../data/events";
import { completeCrewSession, getCrewState, joinCrew } from "../systems/crews/CrewSystem";
import { getActiveEventsAtVenue } from "../systems/events/EventScheduler";
import { getFieldObjective } from "../systems/guidance/FieldObjective";
import { payHustleRent } from "../systems/hustle/HustleEconomy";
import { acceptDelivery, completeDelivery, pickupDelivery } from "../systems/hustle/DeliverySystem";
import { getOccupiedInteriorNpcSlots } from "../systems/interiors/InteriorState";
import { appendOpportunityMessage } from "../systems/opportunities/OpportunityEngine";
import { loadWorldState, saveWorldState } from "../systems/Persistence";
import {
  buildKitchenCircleResidueMessage,
  completeKitchenCircleInvitation,
  consumeKitchenCircleDeflection,
  getAct2IbuDeliveryCount,
  hasSeenKitchenCircleSqueeze,
  isKadekAtKitchenCircleSession,
  isKitchenCircleInvitationEligible,
  KITCHEN_CIRCLE_DEFLECTION_LINE,
  KITCHEN_CIRCLE_INVITATION_LINE,
  KITCHEN_CIRCLE_RESIDUE_MESSAGE_ID,
  KITCHEN_CIRCLE_SQUEEZE_LINE,
  prepareKitchenCircleSessionBeat,
  recordAct2IbuDelivery
} from "../systems/story/Act2KitchenCircle";
import { getEventWorldScenes } from "../systems/world/WorldScenes";
import { createInitialWorldState } from "../systems/WorldState";
import { interiorDefinitions } from "../data/interiors";
import { buildDevProofBootState } from "../dev/DevProofStates";
import type { GameEvent, WorldState } from "../types";
import { installMemoryLocalStorage } from "./testUtils";

installMemoryLocalStorage();

const kitchenEvents = gameEventDefinitions.filter(
  (event) => event.crewSession?.crewId === KITCHEN_CIRCLE_CREW_ID
);

function event(slotId: string): GameEvent {
  return kitchenEvents.find((candidate) => candidate.crewSession?.sessionSlotId === slotId)!;
}

function readyWorld(): WorldState {
  const world = createInitialWorldState();
  world.life.actProgress.currentAct = 2;
  world.life.actProgress.firstDayComplete = true;
  world.players[world.localPlayerId].hasBike = true;
  world.players[world.localPlayerId].bikeCondition = 100;
  world.players[world.localPlayerId].money = 1_500;
  world.life.hustle.completedDeliveryCount = 5;
  world.life.hustle.driverRating = 4.6;
  return world;
}

function finishBoardDelivery(world: WorldState, now: number): void {
  expect(acceptDelivery(world, "milk_madu_brunch_bag", now)).toMatchObject({ ok: true });
  expect(pickupDelivery(world, now + 1)).toMatchObject({ ok: true });
  expect(completeDelivery(world, now + 10, 1)).toMatchObject({ ok: true });
}

describe("Warung Kitchen Circle invitation", () => {
  it("starts the packet proof from a W2-02-complete state without pre-inviting Crew B", () => {
    const world = buildDevProofBootState("act2_ari_crew_complete");

    expect(getCrewState(world, ARI_SURF_RUN_CREW_ID)).toMatchObject({ attendanceCount: 3, regular: true });
    expect(getCrewState(world, KITCHEN_CIRCLE_CREW_ID)).toMatchObject({ invited: false, member: false });
    expect(isKitchenCircleInvitationEligible(world)).toBe(false);
  });

  it("unlocks after two completed Ibu-board deliveries and fires Ibu's summons as a scene", () => {
    const world = readyWorld();

    finishBoardDelivery(world, 1_000);
    expect(getAct2IbuDeliveryCount(world)).toBe(1);
    expect(isKitchenCircleInvitationEligible(world)).toBe(false);
    expect(completeKitchenCircleInvitation(world)).toEqual({ fired: false });

    finishBoardDelivery(world, 2_000);
    expect(getAct2IbuDeliveryCount(world)).toBe(2);
    expect(getFieldObjective(world)).toMatchObject({
      title: "Answer Ibu's summons",
      targets: [{ npcId: "ibu_sari" }]
    });
    const invitation = completeKitchenCircleInvitation(world);
    expect(invitation).toMatchObject({ fired: true });
    expect(invitation.dialogue).toContain(KITCHEN_CIRCLE_INVITATION_LINE);
    expect(getCrewState(world, KITCHEN_CIRCLE_CREW_ID)).toMatchObject({ invited: true, member: false });
    expect(completeKitchenCircleInvitation(world)).toEqual({ fired: false });
  });

  it("also unlocks after the first successful Act 2 rent payment, but not an Act 1 payment", () => {
    const act1 = readyWorld();
    act1.life.actProgress.currentAct = 1;
    expect(payHustleRent(act1, 1_000)).toMatchObject({ ok: true });
    expect(isKitchenCircleInvitationEligible(act1)).toBe(false);

    const act2 = readyWorld();
    expect(payHustleRent(act2, 1_000)).toMatchObject({ ok: true });
    expect(isKitchenCircleInvitationEligible(act2)).toBe(true);
    expect(completeKitchenCircleInvitation(act2).dialogue).toContain(KITCHEN_CIRCLE_INVITATION_LINE);
  });

  it("does not count Ibu-board completions before Act 2", () => {
    const world = readyWorld();
    world.life.actProgress.currentAct = 1;
    recordAct2IbuDelivery(world);
    expect(getAct2IbuDeliveryCount(world)).toBe(0);
  });
});

describe("Warung Kitchen Circle sessions and squeeze", () => {
  it("runs only Tue/Sat evening through the existing event scheduler", () => {
    const world = readyWorld();
    recordAct2IbuDelivery(world);
    recordAct2IbuDelivery(world);
    completeKitchenCircleInvitation(world);

    world.clock.day = 2;
    world.clock.minuteOfDay = 18 * 60 + 30;
    expect(getActiveEventsAtVenue(world.clock, "canggu_station", world)).toContain(event("tuesday_evening_kitchen"));
    world.clock.day = 6;
    expect(getActiveEventsAtVenue(world.clock, "canggu_station", world)).toContain(event("saturday_evening_kitchen"));
    world.clock.day = 3;
    expect(getActiveEventsAtVenue(world.clock, "canggu_station", world).filter((item) => item.crewSession)).toEqual([]);
    world.clock.day = 2;
    world.clock.minuteOfDay = 20 * 60;
    expect(getActiveEventsAtVenue(world.clock, "canggu_station", world).filter((item) => item.crewSession)).toEqual([]);
  });

  it("fires the commission squeeze exactly once at the first attended session and becomes regular at three", () => {
    const world = readyWorld();
    recordAct2IbuDelivery(world);
    recordAct2IbuDelivery(world);
    completeKitchenCircleInvitation(world);
    expect(joinCrew(world, KITCHEN_CIRCLE_CREW_ID)).toMatchObject({ ok: true });

    const sessions = [
      [event("tuesday_evening_kitchen"), 2],
      [event("saturday_evening_kitchen"), 6],
      [event("tuesday_evening_kitchen"), 9]
    ] as const;
    const beats = sessions.map(([session, day], index) => {
      world.clock.day = day;
      const beat = prepareKitchenCircleSessionBeat(world, session)!;
      const attendance = completeCrewSession(world, session, day, 1_000 + index);
      expect(attendance).toMatchObject({ ok: true, becameRegular: index === 2 });
      return beat;
    });

    expect(beats.filter((beat) => beat.includesSqueeze)).toHaveLength(1);
    expect(new Set(beats.map((beat) => beat.dialogue))).toHaveProperty("size", 3);
    expect(beats[0].dialogue).toContain("Thirty percent?");
    expect(beats[0].dialogue).toContain(KITCHEN_CIRCLE_SQUEEZE_LINE);
    expect(beats.slice(1).every((beat) => !beat.dialogue.includes(KITCHEN_CIRCLE_SQUEEZE_LINE))).toBe(true);
    expect(hasSeenKitchenCircleSqueeze(world)).toBe(true);
    expect(getCrewState(world, KITCHEN_CIRCLE_CREW_ID)).toMatchObject({
      attendanceCount: 3,
      regular: true,
      regularBenefitActive: true
    });
  });

  it("offers one proud deflection and posts the quiet menu residue two days later", () => {
    const world = readyWorld();
    recordAct2IbuDelivery(world);
    recordAct2IbuDelivery(world);
    completeKitchenCircleInvitation(world);
    joinCrew(world, KITCHEN_CIRCLE_CREW_ID);
    world.clock.day = 2;
    prepareKitchenCircleSessionBeat(world, event("tuesday_evening_kitchen"));

    expect(consumeKitchenCircleDeflection(world)).toContain(KITCHEN_CIRCLE_DEFLECTION_LINE);
    expect(consumeKitchenCircleDeflection(world)).toBeUndefined();
    world.clock.day = 3;
    expect(buildKitchenCircleResidueMessage(world, 3_000)).toBeUndefined();
    world.clock.day = 4;
    const residue = buildKitchenCircleResidueMessage(world, 4_000);
    expect(residue).toMatchObject({ id: KITCHEN_CIRCLE_RESIDUE_MESSAGE_ID, from: "Warung Sari", read: false });
    expect(residue?.body).toContain("Rp 2 more");
    expect(appendOpportunityMessage(world.opportunities, residue!)).toBe(true);
    expect(buildKitchenCircleResidueMessage(world, 4_001)).toBeUndefined();
  });

  it("stages the session inside the existing warung, with Ibu and Kadek every other session", () => {
    const world = readyWorld();
    recordAct2IbuDelivery(world);
    recordAct2IbuDelivery(world);
    completeKitchenCircleInvitation(world);
    world.clock.day = 2;
    world.clock.minuteOfDay = 18 * 60 + 30;

    const slots = getOccupiedInteriorNpcSlots(world, interiorDefinitions.warung_sari_interior);
    expect(slots).toContainEqual(expect.objectContaining({ npcId: "ibu_sari" }));
    expect(slots).toContainEqual(expect.objectContaining({ npcId: "kadek" }));
    expect(isKadekAtKitchenCircleSession(2)).toBe(true);
    expect(isKadekAtKitchenCircleSession(6)).toBe(false);
    expect(getEventWorldScenes(world)).toContainEqual(expect.objectContaining({
      crewId: KITCHEN_CIRCLE_CREW_ID,
      sceneKind: "crew_kitchen_door",
      cue: "KITCHEN",
      dressing: ["steam", "plates"],
      actors: []
    }));
  });

  it("round-trips invitation, attendance, squeeze, and deflection in schema v11", () => {
    const world = readyWorld();
    recordAct2IbuDelivery(world);
    recordAct2IbuDelivery(world);
    completeKitchenCircleInvitation(world);
    joinCrew(world, KITCHEN_CIRCLE_CREW_ID);
    world.clock.day = 2;
    const session = event("tuesday_evening_kitchen");
    prepareKitchenCircleSessionBeat(world, session);
    consumeKitchenCircleDeflection(world);
    completeCrewSession(world, session, 2, 1_000);

    saveWorldState(world);
    const restored = loadWorldState();
    expect(restored.schemaVersion).toBe(11);
    expect(getCrewState(restored, KITCHEN_CIRCLE_CREW_ID)).toEqual(getCrewState(world, KITCHEN_CIRCLE_CREW_ID));
    expect(hasSeenKitchenCircleSqueeze(restored)).toBe(true);
    expect(consumeKitchenCircleDeflection(restored)).toBeUndefined();
    expect(getAct2IbuDeliveryCount(restored)).toBe(2);
  });
});
