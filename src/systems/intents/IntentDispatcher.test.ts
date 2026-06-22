import { describe, expect, it } from "vitest";
import { createInitialWorldState } from "../WorldState";
import { getRelationship } from "../relationships/RelationshipMemory";
import { IntentDispatcher } from "./IntentDispatcher";

describe("IntentDispatcher", () => {
  it("keeps locked multiplayer as a visible but non-playable portal", () => {
    const world = createInitialWorldState();
    const dispatcher = new IntentDispatcher();

    const locked = dispatcher.dispatch({ kind: "SwitchPortal", mode: "multiplayer" }, world, 100);
    expect(locked).toEqual({
      ok: false,
      message: "Multiplayer is visible but locked in this vertical slice."
    });
    expect(world.portal.current).toBe("single");

    const single = dispatcher.dispatch({ kind: "SwitchPortal", mode: "single" }, world, 101);
    expect(single).toEqual({ ok: true, message: "Single Player active." });
    expect(world.portal.current).toBe("single");
  });

  it("records venue visits through relationship memory", () => {
    const world = createInitialWorldState();
    const dispatcher = new IntentDispatcher();

    const result = dispatcher.dispatch({ kind: "VisitVenue", venueId: "milk_madu_berawa" }, world, 540);

    expect(result).toEqual({ ok: true, message: "Venue visit recorded." });
    expect(getRelationship(world, "venue", "milk_madu_berawa")).toMatchObject({
      affinity: 2,
      lastInteractionAt: 540,
      memories: [{ type: "visited", at: 540, detail: "Phone/venue visit recorded." }]
    });
  });

  it("applies reputation intents against canonical ReputationState", () => {
    const world = createInitialWorldState();
    const dispatcher = new IntentDispatcher();

    dispatcher.dispatch({ kind: "AdjustReputation", delta: 5, reason: "Helped with directions" }, world, 600);
    dispatcher.dispatch({ kind: "AwardReputationTag", tag: "helpful", reason: "Showed a newcomer around" }, world, 601);

    expect(world.reputation.score).toBe(65);
    expect(world.reputation.tags).toEqual(["helpful"]);
    expect(world.reputation.history).toContainEqual({ at: 600, change: "Helped with directions", delta: 5 });
    expect(world.reputation.history).toContainEqual({ at: 601, change: "Showed a newcomer around" });
  });

  it("attends single-player events and rejects locked multiplayer events", () => {
    const world = createInitialWorldState();
    const dispatcher = new IntentDispatcher();

    const missing = dispatcher.dispatch({ kind: "AttendEvent", eventId: "not-a-real-event" }, world, 700);
    expect(missing).toEqual({ ok: false, message: "Event not found." });

    const locked = dispatcher.dispatch({ kind: "AttendEvent", eventId: "berawa_crew_meetup_locked" }, world, 701);
    expect(locked).toEqual({ ok: false, message: "This event requires locked multiplayer." });
    expect(world.runtimeEvents.attendedEventIds).toEqual([]);

    const attended = dispatcher.dispatch({ kind: "AttendEvent", eventId: "surf_morning_berawa" }, world, 702);
    expect(attended).toEqual({ ok: true, message: "Attended Berawa Surf Morning." });
    expect(world.runtimeEvents.attendedEventIds).toEqual(["surf_morning_berawa"]);
    expect(world.reputation.tags).toContain("explorer");
    expect(getRelationship(world, "venue", "berawa_beach")).toMatchObject({
      affinity: 4,
      lastInteractionAt: 702,
      memories: [{ type: "attended_event", at: 702, detail: "Berawa Surf Morning" }]
    });

    dispatcher.dispatch({ kind: "AttendEvent", eventId: "surf_morning_berawa" }, world, 703);
    expect(world.runtimeEvents.attendedEventIds).toEqual(["surf_morning_berawa"]);
  });
});
