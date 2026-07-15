import { describe, expect, it } from "vitest";
import { ARI_SURF_RUN_CREW_ID, KITCHEN_CIRCLE_CREW_ID } from "../data/crews";
import { gameEventDefinitions } from "../data/events";
import { itemDefinitions } from "../data/items";
import { shopDefinitions } from "../data/shops";
import { buildDevProofBootState } from "../dev/DevProofStates";
import { completeCrewSession, getCrewState, inviteToCrew, joinCrew } from "../systems/crews/CrewSystem";
import { applyEventParticipation } from "../systems/events/EventParticipation";
import { isFocusBufferActive } from "../systems/meters/FocusBuffer";
import { appendOpportunityMessage } from "../systems/opportunities/OpportunityEngine";
import { bumpRelationshipAffinity } from "../systems/relationships/RelationshipMemory";
import { KADEK_PRIORITY_FLAG } from "../systems/story/Act1KadekPriority";
import {
  buildStructuralUnlockMessages,
  getAriCircleInviteExtension,
  getStructuralEventMeterState,
  getStructuralNpcDialogueLine,
  getStructuralShopItemIds,
  getStructuralShopItemOffer,
  getStructuralUnlockProfileLines,
  getWarungInteriorAccessState,
  hasKitchenCircleRegularBenefit,
  hasPurchasedKadekFocusPastryToday,
  hasSurfRunRegularBenefit,
  IBU_BULK_NASI_PRICE,
  isKadekFocusPastryUnlocked,
  isNpcStructuralAffinityUnlocked,
  KADEK_FOCUS_PASTRY_PRICE,
  purchaseKadekFocusBufferPastry,
  SURF_RUN_REGULAR_RECOVERY_BONUS
} from "../systems/story/Act2StructuralUnlocks";
import { createInitialWorldState } from "../systems/WorldState";
import type { GameEvent, WorldState } from "../types";

function act2World(): WorldState {
  const world = createInitialWorldState();
  world.life.actProgress.currentAct = 2;
  world.life.actProgress.firstDayComplete = true;
  world.players[world.localPlayerId].money = 500;
  world.clock.day = 2;
  world.clock.minuteOfDay = 10 * 60;
  return world;
}

function crewEvent(crewId: string, slotId: string): GameEvent {
  return gameEventDefinitions.find(
    (event) => event.crewSession?.crewId === crewId && event.crewSession.sessionSlotId === slotId
  )!;
}

function makeRegular(world: WorldState, crewId: string, event: GameEvent): void {
  expect(inviteToCrew(world, crewId)).toMatchObject({ ok: true });
  expect(joinCrew(world, crewId)).toMatchObject({ ok: true });
  for (const [index, day] of [2, 9, 16].entries()) {
    expect(completeCrewSession(world, event, day, 1_000 + index)).toMatchObject({
      ok: true,
      becameRegular: index === 2
    });
  }
}

function unlockAffinity(world: WorldState, npcId: "ibu_sari" | "kadek" | "ari", amount = 8): void {
  bumpRelationshipAffinity(world, "npc", npcId, amount, "Act 2 structural test", 1_000);
}

