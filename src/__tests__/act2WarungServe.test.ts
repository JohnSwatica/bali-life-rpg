import { describe, expect, it } from "vitest";
import { KITCHEN_CIRCLE_CREW_ID } from "../data/crews";
import { gameEventDefinitions } from "../data/events";
import { buildDevProofBootState } from "../dev/DevProofStates";
import { getCrewState, inviteToCrew, joinCrew } from "../systems/crews/CrewSystem";
import { getWarungInteriorAccessState } from "../systems/story/Act2StructuralUnlocks";
import {
  buildKitchenBusyNightMessage,
  getKitchenBusyNightMessageId,
  getKitchenBusyNightWeekStart,
  hasSeenKitchenCircleSqueeze,
  isKitchenBusyNightServeAvailable,
  prepareKitchenCircleSessionBeat
} from "../systems/story/Act2KitchenCircle";
import {
  getWarungServeStakesCopy,
  resolveBusyNightWarungServe,
  resolveKitchenSessionWarungServe,
  WARUNG_SERVE_AFFINITY_MAX,
  WARUNG_SERVE_AFFINITY_MIN,
  WARUNG_SERVE_POST_SQUEEZE_COPY,
  WARUNG_SERVE_TIP_MAX,
  WARUNG_SERVE_TIP_MIN
} from "../systems/story/Act2WarungServe";
import { appendOpportunityMessage } from "../systems/opportunities/OpportunityEngine";
import { getRelationship } from "../systems/relationships/RelationshipMemory";
import { createInitialWorldState } from "../systems/WorldState";
import type { GameEvent, WorldState } from "../types";

function worldAt(day: number, minuteOfDay = 18 * 60 + 15): WorldState {
  const world = createInitialWorldState();
  world.life.actProgress.currentAct = 2;
  world.clock.day = day;
  world.clock.minuteOfDay = minuteOfDay;
  world.players[world.localPlayerId].money = 100;
  return world;
}

function makeMember(world: WorldState): void {
  expect(inviteToCrew(world, KITCHEN_CIRCLE_CREW_ID)).toMatchObject({ ok: true });
  expect(joinCrew(world, KITCHEN_CIRCLE_CREW_ID)).toMatchObject({ ok: true });
}

function kitchenEvent(slotId: string): GameEvent {
  return gameEventDefinitions.find(
    (event) => event.crewSession?.crewId === KITCHEN_CIRCLE_CREW_ID && event.crewSession.sessionSlotId === slotId
  )!;
}

function openBusyNight(world: WorldState): number {
  const message = buildKitchenBusyNightMessage(world, 1_000);
  expect(message).toBeDefined();
  expect(appendOpportunityMessage(world.opportunities, message!)).toBe(true);
  return getKitchenBusyNightWeekStart(world.clock.day);
}

describe("Ibu busy-night SERVE entry", () => {
  it("pings members only on the authored Thursday dinner window, at most once per week", () => {
    const unjoined = worldAt(4);
    expect(buildKitchenBusyNightMessage(unjoined, 1_000)).toBeUndefined();

    const member = worldAt(3);
    makeMember(member);
    expect(buildKitchenBusyNightMessage(member, 1_000)).toBeUndefined();
    member.clock.day = 4;
    const first = buildKitchenBusyNightMessage(member, 1_001);
    expect(first).toMatchObject({
      id: getKitchenBusyNightMessageId(4),
      from: "Ibu Sari",
      venueId: "canggu_station",
      read: false
    });
    expect(first?.body).toContain("Crew hands only");
    expect(appendOpportunityMessage(member.opportunities, first!)).toBe(true);
    expect(buildKitchenBusyNightMessage(member, 1_002)).toBeUndefined();
    expect(member.opportunities.messages.filter((message) => message.id.includes("busy-night:week-1"))).toHaveLength(1);

    member.clock.day = 11;
    expect(buildKitchenBusyNightMessage(member, 2_000)?.id).toBe(getKitchenBusyNightMessageId(11));
  });

  it("opens no busy-night launch without its live member ping and grants side-door access only with it", () => {
    const world = worldAt(4);
    makeMember(world);
    expect(isKitchenBusyNightServeAvailable(world)).toBe(false);
    expect(getWarungInteriorAccessState(world)).toMatchObject({ allowed: false, kind: "closed" });

    openBusyNight(world);
    expect(isKitchenBusyNightServeAvailable(world)).toBe(true);
    expect(getWarungInteriorAccessState(world)).toMatchObject({ allowed: true, kind: "busy_night" });
  });
});

