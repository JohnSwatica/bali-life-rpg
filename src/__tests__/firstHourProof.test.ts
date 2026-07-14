import { describe, expect, it } from "vitest";
import { getDeliveryDefinition } from "../data/deliveries";
import { completeAct0Step } from "../systems/life/ActProgression";
import { sleepAtHomeUntilMorning } from "../systems/life/SleepCycle";
import { getAct2GoalStates, getAct2NextStep, getAct2PayoffOpportunityState } from "../systems/life/Act2Goals";
import { getFieldObjective } from "../systems/guidance/FieldObjective";
import { joinSocialGroup } from "../systems/groups/GroupRegistry";
import { getHustleNextStep } from "../systems/hustle/HustleGoals";
import { payHustleRent, upgradeToDailyScooter } from "../systems/hustle/HustleEconomy";
import {
  acceptDelivery,
  completeDelivery,
  getDeliveryOfferAvailability,
  pickupDelivery
} from "../systems/hustle/DeliverySystem";
import { getAbsoluteMinute, getOpportunityTemplate, resolveOpportunity, spawnOpportunity } from "../systems/opportunities/OpportunityEngine";
import { bumpRelationshipAffinity } from "../systems/relationships/RelationshipMemory";
import { completeNextRelationshipArcBeat } from "../systems/relationships/RelationshipArcs";
import { createInitialWorldState } from "../systems/WorldState";
import {
  ACT0_CAFE_SCENE_COST,
  ACT0_STORM_DELIVERY_ID,
  ACT0_VILLA_DELIVERY_ID,
  resolveAct0Deposit,
  revealAct0Deposit
} from "../systems/story/Act0BackHalf";
import { completeMadeRoomOfferScene } from "../systems/story/Act1MadeRoomOffer";
import {
  acceptMadeFinale,
  completeAct1MoveOut,
  completeIbuGuaranteeScene,
  markMoveOutMontageStarted,
  signWeeklyScooterContract,
  startAct2AfterFinale
} from "../systems/story/Act1Finale";
import type { WorldState } from "../types";

describe("first-hour proof path", () => {
  it("carries a new save from arrival to one Act 2 social payoff without hidden menu dependency", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    player.hasBike = true;
    player.onBike = true;

    completeAct0DeliveryAndMeal(world);
    expect(world.life.actProgress).toMatchObject({ currentAct: 1, firstDayComplete: true, act0Step: "complete" });
    expect(player.money).toBeGreaterThanOrEqual(0);
    expect(getFieldObjective(world)).toMatchObject({ source: "hustle", title: "Build delivery rhythm" });

    completeBoardDelivery(world, "milk_madu_brunch_bag", 2 * 1440 + 9 * 60);
    expect(getHustleNextStep(world)).toMatchObject({ title: "Build delivery rhythm" });

    completeBoardDelivery(world, "satu_satu_invoice_pouch", 2 * 1440 + 10 * 60);
    expect(getHustleNextStep(world)).toMatchObject({ title: "Upgrade scooter" });
    expect(upgradeToDailyScooter(world, 2 * 1440 + 11 * 60)).toMatchObject({ ok: true });

    completeBoardDelivery(world, "nude_cold_bag_run", 2 * 1440 + 12 * 60);
    expect(completeMadeRoomOfferScene(world, 2 * 1440 + 12 * 60 + 1)).toMatchObject({ fired: true });
    completeBoardDelivery(world, "beach_wristband_pouch", 2 * 1440 + 13 * 60);
    expect(world.life.hustle).toMatchObject({
      completedDeliveryCount: 5,
      moveOutReady: false
    });
    expect(getHustleNextStep(world)).toMatchObject({ title: "Cover first rent" });
    expect(getFieldObjective(world)).toMatchObject({ source: "hustle", targets: [{ type: "home" }] });

    const rent = payHustleRent(world, 2 * 1440 + 14 * 60);
    expect(rent).toMatchObject({ ok: true });
    expect(rent.message).toContain("move-out numbers are ready");
    expect(world.life.hustle.moveOutReady).toBe(true);
    expect(world.life.actProgress.currentAct).toBe(1);
    expect(completeIbuGuaranteeScene(world, 2 * 1440 + 14 * 60 + 1)).toMatchObject({ ok: true });
    expect(acceptMadeFinale(world, 2 * 1440 + 14 * 60 + 2)).toMatchObject({ ok: true });
    expect(markMoveOutMontageStarted(world, 2 * 1440 + 14 * 60 + 3)).toBe(true);
    expect(completeAct1MoveOut(world, 2 * 1440 + 14 * 60 + 4)).toBe(true);
    expect(signWeeklyScooterContract(world, 2 * 1440 + 14 * 60 + 5)).toMatchObject({ ok: true });
    expect(startAct2AfterFinale(world, 2 * 1440 + 14 * 60 + 6)).toBe(true);
    expect(world.life.actProgress.currentAct).toBe(2);
    expect(getFieldObjective(world)).toMatchObject({ source: "act2", title: "Join a first crew" });

    expect(joinSocialGroup(world, "berawa_run_crew", 2 * 1440 + 15 * 60)).toMatchObject({ ok: true });
    world.runtimeEvents.attendedEventIds.push("berawa_run_crew_loop");
    bumpRelationshipAffinity(world, "npc", "ari", 4, "first-hour proof: showed up for the crew", 2 * 1440 + 16 * 60);
    expect(completeNextRelationshipArcBeat(world, "ari", 2 * 1440 + 16 * 60)?.beat.id).toBe("ari_remembers_your_name");

    world.clock.day = 2;
    world.clock.minuteOfDay = 9 * 60;
    const payoff = getAct2PayoffOpportunityState(world);
    expect(payoff).toMatchObject({ templateId: "run_crew_breakfast_shift", status: "eligible" });
    expect(getAct2NextStep(world)).toMatchObject({ title: "Find Run crew breakfast shift" });
    expect(getFieldObjective(world)).toMatchObject({
      source: "act2",
      targets: [{ type: "venue", venueId: "milk_madu_berawa" }]
    });

    const template = getOpportunityTemplate(payoff!.templateId);
    expect(template).toBeDefined();
    const live = spawnOpportunity(world.opportunities, template!, getAbsoluteMinute(world.clock));
    expect(resolveOpportunity(world.opportunities, world, live.id, getAbsoluteMinute(world.clock), 1)).toMatchObject({ ok: true });

    const act2Goals = Object.fromEntries(getAct2GoalStates(world).map((goal) => [goal.id, goal.complete]));
    expect(act2Goals).toEqual({
      join_first_crew: true,
      attend_club_rhythm: true,
      deepen_a_bond: true,
      open_better_door: true
    });
    expect(getAct2NextStep(world)).toMatchObject({ title: "Act 2 foundation complete", urgency: "complete" });
  });
});

