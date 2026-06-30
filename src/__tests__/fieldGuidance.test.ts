import { describe, expect, it } from "vitest";
import { getFieldObjective, formatFieldObjectiveLine } from "../systems/guidance/FieldObjective";
import { getHustleNextStep } from "../systems/hustle/HustleGoals";
import { getAct2NextStep } from "../systems/life/Act2Goals";
import { createInitialWorldState } from "../systems/WorldState";

describe("field objective readout", () => {
  it("surfaces Act 0's current step as the always-visible objective", () => {
    const world = createInitialWorldState();

    expect(getFieldObjective(world)).toMatchObject({
      source: "act0",
      title: "Find Ibu Sari",
      detail: "Walk to Ibu Sari near Canggu Station and press E / ACT."
    });
  });

  it("delegates Act 1 guidance to the existing hustle next-step model", () => {
    const world = createInitialWorldState();
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.players[world.localPlayerId].hasBike = true;

    const hustleNext = getHustleNextStep(world);

    expect(getFieldObjective(world)).toMatchObject({
      source: "hustle",
      title: hustleNext.title,
      detail: hustleNext.detail,
      urgency: hustleNext.urgency
    });
  });

  it("updates live when the hustle state changes to an active delivery", () => {
    const world = createInitialWorldState();
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.players[world.localPlayerId].hasBike = true;
    world.life.hustle.activeDelivery = {
      deliveryId: "milk_madu_brunch_bag",
      stage: "accepted",
      acceptedAt: 9 * 60,
      dueAt: 10 * 60
    };

    expect(getFieldObjective(world)).toMatchObject({
      source: "hustle",
      title: "Pick up active delivery"
    });
  });

  it("delegates Act 2 guidance to the existing Act 2 next-step model", () => {
    const world = createInitialWorldState();
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 2;
    world.life.hustle.moveOutReady = true;

    const act2Next = getAct2NextStep(world);

    expect(act2Next).not.toBeNull();
    expect(getFieldObjective(world)).toMatchObject({
      source: "act2",
      title: act2Next?.title,
      detail: act2Next?.detail,
      urgency: act2Next?.urgency
    });
  });

  it("formats the readout as a single compact line", () => {
    expect(
      formatFieldObjectiveLine({
        source: "idle",
        title: "Explore Berawa",
        detail: "Talk to locals.",
        urgency: "normal"
      })
    ).toBe("Now: Explore Berawa - Talk to locals.");
  });
});
