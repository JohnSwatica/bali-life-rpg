import { describe, expect, it } from "vitest";
import { getDeliveryDefinition } from "../data/deliveries";
import { createInitialWorldState } from "../systems/WorldState";
import {
  ACT1_BASE_PAY_MULTIPLIER,
  ACT1_LEO_ENCOUNTER_FLAG,
  ACT1_RATE_CUT_FLAG,
  getDeliveryBasePayoutAfterAct1Cut,
  isAct1LeoEncounterPending,
  triggerAct1RateCut
} from "../systems/story/Act1IncitingHook";
import { getAct1IncitingHookWorldScenes } from "../systems/world/WorldScenes";
import { getRelationshipChoiceScene } from "../systems/relationships/RelationshipChoiceScenes";
import { getEffectiveDeliveryTerms } from "../systems/hustle/DeliverySystem";

describe("Act 1 inciting hook", () => {
  it("fires the rate cut exactly once on first Act 1 entry", () => {
    const world = createInitialWorldState();
    expect(triggerAct1RateCut(world, 500)).toEqual({ fired: false });

    world.life.actProgress.currentAct = 1;
    const first = triggerAct1RateCut(world, 600);
    expect(first).toMatchObject({
      fired: true,
      message: { from: "NusaDrop Update", body: expect.stringContaining("15%") }
    });
    expect(world.collectedPickups[ACT1_RATE_CUT_FLAG]).toBe(600);
    expect(triggerAct1RateCut(world, 601)).toEqual({ fired: false });
  });

  it("cuts board-delivery base pay by 15% without touching Act 0 delivery pay", () => {
    const world = createInitialWorldState();
    world.life.actProgress.currentAct = 1;
    triggerAct1RateCut(world, 600);
    const boardRun = getDeliveryDefinition("milk_madu_brunch_bag")!;
    const act0Run = getDeliveryDefinition("act0_ibu_milk_madu_catering")!;

    expect(getDeliveryBasePayoutAfterAct1Cut(world, boardRun)).toBe(
      Math.round(boardRun.payout * ACT1_BASE_PAY_MULTIPLIER)
    );
    expect(getEffectiveDeliveryTerms(boardRun, undefined, world).payout).toBe(
      Math.round(boardRun.payout * ACT1_BASE_PAY_MULTIPLIER)
    );
    expect(getDeliveryBasePayoutAfterAct1Cut(world, act0Run)).toBe(act0Run.payout);
  });

  it("stages Leo visibly at the pickup hub until his one-time full dialogue scene resolves", () => {
    const world = createInitialWorldState();
    world.life.actProgress.currentAct = 1;
    triggerAct1RateCut(world, 600);

    expect(isAct1LeoEncounterPending(world)).toBe(true);
    expect(getAct1IncitingHookWorldScenes(world)).toMatchObject([
      { venueId: "bali_family_rental_scooter", cue: "LEO", actors: [{ npcId: "rio" }] }
    ]);
    const scene = getRelationshipChoiceScene(ACT1_LEO_ENCOUNTER_FLAG);
    expect(scene?.npcOpeningLine).toContain("Fifteen percent");
    expect(scene?.npcOpeningLine).toContain("scooter");
    expect(scene?.options.every((option) => option.actionId === "complete_act1_leo_encounter")).toBe(true);

    world.collectedPickups[ACT1_LEO_ENCOUNTER_FLAG] = 1;
    expect(isAct1LeoEncounterPending(world)).toBe(false);
    expect(getAct1IncitingHookWorldScenes(world)).toEqual([]);
  });
});
