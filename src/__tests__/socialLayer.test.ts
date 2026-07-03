import { describe, expect, it } from "vitest";
import { gameEventDefinitions } from "../data/events";
import { socialGroupDefinitions } from "../data/groups";
import { npcDefinitions } from "../data/npcs";
import { getQuantity } from "../systems/Inventory";
import { applyEventParticipation } from "../systems/events/EventParticipation";
import { getVenue } from "../systems/venues/VenueRegistry";
import { getActiveEventsAtVenue, getUpcomingEvents } from "../systems/events/EventScheduler";
import { getAllSocialGroups, getMembershipDebugState, getSocialGroup, joinSocialGroup } from "../systems/groups/GroupRegistry";
import { IntentDispatcher } from "../systems/intents/IntentDispatcher";
import { bumpRelationshipAffinity, getRelationship } from "../systems/relationships/RelationshipMemory";
import { completeNextRelationshipArcBeat, getRelationshipArcStatesForNpc } from "../systems/relationships/RelationshipArcs";
import { createInitialWorldState } from "../systems/WorldState";
import type { GroupPurpose } from "../types";

describe("social events", () => {
  it("dispatches hidden reputation-axis intents", () => {
    const world = createInitialWorldState();
    const result = new IntentDispatcher().dispatch(
      { kind: "AdjustReputationAxis", axis: "relational", delta: 4, reason: "Asked Kadek about baking" },
      world,
      8 * 60
    );

    expect(result).toMatchObject({ ok: true });
    expect(world.reputation.relationalAxis).toBe(4);
    expect(world.reputation.score).toBe(60);
    expect(world.reputation.history.at(-1)).toEqual({ at: 8 * 60, change: "Asked Kadek about baking", delta: 0 });
  });

  it("activates events on the authored day/time window", () => {
    const world = createInitialWorldState();
    world.clock.day = 1;
    world.clock.minuteOfDay = 7 * 60;

    expect(getActiveEventsAtVenue(world.clock, "berawa_beach", world).map((event) => event.id)).toContain("berawa_beach_run_morning");

    world.clock.minuteOfDay = 8 * 60 + 1;
    expect(getActiveEventsAtVenue(world.clock, "berawa_beach", world).map((event) => event.id)).not.toContain("berawa_beach_run_morning");
  });

  it("keeps all event host and location references resolvable", () => {
    for (const event of gameEventDefinitions) {
      expect(getVenue(event.locationVenueId), `${event.id} location`).toBeDefined();
      if (event.host.type === "venue") {
        expect(getVenue(event.host.id), `${event.id} venue host`).toBeDefined();
      } else if (event.host.type === "npc") {
        expect(npcDefinitions[event.host.id], `${event.id} npc host`).toBeDefined();
      } else if (event.host.type === "group") {
        expect(getSocialGroup(event.host.id), `${event.id} group host`).toBeDefined();
      }
    }
  });

  it("records event attendance through the intent seam", () => {
    const world = createInitialWorldState();
    const result = new IntentDispatcher().dispatch({ kind: "AttendEvent", eventId: "berawa_beach_run_morning" }, world, 7 * 60);

    expect(result.ok).toBe(true);
    expect(world.runtimeEvents.attendedEventIds).toEqual(["berawa_beach_run_morning"]);
    expect(getRelationship(world, "venue", "berawa_beach")?.memories.at(-1)).toMatchObject({
      type: "attended_event",
      detail: "Berawa Beach Run"
    });
    expect(world.reputation.tags).toContain("explorer");
  });

  it("applies full on-site attendance meter/time/money effects through the event participation seam", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    const event = gameEventDefinitions.find((candidate) => candidate.id === "canggu_station_market_hour")!;
    world.clock.day = 1;
    world.clock.minuteOfDay = 15 * 60;
    player.money = 500;

    const participation = applyEventParticipation(world, event, 15 * 60);
    const intent = new IntentDispatcher().dispatch({ kind: "AttendEvent", eventId: event.id }, world, 16 * 60 + 15);

    expect(participation).toMatchObject({ ok: true, moneyDelta: -45, completedAt: 16 * 60 + 15 });
    expect(intent.ok).toBe(true);
    expect(player.money).toBe(455);
    expect(world.clock).toMatchObject({ day: 1, minuteOfDay: 16 * 60 + 15 });
    expect(world.meters).toMatchObject({ energy: 86, wellbeing: 74, social: 44 });
    expect(getQuantity(player, "pantry_bag")).toBe(1);
    expect(getRelationship(world, "npc", "ibu_sari")?.affinity).toBe(5);
    expect(world.runtimeEvents.attendedEventIds).toEqual(["canggu_station_market_hour"]);
    expect(getRelationship(world, "venue", "canggu_station")?.memories.at(-1)).toMatchObject({
      type: "attended_event",
      detail: "Market Hour Walk"
    });
    expect(world.reputation.tags).toContain("helpful");
  });
});

