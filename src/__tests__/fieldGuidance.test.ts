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
      detail: "Walk to Ibu Sari near Canggu Station and press E / ACT.",
      targets: [{ type: "npc", npcId: "ibu_sari" }]
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
    expect(getFieldObjective(world).targets).toEqual([
      expect.objectContaining({
        type: "venue",
        venueId: "milk_madu_berawa"
      })
    ]);

    world.life.hustle.activeDelivery.stage = "picked_up";
    expect(getFieldObjective(world)).toMatchObject({
      title: "Drop off active delivery",
      targets: [expect.objectContaining({ type: "point", id: "upper_lane_villa" })]
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
      urgency: act2Next?.urgency,
      targets: [
        expect.objectContaining({ type: "venue", venueId: "berawa_beach" }),
        expect.objectContaining({ type: "venue", venueId: "satu_satu_coffee" })
      ]
    });
  });

  it("targets home when the existing hustle model says rent can be paid", () => {
    const world = createInitialWorldState();
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.players[world.localPlayerId].hasBike = true;
    world.players[world.localPlayerId].money = world.life.hustle.rentAmount;
    world.life.hustle.rentDueDay = world.clock.day;

    expect(getFieldObjective(world)).toMatchObject({
      source: "hustle",
      title: "Pay rent",
      targets: [expect.objectContaining({ type: "home" })]
    });
  });

  it("formats the readout as a single compact line", () => {
    expect(
      formatFieldObjectiveLine({
        source: "idle",
        title: "Explore Berawa",
        detail: "Talk to locals.",
        urgency: "normal",
        targets: []
      })
    ).toBe("Now: Explore Berawa - Talk to locals.");
  });
});
