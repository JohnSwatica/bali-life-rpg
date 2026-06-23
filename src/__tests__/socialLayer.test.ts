import { describe, expect, it } from "vitest";
import { gameEventDefinitions } from "../data/events";
import { socialGroupDefinitions } from "../data/groups";
import { npcDefinitions } from "../data/npcs";
import { getVenue } from "../systems/venues/VenueRegistry";
import { getActiveEventsAtVenue, getUpcomingEvents } from "../systems/events/EventScheduler";
import { getAllSocialGroups, getSocialGroup, joinSocialGroup } from "../systems/groups/GroupRegistry";
import { IntentDispatcher } from "../systems/intents/IntentDispatcher";
import { bumpRelationshipAffinity, getRelationship } from "../systems/relationships/RelationshipMemory";
import { completeNextRelationshipArcBeat, getRelationshipArcStatesForNpc } from "../systems/relationships/RelationshipArcs";
import { createInitialWorldState } from "../systems/WorldState";
import type { GroupPurpose } from "../types";

describe("social events", () => {
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

  it.skip("applies full on-site attendance meter/time/money effects after that logic is extracted from GameScene", () => {
    // GameScene.attendVenueEvent currently applies participation meter, money, item, time, and NPC affinity effects.
    // The exported IntentDispatcher records the event, reputation, and venue memory seam only.
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
