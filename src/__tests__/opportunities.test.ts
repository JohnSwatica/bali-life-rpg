import { describe, expect, it } from "vitest";
import { opportunityTemplates } from "../data/opportunities";
import { getQuantity } from "../systems/Inventory";
import { updateSettlingInGoals } from "../systems/life/SettlingInGoals";
import {
  acceptOpportunity,
  createDefaultOpportunityState,
  expireOpportunities,
  generateOpportunityPhoneTexts,
  getAbsoluteMinute,
  isOpportunityEligible,
  maintainOpportunityPool,
  resolveOpportunity,
  spawnOpportunity
} from "../systems/opportunities/OpportunityEngine";
import { createInitialWorldState } from "../systems/WorldState";
import type { OpportunityTemplate, WorldState } from "../types";

function template(id: string): OpportunityTemplate {
  const found = opportunityTemplates.find((candidate) => candidate.id === id);
  expect(found).toBeDefined();
  return found!;
}

function setHour(world: WorldState, hour: number): void {
  world.clock.minuteOfDay = hour * 60;
}

describe("opportunity engine", () => {
  it("filters opportunity templates by time, reputation, club, and affinity gates", () => {
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();

    setHour(world, 17);
    expect(isOpportunityEligible(template("finns_trusted_runner"), world, state)).toBe(false);
    world.reputation.score = 72;
    expect(isOpportunityEligible(template("finns_trusted_runner"), world, state)).toBe(true);

    setHour(world, 6.5);
    expect(isOpportunityEligible(template("run_crew_open_slot"), world, state)).toBe(false);
    world.life.joinedClubIds.push("berawa_run_crew");
    expect(isOpportunityEligible(template("run_crew_open_slot"), world, state)).toBe(true);

    setHour(world, 14);
    world.reputation.score = 50;
    expect(isOpportunityEligible(template("focus_table_client_referral"), world, state)).toBe(false);
    world.life.joinedClubIds.push("focus_table_collective");
    expect(isOpportunityEligible(template("focus_table_client_referral"), world, state)).toBe(false);
    world.reputation.score = 58;
    expect(isOpportunityEligible(template("focus_table_client_referral"), world, state)).toBe(true);

    setHour(world, 17);
    expect(isOpportunityEligible(template("ari_sunset_ping"), world, state)).toBe(false);
    world.relationships.push({
      subjectType: "npc",
      subjectId: "ari",
      affinity: 2,
      lastInteractionAt: 1,
      memories: [{ type: "visited", at: 1, detail: "Met at the beach" }]
    });
    expect(isOpportunityEligible(template("ari_sunset_ping"), world, state)).toBe(true);
  });

  it("keeps a deterministic live pool and expires missed opportunities", () => {
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();
    setHour(world, 10.5);

    const spawned = maintainOpportunityPool(state, world, opportunityTemplates, { minLive: 2, maxLive: 4 }).spawned;

    expect(spawned.length).toBeGreaterThanOrEqual(2);
    expect(state.live.length).toBeGreaterThanOrEqual(2);
    expect(state.live.length).toBeLessThanOrEqual(4);
    expect(new Set(state.live.map((opportunity) => opportunity.templateId)).size).toBe(state.live.length);
    expect(state.messages.length).toBeGreaterThanOrEqual(state.live.length);

    setHour(world, 13);
    const expired = maintainOpportunityPool(state, world, opportunityTemplates, { minLive: 2, maxLive: 4 }).expired;

    expect(expired.length).toBeGreaterThan(0);
    expect(state.missedTemplateIds.length).toBeGreaterThan(0);
    for (const missed of expired) {
      expect(state.live.some((opportunity) => opportunity.id === missed.id)).toBe(false);
    }
  });

  it("accepts and resolves an opportunity, applies rewards, and spawns chained momentum", () => {
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();
    setHour(world, 10.75);
    const live = spawnOpportunity(state, template("milk_madu_lunch_rush_shift"), getAbsoluteMinute(world.clock));

    expect(acceptOpportunity(state, live.id, getAbsoluteMinute(world.clock)).ok).toBe(true);
    const result = resolveOpportunity(state, world, live.id);

    expect(result.ok).toBe(true);
    expect(world.players[world.localPlayerId].money).toBe(165);
    expect(world.meters.energy).toBe(60);
    expect(world.reputation.tags).toContain("reliable");
    expect(world.relationships.find((memory) => memory.subjectId === "made")?.affinity).toBeGreaterThan(0);
    expect(world.clock.minuteOfDay).toBe(11 * 60 + 55);
    expect(state.completedTemplateIds).toContain("milk_madu_lunch_rush_shift");
    expect(state.live.some((opportunity) => opportunity.templateId === "milk_madu_after_shift_intro")).toBe(true);
  });

  it("applies help-out rewards to money, items, reputation, relationships, and goals", () => {
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();
    world.opportunities = state;
    setHour(world, 14);
    const live = spawnOpportunity(state, template("canggu_station_dropped_cart"), getAbsoluteMinute(world.clock));
    expect(acceptOpportunity(state, live.id, getAbsoluteMinute(world.clock)).ok).toBe(true);

    const result = resolveOpportunity(state, world, live.id);
    updateSettlingInGoals(world);

    expect(result.ok).toBe(true);
    expect(world.players[world.localPlayerId].money).toBe(95);
    expect(getQuantity(world.players[world.localPlayerId], "pantry_bag")).toBe(1);
    expect(world.reputation.tags).toContain("helpful");
    expect(world.relationships.find((memory) => memory.subjectId === "ibu_sari")?.affinity).toBeGreaterThan(0);
    expect(world.life.completedGoalIds).toContain("plug_in");
  });

  it("gently cools an NPC relationship when an accepted social ping expires", () => {
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();
    setHour(world, 17);
    world.relationships.push({
      subjectType: "npc",
      subjectId: "ari",
      affinity: 2,
      lastInteractionAt: 1,
      memories: [{ type: "visited", at: 1, detail: "Met before" }]
    });
    const live = spawnOpportunity(state, template("ari_sunset_ping"), getAbsoluteMinute(world.clock));
    expect(acceptOpportunity(state, live.id, getAbsoluteMinute(world.clock)).ok).toBe(true);

    setHour(world, 19);
    expireOpportunities(state, world);

    const ariMemory = world.relationships.find((memory) => memory.subjectId === "ari");
    expect(ariMemory?.affinity).toBe(1);
    expect(ariMemory?.memories.some((memory) => memory.type === "missed_opportunity")).toBe(true);
    expect(state.missedTemplateIds).toContain("ari_sunset_ping");
  });

  it("sends a daily Hustle Board nudge after Act 0 when no delivery is active", () => {
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();
    setHour(world, 9);
    world.life.actProgress.firstDayComplete = true;

    const created = generateOpportunityPhoneTexts(state, world);
    expect(created).toContainEqual(expect.objectContaining({ id: "hustle-board:ibu-sari:1", from: "Ibu Sari" }));
    expect(generateOpportunityPhoneTexts(state, world)).toEqual([]);

    world.clock.day = 2;
    world.life.hustle.activeDelivery = {
      deliveryId: "milk_madu_brunch_bag",
      stage: "accepted",
      acceptedAt: getAbsoluteMinute(world.clock),
      dueAt: getAbsoluteMinute(world.clock) + 75
    };
    expect(generateOpportunityPhoneTexts(state, world).some((message) => message.id.startsWith("hustle-board"))).toBe(false);
  });

  it("sends a daily rent reminder only when rent is close", () => {
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();
    world.life.actProgress.firstDayComplete = true;
    world.clock.day = 2;
    world.life.hustle.rentDueDay = 4;
    setHour(world, 10);

    expect(generateOpportunityPhoneTexts(state, world).some((message) => message.id.startsWith("rent-reminder"))).toBe(false);

    world.clock.day = 3;
    const created = generateOpportunityPhoneTexts(state, world);
    expect(created).toContainEqual(
      expect.objectContaining({ id: "rent-reminder:ibu-sari:3", from: "Ibu Sari", body: expect.stringContaining("Rent due tomorrow") })
    );
    expect(generateOpportunityPhoneTexts(state, world).filter((message) => message.id.startsWith("rent-reminder"))).toEqual([]);
  });

  it("sends an Act 2 social invite until the player joins a club", () => {
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 2;
    world.life.hustle.moveOutReady = true;
    setHour(world, 12);

    const created = generateOpportunityPhoneTexts(state, world);
    expect(created).toContainEqual(
      expect.objectContaining({ id: "act2-invite:ari:1", from: "Ari", venueId: "berawa_beach" })
    );
    expect(generateOpportunityPhoneTexts(state, world).filter((message) => message.id.startsWith("act2-invite"))).toEqual([]);

    world.clock.day = 2;
    world.life.joinedClubIds.push("berawa_run_crew");
    expect(generateOpportunityPhoneTexts(state, world).some((message) => message.id.startsWith("act2-invite"))).toBe(false);
  });
});