describe("Act 2 crew regular structural benefits", () => {
  it("adds a flat run-day recovery bump only to a Surf & Run regular's morning session", () => {
    const run = crewEvent(ARI_SURF_RUN_CREW_ID, "sunday_morning_run");
    const circle = crewEvent(ARI_SURF_RUN_CREW_ID, "wednesday_sunset_circle");
    const world = act2World();

    expect(getStructuralEventMeterState(world, run)).toEqual({ meterDeltas: run.participation.meterDeltas });
    makeRegular(world, ARI_SURF_RUN_CREW_ID, circle);
    expect(hasSurfRunRegularBenefit(world)).toBe(true);
    expect(getStructuralEventMeterState(world, circle)).toEqual({ meterDeltas: circle.participation.meterDeltas });
    expect(getStructuralEventMeterState(world, run)).toMatchObject({
      meterDeltas: {
        energy: (run.participation.meterDeltas.energy ?? 0) + (SURF_RUN_REGULAR_RECOVERY_BONUS.energy ?? 0),
        wellbeing: (run.participation.meterDeltas.wellbeing ?? 0) + (SURF_RUN_REGULAR_RECOVERY_BONUS.wellbeing ?? 0)
      },
      benefitMessage: expect.stringContaining("Energy +4, Wellbeing +4")
    });

    const energyBefore = world.meters.energy;
    const wellbeingBefore = world.meters.wellbeing;
    const result = applyEventParticipation(world, run, 2_000);
    expect(result.benefitMessage).toContain("regular recovery");
    expect(world.meters.energy - energyBefore).toBe(-4);
    expect(world.meters.wellbeing - wellbeingBefore).toBe(12);
  });

  it("gates Ibu's Rp 30 bulk meal price exactly on Kitchen regular status", () => {
    const world = act2World();
    const session = crewEvent(KITCHEN_CIRCLE_CREW_ID, "tuesday_evening_kitchen");
    expect(itemDefinitions.nasi_bungkus.buyPrice).toBe(35);
    expect(getStructuralShopItemOffer(world, "canggu_station", "nasi_bungkus").price).toBe(35);

    makeRegular(world, KITCHEN_CIRCLE_CREW_ID, session);
    expect(hasKitchenCircleRegularBenefit(world)).toBe(true);
    expect(getStructuralShopItemOffer(world, "canggu_station", "nasi_bungkus")).toMatchObject({
      price: IBU_BULK_NASI_PRICE,
      benefitLabel: expect.stringContaining("crew bulk")
    });
  });

  it("opens the Tue/Sat side door for active invitees, then extends it to 22:00 only for regulars", () => {
    const world = act2World();
    const session = crewEvent(KITCHEN_CIRCLE_CREW_ID, "tuesday_evening_kitchen");
    world.clock.day = 2;
    world.clock.minuteOfDay = 18 * 60 + 30;
    expect(getWarungInteriorAccessState(world)).toMatchObject({ allowed: false, kind: "closed" });

    inviteToCrew(world, KITCHEN_CIRCLE_CREW_ID);
    expect(getWarungInteriorAccessState(world)).toMatchObject({ allowed: true, kind: "crew_session" });
    joinCrew(world, KITCHEN_CIRCLE_CREW_ID);
    completeCrewSession(world, session, 2, 1_000);
    completeCrewSession(world, session, 9, 2_000);
    completeCrewSession(world, session, 16, 3_000);

    world.clock.minuteOfDay = 20 * 60 + 30;
    expect(getWarungInteriorAccessState(world)).toMatchObject({
      allowed: true,
      kind: "regular_after_hours",
      message: expect.stringContaining("22:00")
    });
    world.clock.day = 3;
    expect(getWarungInteriorAccessState(world)).toMatchObject({ allowed: false, kind: "closed" });
    world.clock.day = 6;
    world.clock.minuteOfDay = 22 * 60;
    expect(getWarungInteriorAccessState(world)).toMatchObject({ allowed: false, kind: "closed" });
  });
});

describe("Act 2 affinity-tier structural benefits", () => {
  it("uses the existing friendly tier for Ibu's warmer pool and you-eat-first shop priority", () => {
    const world = act2World();
    expect(isNpcStructuralAffinityUnlocked(world, "ibu_sari")).toBe(false);
    expect(getStructuralNpcDialogueLine(world, "ibu_sari")).toBeUndefined();
    expect(getStructuralShopItemIds(world, shopDefinitions.canggu_station)[0]).not.toBe("nasi_bungkus");

    unlockAffinity(world, "ibu_sari", 7);
    expect(isNpcStructuralAffinityUnlocked(world, "ibu_sari")).toBe(false);
    unlockAffinity(world, "ibu_sari", 1);
    expect(isNpcStructuralAffinityUnlocked(world, "ibu_sari")).toBe(true);
    expect(getStructuralNpcDialogueLine(world, "ibu_sari")).toMatch(/eat first|Sit|Rice before ratings/);
    expect(getStructuralShopItemIds(world, shopDefinitions.canggu_station)[0]).toBe("nasi_bungkus");
    expect(getStructuralShopItemOffer(world, "canggu_station", "nasi_bungkus")).toMatchObject({
      displayName: expect.stringContaining("You eat first")
    });
  });

  it("sells Kadek's existing three-hour Focus Buffer for Rp 18 once per day after friendly + priority", () => {
    const world = act2World();
    unlockAffinity(world, "kadek");
    expect(isKadekFocusPastryUnlocked(world)).toBe(false);
    world.collectedPickups[KADEK_PRIORITY_FLAG] = 1_000;
    expect(isKadekFocusPastryUnlocked(world)).toBe(true);
    expect(getStructuralShopItemIds(world, shopDefinitions.baked_berawa)[0]).toBe("focus_buffer_pastry");
    expect(getStructuralShopItemOffer(world, "baked_berawa", "focus_buffer_pastry")).toMatchObject({
      price: KADEK_FOCUS_PASTRY_PRICE,
      available: true
    });

    const now = (world.clock.day - 1) * 1440 + world.clock.minuteOfDay;
    const first = purchaseKadekFocusBufferPastry(world, now);
    expect(first).toMatchObject({ ok: true, bufferUntil: now + 180 });
    expect(world.players[world.localPlayerId].money).toBe(500 - KADEK_FOCUS_PASTRY_PRICE);
    expect(isFocusBufferActive(world, now + 179)).toBe(true);
    expect(isFocusBufferActive(world, now + 180)).toBe(false);
    expect(hasPurchasedKadekFocusPastryToday(world)).toBe(true);
    expect(purchaseKadekFocusBufferPastry(world, now + 10)).toMatchObject({ ok: false, message: expect.stringContaining("per day") });

    world.clock.day += 1;
    const nextDay = now + 1440;
    expect(hasPurchasedKadekFocusPastryToday(world)).toBe(false);
    expect(purchaseKadekFocusBufferPastry(world, nextDay)).toMatchObject({ ok: true, bufferUntil: nextDay + 180 });
  });

  it("gates Ari's organizer +1 on friendly affinity and beach ambient tier on crew regular", () => {
    const world = act2World();
    expect(getAriCircleInviteExtension(world)).toBeUndefined();
    expect(getStructuralNpcDialogueLine(world, "ari")).toBeUndefined();

    unlockAffinity(world, "ari");
    expect(getAriCircleInviteExtension(world)).toMatch(/Bring someone next time/);
    expect(getStructuralNpcDialogueLine(world, "ari")).toBeUndefined();

    makeRegular(world, ARI_SURF_RUN_CREW_ID, crewEvent(ARI_SURF_RUN_CREW_ID, "wednesday_sunset_circle"));
    expect(getStructuralNpcDialogueLine(world, "ari")).toContain("Regulars know");
  });
});

