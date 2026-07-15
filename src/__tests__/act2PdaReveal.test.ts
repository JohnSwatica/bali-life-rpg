import { describe, expect, it } from "vitest";
import { ARI_SURF_RUN_CREW_ID, KITCHEN_CIRCLE_CREW_ID } from "../data/crews";
import { gameEventDefinitions } from "../data/events";
import { buildDevProofBootState } from "../dev/DevProofStates";
import { IntentDispatcher } from "../systems/intents/IntentDispatcher";
import { appendOpportunityMessage } from "../systems/opportunities/OpportunityEngine";
import { loadWorldState, saveWorldState } from "../systems/Persistence";
import { adjustReputationAxis } from "../systems/reputation/ReputationState";
import { ACT1_LUXURY_TIP_KEEP_FLAG, ACT1_LUXURY_TIP_RETURN_FLAG } from "../systems/story/Act1LuxuryTip";
import { prepareKitchenCircleSessionBeat } from "../systems/story/Act2KitchenCircle";
import {
  buildPdaRevealMessage,
  completePdaReveal,
  getPdaProfileLines,
  getPdaReputationReadModel,
  getPdaRevealHistoryMarkers,
  hasAttendedSunsetCircle,
  hasSeenPdaReveal,
  isPdaRevealEligible,
  isPdaRevealPending,
  PDA_REVEAL_MESSAGE_ID,
  PDA_REVEAL_RELATIONSHIP_COPY
} from "../systems/story/Act2PdaReveal";
import { createInitialWorldState } from "../systems/WorldState";
import type { GameEvent, WorldState } from "../types";
import { installMemoryLocalStorage } from "./testUtils";

const ACT0_CATERING_DELIVERY_ID = "act0_ibu_milk_madu_catering";

installMemoryLocalStorage();

function act2World(): WorldState {
  const world = createInitialWorldState();
  world.life.actProgress.currentAct = 2;
  world.clock.day = 9;
  world.clock.minuteOfDay = 18 * 60 + 15;
  return world;
}

function crewEvent(crewId: string, slotId: string): GameEvent {
  return gameEventDefinitions.find(
    (event) => event.crewSession?.crewId === crewId && event.crewSession.sessionSlotId === slotId
  )!;
}

function attendSunsetCircle(world: WorldState): void {
  const event = crewEvent(ARI_SURF_RUN_CREW_ID, "wednesday_sunset_circle");
  const result = new IntentDispatcher().dispatch({ kind: "AttendEvent", eventId: event.id }, world, 1_000);
  expect(result.ok).toBe(true);
}

function overhearSqueeze(world: WorldState): void {
  const beat = prepareKitchenCircleSessionBeat(
    world,
    crewEvent(KITCHEN_CIRCLE_CREW_ID, "tuesday_evening_kitchen")
  );
  expect(beat?.includesSqueeze).toBe(true);
}

function eligibleWorld(): WorldState {
  const world = act2World();
  attendSunsetCircle(world);
  overhearSqueeze(world);
  return world;
}

describe("Act 2 PDA reveal trigger", () => {
  it("requires an actual sunset-circle attendance and the overheard squeeze", () => {
    const neither = act2World();
    expect(isPdaRevealEligible(neither)).toBe(false);

    const sunsetOnly = act2World();
    attendSunsetCircle(sunsetOnly);
    expect(hasAttendedSunsetCircle(sunsetOnly)).toBe(true);
    expect(isPdaRevealEligible(sunsetOnly)).toBe(false);

    const squeezeOnly = act2World();
    overhearSqueeze(squeezeOnly);
    expect(isPdaRevealEligible(squeezeOnly)).toBe(false);

    const sundayOnly = act2World();
    const run = crewEvent(ARI_SURF_RUN_CREW_ID, "sunday_morning_run");
    new IntentDispatcher().dispatch({ kind: "AttendEvent", eventId: run.id }, sundayOnly, 1_000);
    overhearSqueeze(sundayOnly);
    expect(hasAttendedSunsetCircle(sundayOnly)).toBe(false);
    expect(isPdaRevealEligible(sundayOnly)).toBe(false);

    const both = eligibleWorld();
    expect(isPdaRevealEligible(both)).toBe(true);
    expect(isPdaRevealPending(both)).toBe(true);
  });

  it("emits one Driver Transparency ping and permanently completes only after the phone reveal", () => {
    const world = eligibleWorld();
    const message = buildPdaRevealMessage(world, 4_000);
    expect(message).toMatchObject({
      id: PDA_REVEAL_MESSAGE_ID,
      from: "NusaDrop Update",
      body: expect.stringContaining("Driver transparency initiative"),
      read: false
    });
    expect(appendOpportunityMessage(world.opportunities, message!)).toBe(true);
    expect(buildPdaRevealMessage(world, 4_001)).toBeUndefined();

    expect(completePdaReveal(world)).toBe(true);
    expect(hasSeenPdaReveal(world)).toBe(true);
    expect(isPdaRevealPending(world)).toBe(false);
    expect(completePdaReveal(world)).toBe(false);
  });
});

