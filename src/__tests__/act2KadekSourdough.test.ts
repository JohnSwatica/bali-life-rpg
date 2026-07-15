import { describe, expect, it } from "vitest";
import { KITCHEN_CIRCLE_CREW_ID } from "../data/crews";
import { gameEventDefinitions } from "../data/events";
import { buildDevProofBootState } from "../dev/DevProofStates";
import { getDeliveryOfferAvailability, acceptDelivery, completeDelivery, pickupDelivery } from "../systems/hustle/DeliverySystem";
import { getRelationshipChoiceScene, getRelationshipChoiceSkipOption } from "../systems/relationships/RelationshipChoiceScenes";
import { getRelationship } from "../systems/relationships/RelationshipMemory";
import {
  ACT2_KADEK_EXPOSE_ROOTED_DELTA,
  ACT2_KADEK_PROTECT_ROOTED_DELTA,
  ACT2_KADEK_SOURDOUGH_DELIVERY_ID,
  ACT2_KADEK_SOURDOUGH_SCENE_ID,
  didKadekEndMoonlightingOnDay,
  getKadekSourdoughChoice,
  getKadekSourdoughEndingResidue,
  hasKadekSourdoughEvidence,
  hasResolvedKadekSourdoughChoice,
  isKadekMoonlightingEndPending,
  isKadekSourdoughChoicePending,
  isKadekSourdoughEligible,
  resolveKadekSourdoughChoice,
  triggerKadekSourdoughChoice,
  type KadekSourdoughChoice
} from "../systems/story/Act2KadekSourdough";
import { KADEK_PRIORITY_DELIVERY_ID } from "../systems/story/Act1KadekPriority";
import { prepareKitchenCircleSessionBeat } from "../systems/story/Act2KitchenCircle";
import type { GameEvent, WorldState } from "../types";

function readyWorld(): WorldState {
  return buildDevProofBootState("act2_kadek_sourdough_ready");
}

function kitchenEvent(slotId = "saturday_evening_kitchen"): GameEvent {
  return gameEventDefinitions.find(
    (event) =>
      event.crewSession?.crewId === KITCHEN_CIRCLE_CREW_ID &&
      event.crewSession.sessionSlotId === slotId
  )!;
}

function deliverEvidence(world: WorldState, now = world.clock.day * 1440 + world.clock.minuteOfDay): void {
  expect(acceptDelivery(world, ACT2_KADEK_SOURDOUGH_DELIVERY_ID, now)).toMatchObject({ ok: true });
  expect(pickupDelivery(world, now + 1)).toMatchObject({ ok: true });
  expect(hasKadekSourdoughEvidence(world)).toBe(true);
  expect(completeDelivery(world, now + 2, 1)).toMatchObject({
    ok: true,
    kadekSourdoughScene: { fired: true, sceneId: ACT2_KADEK_SOURDOUGH_SCENE_ID }
  });
  expect(isKadekSourdoughChoicePending(world)).toBe(true);
}

describe("Act 2 Kadek wrong-address trigger", () => {
  it("gates on Act 2, Kadek's existing friendly tier, and Kitchen regular status", () => {
    const ready = readyWorld();
    expect(isKadekSourdoughEligible(ready)).toBe(true);

    const beforeAct2 = readyWorld();
    beforeAct2.life.actProgress.currentAct = 1;
    expect(isKadekSourdoughEligible(beforeAct2)).toBe(false);

    const stranger = readyWorld();
    const relationship = getRelationship(stranger, "npc", "kadek")!;
    relationship.affinity = 0;
    relationship.memories = [];
    expect(isKadekSourdoughEligible(stranger)).toBe(false);

    const notRegular = readyWorld();
    delete notRegular.questFlags[`crew:${KITCHEN_CIRCLE_CREW_ID}:regular`];
    expect(isKadekSourdoughEligible(notRegular)).toBe(false);
  });

  it("replaces the recurring priority row with one authored after-hours correction", () => {
    const world = readyWorld();
    world.clock.minuteOfDay = 19 * 60 + 59;
    let offers = getDeliveryOfferAvailability(world);
    expect(offers.find((offer) => offer.delivery.id === ACT2_KADEK_SOURDOUGH_DELIVERY_ID)).toMatchObject({
      available: false,
      reason: expect.stringContaining("20:00")
    });
    expect(offers.some((offer) => offer.delivery.id === KADEK_PRIORITY_DELIVERY_ID)).toBe(false);

    world.clock.minuteOfDay = 20 * 60;
    offers = getDeliveryOfferAvailability(world);
    expect(offers.find((offer) => offer.delivery.id === ACT2_KADEK_SOURDOUGH_DELIVERY_ID)).toMatchObject({ available: true });
  });

  it("puts the labeled box in hand, triggers once, and restores the ordinary priority row after resolution", () => {
    const world = readyWorld();
    const now = world.clock.day * 1440 + world.clock.minuteOfDay;
    expect(acceptDelivery(world, ACT2_KADEK_SOURDOUGH_DELIVERY_ID, now)).toMatchObject({ ok: true });
    const pickup = pickupDelivery(world, now + 1);
    expect(pickup.message).toContain("supplier D. ARSA");
    expect(pickup.kadekSourdoughBox).toMatchObject({ fired: true, dialogue: expect.stringContaining("It is not his name") });
    expect(hasKadekSourdoughEvidence(world)).toBe(true);
    const completed = completeDelivery(world, now + 2, 1);
    expect(completed.kadekSourdoughScene).toMatchObject({ fired: true });
    expect(world.life.hustle.completedDeliveryIds).toContain(ACT2_KADEK_SOURDOUGH_DELIVERY_ID);
    expect(triggerKadekSourdoughChoice(world)).toEqual({ fired: false });
    expect(getDeliveryOfferAvailability(world).some((offer) => offer.delivery.id === KADEK_PRIORITY_DELIVERY_ID)).toBe(false);

    expect(resolveKadekSourdoughChoice(world, "protect", now + 3).ok).toBe(true);
    const ids = getDeliveryOfferAvailability(world).map((offer) => offer.delivery.id);
    expect(ids).not.toContain(ACT2_KADEK_SOURDOUGH_DELIVERY_ID);
    expect(ids).toContain(KADEK_PRIORITY_DELIVERY_ID);
  });
});

