import { describe, expect, it } from "vitest";
import { ARI_SURF_RUN_CREW_ID } from "../data/crews";
import { gameEventDefinitions } from "../data/events";
import { acceptDelivery, completeDelivery, pickupDelivery } from "../systems/hustle/DeliverySystem";
import {
  ARI_CREW_INVITATION_LINE,
  ARI_SECRET_PLANT_LINE,
  hasSeenAriSecretPlant,
  prepareAriCrewSessionBeat
} from "../systems/story/Act2AriCrew";
import { completeCrewSession, getCrewState, inviteToCrew, joinCrew } from "../systems/crews/CrewSystem";
import { getActiveEventsAtVenue } from "../systems/events/EventScheduler";
import { getFieldObjective } from "../systems/guidance/FieldObjective";
import { getAct2GoalStates, getAct2NextStep } from "../systems/life/Act2Goals";
import { getEventWorldScenes } from "../systems/world/WorldScenes";
import { createInitialWorldState } from "../systems/WorldState";
import type { GameEvent, WorldState } from "../types";

const crewEvents = gameEventDefinitions.filter((event) => event.crewSession?.crewId === ARI_SURF_RUN_CREW_ID);

function readyWorld(act: 1 | 2 = 2): WorldState {
  const world = createInitialWorldState();
  world.life.actProgress.currentAct = act;
  world.life.actProgress.firstDayComplete = true;
  world.players[world.localPlayerId].hasBike = true;
  world.players[world.localPlayerId].bikeCondition = 100;
  world.life.hustle.completedDeliveryCount = 5;
  world.life.hustle.driverRating = 4.5;
  return world;
}

function finishDelivery(world: WorldState, id: string, now: number) {
  expect(acceptDelivery(world, id, now).ok).toBe(true);
  expect(pickupDelivery(world, now + 1).ok).toBe(true);
  return completeDelivery(world, now + 10, 1);
}

function event(slotId: string): GameEvent {
  return crewEvents.find((candidate) => candidate.crewSession?.sessionSlotId === slotId)!;
}

describe("Ari's Surf & Run Crew invitation", () => {
  it("fires as a scene on the first post-card beach delivery, then never repeats", () => {
    const world = readyWorld();

    expect(finishDelivery(world, "milk_madu_brunch_bag", 1_000).ariCrewInvitation).toEqual({ fired: false });
    const invited = finishDelivery(world, "beach_wristband_pouch", 2_000);
    expect(invited.ariCrewInvitation).toMatchObject({ fired: true });
    expect(invited.ariCrewInvitation?.dialogue).toContain(ARI_CREW_INVITATION_LINE);
    expect(getCrewState(world, ARI_SURF_RUN_CREW_ID)).toMatchObject({ invited: true, member: false });
    expect(finishDelivery(world, "finns_linen_bundle", 3_000).ariCrewInvitation).toEqual({ fired: false });
  });

  it("does not fire before the Act 2 card has completed", () => {
    const world = readyWorld(1);
    expect(finishDelivery(world, "beach_wristband_pouch", 1_000).ariCrewInvitation).toEqual({ fired: false });
    expect(getCrewState(world, ARI_SURF_RUN_CREW_ID).invited).toBe(false);
  });

  it("keeps an accepted Act 2 delivery ahead of the crew nudge until its handoff", () => {
    const world = readyWorld();
    expect(acceptDelivery(world, "milk_madu_brunch_bag", 1_000).ok).toBe(true);
    expect(getFieldObjective(world)).toMatchObject({
      source: "hustle",
      targets: [{ type: "venue", venueId: "milk_madu_berawa" }]
    });
  });
});