function completeAct0DeliveryAndMeal(world: WorldState): void {
  const now = 8 * 60;
  expect(completeAct0Step(world, "meet_ibu_sari")).toBe(true);
  expect(acceptDelivery(world, "act0_ibu_milk_madu_catering", now)).toMatchObject({ ok: true });
  expect(pickupDelivery(world, now + 10)).toMatchObject({ ok: true });
  expect(completeDelivery(world, now + 14, 1)).toMatchObject({ ok: true });
  expect(completeAct0Step(world, "pickup_first_delivery")).toBe(true);
  expect(completeAct0Step(world, "dropoff_first_delivery")).toBe(true);
  world.players[world.localPlayerId].money -= ACT0_CAFE_SCENE_COST;
  expect(completeAct0Step(world, "buy_meal_and_coffee")).toBe(true);
  expect(acceptDelivery(world, ACT0_STORM_DELIVERY_ID, now + 40)).toMatchObject({ ok: true });
  expect(pickupDelivery(world, now + 40)).toMatchObject({ ok: true });
  expect(completeAct0Step(world, "nusadrop_signup")).toBe(true);
  expect(completeDelivery(world, now + 62, 1)).toMatchObject({ ok: true });
  expect(completeAct0Step(world, "dropoff_storm_delivery")).toBe(true);
  revealAct0Deposit(world);
  expect(completeAct0Step(world, "landlord_ultimatum")).toBe(true);
  expect(acceptDelivery(world, ACT0_VILLA_DELIVERY_ID, now + 64)).toMatchObject({ ok: true });
  expect(completeAct0Step(world, "villa_order_ping")).toBe(true);
  expect(pickupDelivery(world, now + 72)).toMatchObject({ ok: true });
  expect(completeAct0Step(world, "pickup_villa_delivery")).toBe(true);
  expect(completeDelivery(world, now + 95, 1)).toMatchObject({ ok: true });
  expect(completeAct0Step(world, "dropoff_villa_delivery")).toBe(true);
  resolveAct0Deposit(world);
  expect(completeAct0Step(world, "pay_kos_deposit")).toBe(true);
  sleepAtHomeUntilMorning(world);
  expect(completeAct0Step(world, "sleep_first_night")).toBe(true);
}

function completeBoardDelivery(world: WorldState, deliveryId: string, now: number): void {
  const delivery = getDeliveryDefinition(deliveryId);
  expect(delivery).toBeDefined();
  expect(getDeliveryOfferAvailability(world).find((offer) => offer.delivery.id === deliveryId)).toMatchObject({ available: true });
  expect(acceptDelivery(world, deliveryId, now)).toMatchObject({ ok: true });
  expect(pickupDelivery(world, now + 8)).toMatchObject({ ok: true });
  expect(completeDelivery(world, now + 32, 1)).toMatchObject({ ok: true });
}