describe("clubs and groups", () => {
  it("stores joined clubs and reveals membership-gated recurring events", () => {
    const world = createInitialWorldState();
    world.clock.day = 1;
    world.clock.minuteOfDay = 8 * 60;

    const before = getUpcomingEvents(world.clock, world, 4 * 1440).map((event) => event.id);
    const result = joinSocialGroup(world, "berawa_run_crew", 1);
    const after = getUpcomingEvents(world.clock, world, 4 * 1440).map((event) => event.id);

    expect(result.ok).toBe(true);
    expect(world.life.joinedClubIds).toEqual(["berawa_run_crew"]);
    expect(before).not.toContain("berawa_run_crew_loop");
    expect(after).toContain("berawa_run_crew_loop");
  });

  it("exposes canonical joined clubs separately from legacy player group travel state", () => {
    const world = createInitialWorldState();
    const result = new IntentDispatcher().dispatch({ kind: "JoinClub", groupId: "berawa_run_crew" }, world, 1);
    const debug = getMembershipDebugState(world);

    expect(result.ok).toBe(true);
    expect(debug.joinedClubIds).toEqual(["berawa_run_crew"]);
    expect(debug.legacyJoinedGroupIds).toEqual([]);
  });

  it("keeps group purpose generic and references resolvable", () => {
    const reservedPurpose: GroupPurpose = "housing";
    expect(reservedPurpose).toBe("housing");

    for (const group of getAllSocialGroups()) {
      expect(socialGroupDefinitions.some((candidate) => candidate.id === group.id)).toBe(true);
      expect(["social", "run", "coworking", "surf", "food", "housing"]).toContain(group.purpose);
      if (group.homeVenueId) {
        expect(getVenue(group.homeVenueId), `${group.id} home venue`).toBeDefined();
      }
      for (const memberId of group.memberIds) {
        expect(npcDefinitions[memberId], `${group.id} member ${memberId}`).toBeDefined();
      }
      for (const eventId of group.recurringEventIds ?? []) {
        expect(gameEventDefinitions.some((event) => event.id === eventId), `${group.id} event ${eventId}`).toBe(true);
      }
    }
  });
});

describe("relationship arcs", () => {
  it("advances beats only when affinity and event gates are satisfied", () => {
    const world = createInitialWorldState();
    bumpRelationshipAffinity(world, "npc", "ari", 8, "test affinity", 1);

    const first = completeNextRelationshipArcBeat(world, "ari", 2);
    expect(first?.beat.id).toBe("ari_remembers_your_name");

    const blocked = getRelationshipArcStatesForNpc(world, "ari").find((state) => state.beat.id === "ari_run_crew_invite");
    expect(blocked).toMatchObject({ available: false, blockedReason: "attend berawa_beach_run_morning" });

    world.runtimeEvents.attendedEventIds.push("berawa_beach_run_morning");
    const second = completeNextRelationshipArcBeat(world, "ari", 3);
    expect(second?.beat.id).toBe("ari_run_crew_invite");
    expect(world.life.joinedClubIds).toContain("berawa_run_crew");
  });

  it("respects starter-quest gates on Ibu Sari's arc", () => {
    const world = createInitialWorldState();
    bumpRelationshipAffinity(world, "npc", "ibu_sari", 8, "test affinity", 1);

    expect(getRelationshipArcStatesForNpc(world, "ibu_sari")[0]).toMatchObject({
      available: false,
      blockedReason: "complete canggu_station_restock"
    });

    world.players[world.localPlayerId].completedQuestIds.push("canggu_station_restock");
    const beat = completeNextRelationshipArcBeat(world, "ibu_sari", 2);
    expect(beat?.beat.id).toBe("sari_knows_you_help");
    expect(world.life.relationshipArcProgress.ibu_sari_neighborhood_net.completedBeatIds).toEqual(["sari_knows_you_help"]);
  });
});