describe("Ari's scheduled sessions", () => {
  it("uses Wed/Fri sunset windows and Sunday morning through the existing scheduler", () => {
    const world = readyWorld();
    inviteToCrew(world, ARI_SURF_RUN_CREW_ID);

    world.clock.day = 3;
    world.clock.minuteOfDay = 17 * 60 + 30;
    expect(getActiveEventsAtVenue(world.clock, "berawa_beach", world)).toContain(event("wednesday_sunset_circle"));
    world.clock.day = 5;
    world.clock.minuteOfDay = 18 * 60 + 30;
    expect(getActiveEventsAtVenue(world.clock, "berawa_beach", world)).toContain(event("friday_sunset_circle"));
    world.clock.day = 7;
    world.clock.minuteOfDay = 7 * 60;
    expect(getActiveEventsAtVenue(world.clock, "berawa_beach", world)).toContain(event("sunday_morning_run"));
    world.clock.day = 4;
    world.clock.minuteOfDay = 17 * 60 + 30;
    expect(getActiveEventsAtVenue(world.clock, "berawa_beach", world).filter((item) => item.crewSession)).toEqual([]);
  });

  it("rotates the first three participation beats without repeats and plants Ari's secret once", () => {
    const world = readyWorld();
    inviteToCrew(world, ARI_SURF_RUN_CREW_ID);
    joinCrew(world, ARI_SURF_RUN_CREW_ID);
    const sessions = [
      [event("wednesday_sunset_circle"), 3],
      [event("friday_sunset_circle"), 5],
      [event("sunday_morning_run"), 7]
    ] as const;
    const beats = sessions.map(([session, day], index) => {
      const beat = prepareAriCrewSessionBeat(world, session)!;
      expect(completeCrewSession(world, session, day, 1_000 + index)).toMatchObject({ ok: true });
      return beat;
    });

    expect(new Set(beats.map((beat) => beat.dialogue)).size).toBe(3);
    expect(beats.filter((beat) => beat.includesAriPlant)).toHaveLength(1);
    expect(beats.map((beat) => beat.dialogue).join(" ").match(new RegExp(ARI_SECRET_PLANT_LINE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).toHaveLength(1);
    expect(hasSeenAriSecretPlant(world)).toBe(true);

    const fourth = prepareAriCrewSessionBeat(world, event("wednesday_sunset_circle"))!;
    expect(fourth.includesAriPlant).toBe(false);
    expect(fourth.dialogue).not.toContain(ARI_SECRET_PLANT_LINE);
  });

  it("counts a new-core crew session toward the existing Act 2 rhythm gate", () => {
    const world = readyWorld();
    inviteToCrew(world, ARI_SURF_RUN_CREW_ID);
    joinCrew(world, ARI_SURF_RUN_CREW_ID);
    const session = event("wednesday_sunset_circle");
    world.runtimeEvents.attendedEventIds.push(session.id);
    completeCrewSession(world, session, 3, 1_000);

    expect(getAct2GoalStates(world).find((goal) => goal.id === "attend_club_rhythm")?.complete).toBe(true);
    expect(getAct2NextStep(world)?.title).not.toContain("Attend");
  });

  it("stages five figures including Ari, with circle and run dressing", () => {
    const world = readyWorld();
    inviteToCrew(world, ARI_SURF_RUN_CREW_ID);
    world.clock.day = 3;
    world.clock.minuteOfDay = 17 * 60 + 30;
    const circle = getEventWorldScenes(world).find((scene) => scene.crewId === ARI_SURF_RUN_CREW_ID);
    expect(circle).toMatchObject({
      sceneKind: "crew_sunset_circle",
      cue: "CIRCLE",
      dressing: ["fire", "boards", "closed_laptop"]
    });
    expect(circle?.actors).toHaveLength(5);
    expect(circle?.actors).toContainEqual(expect.objectContaining({ npcId: "ari" }));

    world.clock.day = 7;
    world.clock.minuteOfDay = 7 * 60;
    expect(getEventWorldScenes(world)).toContainEqual(expect.objectContaining({
      crewId: ARI_SURF_RUN_CREW_ID,
      sceneKind: "crew_beach_run",
      dressing: ["run_markers"]
    }));
  });
});