describe("SERVE rewards and attendance", () => {
  it("bounds weak and strong busy-night rewards above zero and never changes crew attendance", () => {
    const weak = worldAt(4);
    makeMember(weak);
    const weakWeek = openBusyNight(weak);
    const weakMoney = weak.players[weak.localPlayerId].money;
    const weakResult = resolveBusyNightWarungServe(weak, { kind: "busy_night", weekStartDay: weakWeek }, 0, 1_000);
    expect(weakResult).toMatchObject({
      ok: true,
      residue: { tip: WARUNG_SERVE_TIP_MIN, affinityBump: WARUNG_SERVE_AFFINITY_MIN }
    });
    expect(weak.players[weak.localPlayerId].money).toBe(weakMoney + WARUNG_SERVE_TIP_MIN);
    expect(getRelationship(weak, "npc", "ibu_sari")?.affinity).toBe(WARUNG_SERVE_AFFINITY_MIN);
    expect(getCrewState(weak, KITCHEN_CIRCLE_CREW_ID).attendanceCount).toBe(0);
    expect(weakResult.message).toContain("teasing, not docking");
    expect(isKitchenBusyNightServeAvailable(weak, weakWeek)).toBe(false);

    const strong = worldAt(11);
    makeMember(strong);
    const strongWeek = openBusyNight(strong);
    const strongResult = resolveBusyNightWarungServe(strong, { kind: "busy_night", weekStartDay: strongWeek }, 1, 2_000);
    expect(strongResult).toMatchObject({
      ok: true,
      residue: { tip: WARUNG_SERVE_TIP_MAX, affinityBump: WARUNG_SERVE_AFFINITY_MAX }
    });
  });

  it("counts a session only after its rush resolves, fail-forwards weak play, and rotates strong extra lines", () => {
    const world = worldAt(2);
    makeMember(world);
    const sessions = [
      [kitchenEvent("tuesday_evening_kitchen"), 2],
      [kitchenEvent("saturday_evening_kitchen"), 6],
      [kitchenEvent("tuesday_evening_kitchen"), 9]
    ] as const;
    const extraLines: string[] = [];

    for (const [index, [event, day]] of sessions.entries()) {
      world.clock.day = day;
      const beat = prepareKitchenCircleSessionBeat(world, event);
      expect(beat).toBeDefined();
      expect(getCrewState(world, KITCHEN_CIRCLE_CREW_ID).attendanceCount).toBe(index);
      const result = resolveKitchenSessionWarungServe(world, event, day, index === 0 ? 0 : 1, 1_000 + index * 100);
      expect(result.ok).toBe(true);
      expect(getCrewState(world, KITCHEN_CIRCLE_CREW_ID).attendanceCount).toBe(index + 1);
      if (result.residue?.extraCrewLine) extraLines.push(result.residue.extraCrewLine);
    }

    expect(hasSeenKitchenCircleSqueeze(world)).toBe(true);
    expect(getCrewState(world, KITCHEN_CIRCLE_CREW_ID)).toMatchObject({ attendanceCount: 3, regular: true });
    expect(extraLines).toHaveLength(2);
    expect(new Set(extraLines).size).toBe(2);
    expect(world.runtimeEvents.attendedEventIds).toContain(kitchenEvent("tuesday_evening_kitchen").id);
  });

  it("shows the app-tax line only after the squeeze and supplies a gameplay-reachable proof state", () => {
    const world = worldAt(2);
    makeMember(world);
    expect(getWarungServeStakesCopy(world)).not.toContain(WARUNG_SERVE_POST_SQUEEZE_COPY);
    prepareKitchenCircleSessionBeat(world, kitchenEvent("tuesday_evening_kitchen"));
    expect(getWarungServeStakesCopy(world)).toContain(WARUNG_SERVE_POST_SQUEEZE_COPY);

    const proof = buildDevProofBootState("act2_kitchen_serve_ready");
    expect(proof.clock).toMatchObject({ day: 23, minuteOfDay: 18 * 60 + 15 });
    expect(getCrewState(proof, KITCHEN_CIRCLE_CREW_ID)).toMatchObject({ member: true, regular: true });
  });
});
