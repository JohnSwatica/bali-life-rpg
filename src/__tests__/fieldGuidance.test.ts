import { describe, expect, it } from "vitest";
import { getFieldObjective, formatFieldObjectiveLine } from "../systems/guidance/FieldObjective";
import { getFieldIndicators } from "../systems/guidance/FieldIndicators";
import { getHustleNextStep } from "../systems/hustle/HustleGoals";
import { getAct2NextStep } from "../systems/life/Act2Goals";
import { bumpRelationshipAffinity } from "../systems/relationships/RelationshipMemory";
import { createInitialWorldState } from "../systems/WorldState";
import type { Act0Step } from "../types";

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
        expect.objectContaining({ type: "venue", venueId: "satu_satu_coffee" }),
        expect.objectContaining({ type: "venue", venueId: "milk_madu_berawa" })
      ]
    });
  });

  it("keeps joined-club event guidance field-first instead of phone-first", () => {
    const world = createInitialWorldState();
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 2;
    world.life.hustle.moveOutReady = true;
    world.life.joinedClubIds.push("berawa_run_crew");

    const objective = getFieldObjective(world);

    expect(objective).toMatchObject({
      source: "act2",
      title: "Attend Run Crew Sunrise Loop",
      detail: expect.stringContaining("event marker"),
      targets: [expect.objectContaining({ type: "venue", venueId: "berawa_beach" })]
    });
    expect(objective.detail.toLowerCase()).not.toMatch(/phone|calendar|quests|feed/);
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
      detail: expect.stringContaining("cheap kos"),
      targets: [expect.objectContaining({ type: "home" })]
    });
    expect(getFieldObjective(world).detail.toLowerCase()).not.toContain("phone");
  });

  it("points to recovery stations when meters are too low for healthy hustle", () => {
    const world = createInitialWorldState();
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.players[world.localPlayerId].hasBike = true;
    world.meters.energy = 20;

    expect(getHustleNextStep(world)).toMatchObject({
      title: "Recover before the next run",
      urgency: "blocked"
    });
    expect(getFieldObjective(world)).toMatchObject({
      source: "hustle",
      title: "Recover before the next run",
      targets: [
        expect.objectContaining({ type: "home" }),
        expect.objectContaining({ type: "venue", venueId: "ulekan_berawa" }),
        expect.objectContaining({ type: "venue", venueId: "milk_madu_berawa" })
      ]
    });
  });

  it("keeps payable rent higher priority than station recovery", () => {
    const world = createInitialWorldState();
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.players[world.localPlayerId].hasBike = true;
    world.players[world.localPlayerId].money = world.life.hustle.rentAmount;
    world.meters.energy = 20;
    world.life.hustle.rentDueDay = world.clock.day;

    expect(getFieldObjective(world)).toMatchObject({
      source: "hustle",
      title: "Pay rent",
      targets: [expect.objectContaining({ type: "home" })]
    });
  });

  it("targets the scooter counter when an upgrade is ready", () => {
    const world = createInitialWorldState();
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 1;
    world.players[world.localPlayerId].hasBike = true;
    world.players[world.localPlayerId].money = 300;
    world.life.hustle.completedDeliveryCount = 3;
    world.life.hustle.driverRating = 3.8;

    const objective = getFieldObjective(world);

    expect(objective).toMatchObject({
      source: "hustle",
      title: "Upgrade scooter",
      detail: expect.stringContaining("scooter counter"),
      targets: [expect.objectContaining({ type: "venue", venueId: "bali_family_rental_scooter" })]
    });
    expect(objective.detail.toLowerCase()).not.toContain("phone");
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

  it("keeps travel beats in the field and reserves only diegetic moments for the phone", () => {
    const fieldSteps: Act0Step[] = [
      "meet_ibu_sari",
      "dropoff_first_delivery",
      "buy_meal_and_coffee",
      "pay_kos_deposit",
      "sleep_first_night"
    ];

    for (const step of fieldSteps) {
      const world = createInitialWorldState();
      world.life.actProgress.act0Step = step;
      world.life.actProgress.firstDayComplete = false;
      const objective = getFieldObjective(world);
      const line = formatFieldObjectiveLine(objective).toLowerCase();

      expect(objective.source, step).toBe("act0");
      expect(objective.targets.length, step).toBeGreaterThan(0);
      expect(line, step).not.toMatch(/phone|feed|quests/);
    }

    for (const step of ["nusadrop_signup", "landlord_ultimatum", "villa_order_ping"] as const) {
      const world = createInitialWorldState();
      world.life.actProgress.act0Step = step;
      const objective = getFieldObjective(world);
      expect(objective.source, step).toBe("act0");
      expect(objective.targets, step).toEqual([]);
      expect(formatFieldObjectiveLine(objective).toLowerCase(), step).toMatch(/phone|alert|dropoff/);
    }
  });
});

describe("field-level indicators", () => {
  it("marks NPCs with ready relationship beats", () => {
    const world = createInitialWorldState();
    bumpRelationshipAffinity(world, "npc", "ari", 4, "ready beat", 1);

    expect(getFieldIndicators(world).npcs).toContainEqual(
      expect.objectContaining({
        type: "relationship",
        npcId: "ari",
        label: "Name in the sand"
      })
    );
  });

  it("marks venues with live opportunities", () => {
    const world = createInitialWorldState();
    world.opportunities.live.push({
      id: "test-live-opportunity",
      templateId: "milk_madu_lunch_rush_shift",
      status: "live",
      spawnedAt: 1,
      expiresAt: 100,
      locationVenueId: "milk_madu_berawa"
    });

    expect(getFieldIndicators(world).venues).toContainEqual(
      expect.objectContaining({
        type: "opportunity",
        venueId: "milk_madu_berawa",
        label: "Lunch rush barista @ Milk & Madu"
      })
    );
  });

  it("suppresses opportunity indicators whose venue has no authored building anchor", () => {
    const world = createInitialWorldState();
    world.opportunities.live.push({
      id: "orphan-opportunity",
      templateId: "milk_madu_lunch_rush_shift",
      status: "live",
      spawnedAt: 1,
      expiresAt: 100,
      locationVenueId: "missing_grass_marker"
    });

    expect(getFieldIndicators(world).venues).not.toContainEqual(
      expect.objectContaining({ id: "orphan-opportunity" })
    );
  });

  it("marks venues with active or soon events", () => {
    const world = createInitialWorldState();
    world.clock.day = 1;
    world.clock.minuteOfDay = 7 * 60;

    expect(getFieldIndicators(world).venues).toContainEqual(
      expect.objectContaining({
        type: "event",
        venueId: "berawa_beach",
        label: "Berawa Beach Run"
      })
    );
  });
});