describe("structural unlock surfaces", () => {
  it("builds the regular-in-both proof state through real participation and exact unlock gates", () => {
    const world = buildDevProofBootState("act2_both_crews_regular");

    expect(getCrewState(world, ARI_SURF_RUN_CREW_ID)).toMatchObject({
      attendanceCount: 3,
      regular: true,
      regularBenefitActive: true
    });
    expect(getCrewState(world, KITCHEN_CIRCLE_CREW_ID)).toMatchObject({
      attendanceCount: 3,
      regular: true,
      regularBenefitActive: true
    });
    expect(isNpcStructuralAffinityUnlocked(world, "ibu_sari")).toBe(true);
    expect(isNpcStructuralAffinityUnlocked(world, "kadek")).toBe(true);
    expect(isNpcStructuralAffinityUnlocked(world, "ari")).toBe(true);
    expect(isKadekFocusPastryUnlocked(world)).toBe(true);
  });

  it("announces every earned unlock once and derives all five Profile rows", () => {
    const world = act2World();
    makeRegular(world, ARI_SURF_RUN_CREW_ID, crewEvent(ARI_SURF_RUN_CREW_ID, "wednesday_sunset_circle"));
    makeRegular(world, KITCHEN_CIRCLE_CREW_ID, crewEvent(KITCHEN_CIRCLE_CREW_ID, "tuesday_evening_kitchen"));
    unlockAffinity(world, "ibu_sari");
    unlockAffinity(world, "kadek");
    unlockAffinity(world, "ari");
    world.collectedPickups[KADEK_PRIORITY_FLAG] = 1_000;

    const messages = buildStructuralUnlockMessages(world, 4_000);
    expect(messages).toHaveLength(5);
    expect(new Set(messages.map((message) => message.id))).toHaveProperty("size", 5);
    expect(messages.map((message) => message.body).join(" ")).toContain("Rp 30");
    expect(messages.map((message) => message.body).join(" ")).toContain("Rp 18");
    for (const message of messages) {
      expect(appendOpportunityMessage(world.opportunities, message)).toBe(true);
    }
    expect(buildStructuralUnlockMessages(world, 4_001)).toEqual([]);

    const profileLines = getStructuralUnlockProfileLines(world);
    expect(profileLines).toHaveLength(5);
    expect(profileLines.join(" ")).toMatch(/Surf & Run regular/);
    expect(profileLines.join(" ")).toMatch(/Kitchen regular/);
    expect(profileLines.join(" ")).toMatch(/Ibu friendly/);
    expect(profileLines.join(" ")).toMatch(/Kadek friendly/);
    expect(profileLines.join(" ")).toMatch(/Ari friendly/);
  });
});