describe("PDA reputation read model", () => {
  it("projects both live fields without writing reputation or pretending they are strict inverses", () => {
    const world = eligibleWorld();
    world.reputation.rootedAxis = -15;
    world.reputation.relationalAxis = 8;
    const reputationBefore = JSON.stringify(world.reputation);

    const model = getPdaReputationReadModel(world);
    expect(model).toMatchObject({
      rootedAxis: -15,
      relationalAxis: 8,
      communityTrustScore: 43,
      platformEfficiencyScore: 46,
      relationshipCopy: PDA_REVEAL_RELATIONSHIP_COPY
    });
    expect(model.relationshipCopy).toContain("Not a strict seesaw");
    expect(JSON.stringify(world.reputation)).toBe(reputationBefore);

    const efficiencyBefore = model.platformEfficiencyScore;
    adjustReputationAxis(world.reputation, "rooted", 10, "Independent-axis proof", 5_000);
    const afterRootedMove = getPdaReputationReadModel(world);
    expect(afterRootedMove.communityTrustScore).toBe(48);
    expect(afterRootedMove.platformEfficiencyScore).toBe(efficiencyBefore);
  });

  it("writes only reveal state when completed, never either reputation axis", () => {
    const world = eligibleWorld();
    world.reputation.rootedAxis = 17;
    world.reputation.relationalAxis = -22;
    const reputationBefore = JSON.stringify(world.reputation);

    expect(completePdaReveal(world)).toBe(true);
    expect(JSON.stringify(world.reputation)).toBe(reputationBefore);
  });

  it("shows history markers only for branch state that exists in the save", () => {
    const empty = act2World();
    expect(getPdaRevealHistoryMarkers(empty)).toEqual([]);

    const returned = act2World();
    returned.opportunities.completedTemplateIds.push("no_questions_package");
    returned.collectedPickups[ACT1_LUXURY_TIP_RETURN_FLAG] = 1;
    returned.questFlags.act0_v4_opening_complete = true;
    returned.questFlags.act0_negotiated_fee = false;
    returned.questFlags.act0_catering_on_time = true;
    returned.life.hustle.completedDeliveryIds.push(ACT0_CATERING_DELIVERY_ID);
    expect(getPdaRevealHistoryMarkers(returned).map((marker) => marker.id)).toEqual([
      "no-questions-completed",
      "luxury-tip-returned",
      "ibu-deal-gratitude",
      "ibu-catering-on-time"
    ]);

    const kept = act2World();
    kept.opportunities.missedTemplateIds.push("no_questions_package");
    kept.collectedPickups[ACT1_LUXURY_TIP_KEEP_FLAG] = 1;
    kept.questFlags.act0_v4_opening_complete = true;
    kept.questFlags.act0_negotiated_fee = true;
    kept.questFlags.act0_catering_on_time = false;
    kept.life.hustle.completedDeliveryIds.push(ACT0_CATERING_DELIVERY_ID);
    expect(getPdaRevealHistoryMarkers(kept).map((marker) => marker.id)).toEqual([
      "no-questions-declined",
      "luxury-tip-kept",
      "ibu-deal-negotiated",
      "ibu-catering-late"
    ]);
  });

  it("keeps the permanent Profile section hidden until discovery, then derives live axes and markers", () => {
    const world = eligibleWorld();
    world.reputation.rootedAxis = -15;
    world.reputation.relationalAxis = 8;
    world.opportunities.completedTemplateIds.push("no_questions_package");
    world.collectedPickups[ACT1_LUXURY_TIP_RETURN_FLAG] = 1;
    expect(getPdaProfileLines(world)).toEqual([]);

    completePdaReveal(world);
    const lines = getPdaProfileLines(world).join(" ");
    expect(lines).toContain("Efficiency 46/100");
    expect(lines).toContain("metric_x 43/100");
    expect(lines).toContain("No-Questions Package · completed");
    expect(lines).toContain("Villa transfer · returned");
    expect(lines).toContain("what the app rewards");
  });

  it("round-trips the discovered section, live axes, and real history through schema v11", () => {
    const world = eligibleWorld();
    world.reputation.rootedAxis = -15;
    world.reputation.relationalAxis = 8;
    world.opportunities.completedTemplateIds.push("no_questions_package");
    world.collectedPickups[ACT1_LUXURY_TIP_RETURN_FLAG] = 1;
    completePdaReveal(world);

    saveWorldState(world);
    const restored = loadWorldState();

    expect(hasSeenPdaReveal(restored)).toBe(true);
    expect(restored.reputation).toEqual(world.reputation);
    expect(getPdaProfileLines(restored).join(" ")).toContain("metric_x 43/100");
    expect(getPdaRevealHistoryMarkers(restored).map((marker) => marker.id)).toContain("luxury-tip-returned");
  });

  it("builds a divergent proof state through the real opportunity, tip, and crew mutations", () => {
    const world = buildDevProofBootState("act2_pda_reveal_ready");
    expect(world.reputation.rootedAxis).toBe(-15);
    expect(world.reputation.relationalAxis).toBe(8);
    expect(world.opportunities.completedTemplateIds).toContain("no_questions_package");
    expect(world.collectedPickups[ACT1_LUXURY_TIP_RETURN_FLAG]).toBeTruthy();
    expect(isPdaRevealPending(world)).toBe(true);
    expect(getPdaRevealHistoryMarkers(world).map((marker) => marker.id)).toEqual([
      "no-questions-completed",
      "luxury-tip-returned",
      "ibu-deal-negotiated",
      "ibu-catering-delivered"
    ]);
  });
});