describe("Whistleblower Sourdough choice residue", () => {
  it.each([
    ["protect", ACT2_KADEK_PROTECT_ROOTED_DELTA],
    ["expose", ACT2_KADEK_EXPOSE_ROOTED_DELTA]
  ] as const)("records the %s branch without changing Platform Efficiency or Kadek affinity", (choice, expectedDelta) => {
    const world = readyWorld();
    deliverEvidence(world);
    const rootedBefore = world.reputation.rootedAxis;
    const relationalBefore = world.reputation.relationalAxis;
    const affinityBefore = getRelationship(world, "npc", "kadek")!.affinity;

    expect(resolveKadekSourdoughChoice(world, choice, 40_000)).toMatchObject({
      ok: true,
      choice,
      rootedDelta: expectedDelta
    });
    expect(world.reputation.rootedAxis).toBe(rootedBefore + expectedDelta);
    expect(world.reputation.relationalAxis).toBe(relationalBefore);
    expect(getRelationship(world, "npc", "kadek")!.affinity).toBe(affinityBefore);
    expect(getKadekSourdoughChoice(world)).toBe(choice);
    expect(getKadekSourdoughEndingResidue(world)).toMatchObject({ choice, endingReference: expect.any(String) });
    expect(hasResolvedKadekSourdoughChoice(world)).toBe(true);
    expect(isKadekMoonlightingEndPending(world)).toBe(true);
    expect(resolveKadekSourdoughChoice(world, choice, 40_001).ok).toBe(false);
  });

  it("makes ESC/skip resolve to PROTECT", () => {
    const scene = getRelationshipChoiceScene(ACT2_KADEK_SOURDOUGH_SCENE_ID)!;
    expect(scene.options).toHaveLength(2);
    expect(getRelationshipChoiceSkipOption(scene)).toMatchObject({
      id: "protect_kadek",
      actionId: "protect_act2_kadek_sourdough"
    });
  });

  it.each(["protect", "expose"] as KadekSourdoughChoice[])(
    "ends the moonlighting in one branch-specific line at the next Kitchen session after %s",
    (choice) => {
      const world = readyWorld();
      deliverEvidence(world);
      expect(resolveKadekSourdoughChoice(world, choice, 40_000).ok).toBe(true);
      world.clock.day = 27;
      world.clock.minuteOfDay = 18 * 60 + 15;

      const first = prepareKitchenCircleSessionBeat(world, kitchenEvent());
      expect(first).toMatchObject({ speakerName: "Kadek", includesSqueeze: false });
      expect(first?.dialogue).toContain("finished");
      expect(first?.dialogue).toContain(choice === "protect" ? "under my own name" : "Together");
      expect(isKadekMoonlightingEndPending(world)).toBe(false);
      expect(didKadekEndMoonlightingOnDay(world, 27)).toBe(true);

      const second = prepareKitchenCircleSessionBeat(world, kitchenEvent());
      expect(second?.dialogue).not.toContain("The night work is finished");
      expect(second?.dialogue).not.toContain("The other kitchen is finished");
    }
  );
});
