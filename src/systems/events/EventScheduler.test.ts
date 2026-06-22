import { describe, expect, it } from "vitest";
import type { PortalState, WorldClockState } from "../../types";
import { formatEventTime, getActiveEvents, getEvent, getUpcomingEvents } from "./EventScheduler";

const lockedSinglePortal: PortalState = {
  current: "single",
  multiplayerStatus: "locked"
};

function clockAt(minuteOfDay: number): WorldClockState {
  return { day: 1, minuteOfDay, minutesPerSecond: 4 };
}

describe("EventScheduler", () => {
  it("finds active events within same-day time windows", () => {
    const activeAtEight = getActiveEvents(clockAt(8 * 60), lockedSinglePortal).map((event) => event.id);
    expect(activeAtEight).toEqual(expect.arrayContaining(["surf_morning_berawa", "satu_satu_cafe_rush"]));

    const activeAtNine = getActiveEvents(clockAt(9 * 60), lockedSinglePortal).map((event) => event.id);
    expect(activeAtNine).toContain("satu_satu_cafe_rush");
    expect(activeAtNine).not.toContain("surf_morning_berawa");
  });

  it("sorts upcoming events by distance and wraps around midnight", () => {
    const morningSoon = getUpcomingEvents(clockAt(7 * 60 + 55), lockedSinglePortal, 10).map((event) => event.id);
    expect(morningSoon).toEqual(["satu_satu_cafe_rush"]);

    const nextMorning = getUpcomingEvents(clockAt(23 * 60 + 50), lockedSinglePortal, 400).map((event) => event.id);
    expect(nextMorning[0]).toBe("surf_morning_berawa");
  });

  it("keeps locked multiplayer events visible for scheduling but not playable", () => {
    const upcoming = getUpcomingEvents(clockAt(17 * 60 + 30), lockedSinglePortal, 60).map((event) => event.id);
    expect(upcoming).toContain("berawa_crew_meetup_locked");
  });

  it("formats event times and resolves definitions by id", () => {
    const brunch = getEvent("milk_madu_brunch_hour");

    expect(brunch?.title).toBe("Milk & Madu Brunch Hour");
    expect(brunch ? formatEventTime(brunch) : "").toBe("10:30-13:00");
    expect(getEvent("missing-event")).toBeUndefined();
  });
});
