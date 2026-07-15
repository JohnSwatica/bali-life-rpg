import { describe, expect, it } from "vitest";
import { ACT2_TEST_CREW_ID, crewDefinitions } from "../data/crews";
import { gameEventDefinitions } from "../data/events";
import { getCrewCalendarEntries } from "../systems/crews/CrewCalendar";
import {
  buildCrewSessionOpenMessage,
  completeCrewSession,
  CREW_REGULAR_ATTENDANCE_COUNT,
  getCrewState,
  inviteToCrew,
  joinCrew
} from "../systems/crews/CrewSystem";
import { getActiveEventsAtVenue } from "../systems/events/EventScheduler";
import { appendOpportunityMessage } from "../systems/opportunities/OpportunityEngine";
import { loadWorldState, saveWorldState } from "../systems/Persistence";
import { createInitialWorldState } from "../systems/WorldState";
import { installMemoryLocalStorage } from "./testUtils";

installMemoryLocalStorage();

const session = gameEventDefinitions.find((event) => event.crewSession?.crewId === ACT2_TEST_CREW_ID)!;

function act2World() {
  const world = createInitialWorldState();
  world.life.actProgress.currentAct = 2;
  world.clock.day = 3;
  world.clock.minuteOfDay = 17 * 60 + 15;
  return world;
}

describe("Act 2 crew substrate", () => {
  it("moves through invited and member without exposing crews before Act 2", () => {
    const world = createInitialWorldState();

    expect(inviteToCrew(world, ACT2_TEST_CREW_ID)).toMatchObject({ ok: false });
    world.life.actProgress.currentAct = 2;
    expect(joinCrew(world, ACT2_TEST_CREW_ID)).toMatchObject({ ok: false });
    expect(inviteToCrew(world, ACT2_TEST_CREW_ID)).toMatchObject({ ok: true });
    expect(getCrewState(world, ACT2_TEST_CREW_ID)).toMatchObject({ invited: true, member: false });
    expect(joinCrew(world, ACT2_TEST_CREW_ID)).toMatchObject({ ok: true });
    expect(joinCrew(world, ACT2_TEST_CREW_ID)).toMatchObject({ ok: true });
    expect(world.life.joinedClubIds.filter((id) => id === ACT2_TEST_CREW_ID)).toHaveLength(1);
  });

  it("counts a completed participation beat once per occurrence and becomes regular exactly at three", () => {
    const world = act2World();
    inviteToCrew(world, ACT2_TEST_CREW_ID);
    joinCrew(world, ACT2_TEST_CREW_ID);

    const first = completeCrewSession(world, session, 3, 1_000);
    const duplicate = completeCrewSession(world, session, 3, 1_001);
    const second = completeCrewSession(world, session, 10, 2_000);
    const third = completeCrewSession(world, session, 17, 3_000);
    const fourth = completeCrewSession(world, session, 24, 4_000);

    expect(first).toMatchObject({ ok: true, becameRegular: false, regularBenefitActivated: false });
    expect(duplicate).toMatchObject({ ok: false, becameRegular: false });
    expect(second).toMatchObject({ ok: true, becameRegular: false });
    expect(third).toMatchObject({
      ok: true,
      becameRegular: true,
      regularBenefitActivated: true,
      state: { attendanceCount: CREW_REGULAR_ATTENDANCE_COUNT, regular: true, regularBenefitActive: true }
    });
    expect(fourth).toMatchObject({ ok: true, becameRegular: false, regularBenefitActivated: false });
    expect(getCrewState(world, ACT2_TEST_CREW_ID).attendanceCount).toBe(4);
  });

  it("shows only invited/member crew sessions for this week plus rent day", () => {
    const world = act2World();
    world.clock.day = 1;
    world.life.hustle.rentDueDay = 4;

    expect(getCrewCalendarEntries(world)).toEqual([
      expect.objectContaining({ kind: "rent_day", day: 4 })
    ]);

    inviteToCrew(world, ACT2_TEST_CREW_ID);
    const invited = getCrewCalendarEntries(world);
    expect(invited.map((entry) => entry.kind)).toEqual(["crew_session", "rent_day"]);
    expect(invited[0]).toMatchObject({ membership: "invited", bold: false });
    expect(invited.map((entry) => entry.title).join(" ")).not.toContain("FINNS");
    expect(invited.map((entry) => entry.title).join(" ")).not.toContain("Market Hour");

    joinCrew(world, ACT2_TEST_CREW_ID);
    expect(getCrewCalendarEntries(world)[0]).toMatchObject({ membership: "member", bold: true });
  });

  it("uses the existing scheduler for invited sessions and gates the single open ping to members", () => {
    const world = act2World();
    expect(getActiveEventsAtVenue(world.clock, "berawa_beach", world)).not.toContain(session);

    inviteToCrew(world, ACT2_TEST_CREW_ID);
    expect(getActiveEventsAtVenue(world.clock, "berawa_beach", world)).toContain(session);
    expect(buildCrewSessionOpenMessage(world, session, 1_000, 3, "Berawa Beach")).toBeUndefined();

    joinCrew(world, ACT2_TEST_CREW_ID);
    const message = buildCrewSessionOpenMessage(world, session, 1_000, 3, "Berawa Beach");
    expect(message).toMatchObject({ id: expect.stringContaining("day-3"), from: "Calendar", read: false });
    expect(appendOpportunityMessage(world.opportunities, message!)).toBe(true);
    expect(appendOpportunityMessage(world.opportunities, message!)).toBe(false);
    expect(world.opportunities.messages.filter((candidate) => candidate.id === message!.id)).toHaveLength(1);
  });

  it("round-trips invitation, membership, attendance, regular, and benefit hook in schema v11", () => {
    const world = act2World();
    inviteToCrew(world, ACT2_TEST_CREW_ID);
    joinCrew(world, ACT2_TEST_CREW_ID);
    completeCrewSession(world, session, 3, 1_000);
    completeCrewSession(world, session, 10, 2_000);
    completeCrewSession(world, session, 17, 3_000);

    saveWorldState(world);
    const restored = loadWorldState();

    expect(restored.schemaVersion).toBe(11);
    expect(getCrewState(restored, ACT2_TEST_CREW_ID)).toEqual(getCrewState(world, ACT2_TEST_CREW_ID));
  });

  it("keeps every crew definition anchored and backed by scheduled event slots", () => {
    for (const crew of crewDefinitions) {
      expect(crew.venueId).toBeTruthy();
      expect(crew.sessionSlots.length).toBeGreaterThan(0);
      for (const slot of crew.sessionSlots) {
        expect(
          gameEventDefinitions.some(
            (event) => event.crewSession?.crewId === crew.id && event.crewSession.sessionSlotId === slot.id
          )
        ).toBe(true);
      }
      expect(crew.regularBenefit.id).toBeTruthy();
    }
  });
});
