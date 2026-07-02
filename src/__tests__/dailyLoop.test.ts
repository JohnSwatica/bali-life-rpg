import { describe, expect, it } from "vitest";
import { getQuantity } from "../systems/Inventory";
import {
  applyActivity,
  applyPendingMorningPenalties,
  getActivityAvailability,
  getStationRhythmState,
  getVenueActivityContext
} from "../systems/life/ActivityEngine";
import { getStationSocialBridgeOptions } from "../systems/life/StationSocialBridge";
import { sleepAtHomeUntilMorning } from "../systems/life/SleepCycle";
import { adjustPlayerMeters } from "../systems/meters/PlayerMeters";
import { canSleepNow, sleepUntilNextMorning } from "../systems/time/DailyClock";
import { createInitialWorldState } from "../systems/WorldState";
import type { WorldState } from "../types";

function context(venueId: string) {
  const result = getVenueActivityContext(venueId);
  expect(result).not.toBeNull();
  return result!;
}

function option(world: WorldState, venueId: string, activityId: string) {
  const result = getActivityAvailability(world, context(venueId)).find((candidate) => candidate.activity.id === activityId);
  expect(result).toBeDefined();
  return result!;
}

describe("daily life meters and activities", () => {
  it("starts a new save in morning light", () => {
    expect(createInitialWorldState().clock.minuteOfDay).toBe(8 * 60);
  });

  it("clamps meter changes to 0-100 and syncs legacy focus/social mirrors", () => {
    const world = createInitialWorldState();

    adjustPlayerMeters(world, { energy: 999, wellbeing: -999, focus: 14.4, social: -14.4 });

    expect(world.meters.energy).toBe(100);
    expect(world.meters.wellbeing).toBe(0);
    expect(world.meters.focus).toBe(56);
    expect(world.meters.social).toBe(22);
    expect(world.players[world.localPlayerId].focus).toBe(world.meters.focus);
    expect(world.players[world.localPlayerId].socialEnergy).toBe(world.meters.social);
  });

  it("filters activities by venue category, open hours, energy, money, and repeatability", () => {
    const world = createInitialWorldState();

    expect(option(world, "milk_madu_berawa", "remote_work_session").available).toBe(true);
    expect(getActivityAvailability(world, context("canggu_station")).some((candidate) => candidate.activity.id === "remote_work_session")).toBe(false);

    world.clock.minuteOfDay = 23 * 60;
    expect(option(world, "milk_madu_berawa", "remote_work_session")).toMatchObject({
      available: false,
      reason: "Venue is closed."
    });

    world.clock.minuteOfDay = 8 * 60;
    world.meters.energy = 10;
    expect(option(world, "milk_madu_berawa", "remote_work_session")).toMatchObject({
      available: false,
      reason: "Need Energy 30."
    });

    world.meters.energy = 78;
    world.players[world.localPlayerId].money = 20;
    expect(option(world, "milk_madu_berawa", "grab_coffee")).toMatchObject({
      available: false,
      reason: "Need Rp 30."
    });

    world.players[world.localPlayerId].money = 70;
    expect(applyActivity(world, context("berawa_beach"), "surf_beach_time").ok).toBe(true);
    expect(option(world, "berawa_beach", "surf_beach_time")).toMatchObject({
      available: false,
      reason: "Already done today."
    });
  });

  it("surfaces authored station choices before generic fallback activities", () => {
    const world = createInitialWorldState();
    const stations = [
      ["satu_satu_coffee", "cafe"],
      ["berawa_beach", "beach"],
      ["finns_beach_club", "beach_club"],
      ["ulekan_berawa", "warung"],
      ["tropical_nomad_coworking_space", "coworking"],
      ["cheap_kos", "home"]
    ] as const;

    for (const [venueId, stationId] of stations) {
      const availability = getActivityAvailability(world, context(venueId));
      const stationChoices = availability.filter((candidate) => candidate.activity.stationId === stationId);
      expect(stationChoices.length).toBeGreaterThanOrEqual(3);
      expect(availability[0].activity.stationId).toBe(stationId);
    }

    expect(getActivityAvailability(world, context("satu_satu_coffee")).some((candidate) => candidate.activity.id === "remote_work_session")).toBe(
      true
    );
    expect(getActivityAvailability(world, context("cheap_kos")).every((candidate) => candidate.activity.stationId === "home")).toBe(true);
  });

  it("bridges Act 2 station menus toward relevant crews without auto-joining", () => {
    const world = createInitialWorldState();
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.currentAct = 2;

    expect(getStationSocialBridgeOptions(world, context("tropical_nomad_coworking_space"))).toEqual([
      expect.objectContaining({
        group: expect.objectContaining({ id: "focus_table_collective" }),
        status: "go_to_home",
        homeVenueId: "satu_satu_coffee"
      })
    ]);
    expect(world.life.joinedClubIds).toEqual([]);

    expect(getStationSocialBridgeOptions(world, context("satu_satu_coffee"))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          group: expect.objectContaining({ id: "focus_table_collective" }),
          status: "join_here"
        })
      ])
    );

    world.life.joinedClubIds.push("focus_table_collective");
    expect(getStationSocialBridgeOptions(world, context("satu_satu_coffee"))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          group: expect.objectContaining({ id: "focus_table_collective" }),
          status: "joined"
        })
      ])
    );

    world.life.actProgress.currentAct = 1;
    world.life.hustle.moveOutReady = false;
    expect(getStationSocialBridgeOptions(world, context("tropical_nomad_coworking_space"))).toEqual([]);
  });

  it("applies station time-of-day modifiers and queued next-morning penalties", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    world.clock.minuteOfDay = 10 * 60;

    const focus = applyActivity(world, context("satu_satu_coffee"), "cafe_deep_work");

    expect(focus.ok).toBe(true);
    expect(focus.moneyDelta).toBe(Math.round(115 * 1.08));
    expect(world.meters.focus).toBe(42 + Math.round(18 * 1.18));

    player.money = 500;
    world.meters.energy = 80;
    world.clock.minuteOfDay = 21 * 60;
    const bigNight = applyActivity(world, context("finns_beach_club"), "beach_club_big_night");

    expect(bigNight.ok).toBe(true);
    expect(world.life.pendingMorningPenalties).toHaveLength(1);
    world.meters.energy = 100;
    const summary = applyPendingMorningPenalties(world);
    expect(summary).toContain("energy -16");
    expect(world.life.pendingMorningPenalties).toHaveLength(0);
    expect(world.meters.energy).toBe(84);
  });

  it("reports active station rhythm windows from station data", () => {
    const world = createInitialWorldState();
    world.clock.minuteOfDay = 8 * 60;

    const cafeRhythm = getStationRhythmState(world, context("satu_satu_coffee"));
    expect(cafeRhythm).toMatchObject({
      stationTitle: "Cafe focus table",
      bestTimeOfDay: "Morning and early afternoon are strongest for focus."
    });
    expect(cafeRhythm?.activeModifierLabels).toContain("Morning focus window");

    world.clock.minuteOfDay = 15 * 60;
    expect(getStationRhythmState(world, context("satu_satu_coffee"))?.activeModifierLabels).not.toContain("Morning focus window");
  });

  it("applies activity meter, money, item, time, and history effects", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    const startMinute = world.clock.minuteOfDay;

    const work = applyActivity(world, context("milk_madu_berawa"), "remote_work_session");
    expect(work.ok).toBe(true);
    expect(work.moneyDelta).toBe(125);
    expect(player.money).toBe(195);
    expect(world.meters.energy).toBe(48);
    expect(world.meters.wellbeing).toBe(56);
    expect(world.meters.focus).toBe(52);
    expect(world.meters.social).toBe(31);
    expect(world.clock.minuteOfDay).toBe(startMinute + 180);
    expect(world.life.activityHistory["milk_madu_berawa:remote_work_session"]).toMatchObject({
      count: 1,
      totalCount: 1,
      earnedMoney: 125
    });

    const shop = applyActivity(world, context("canggu_station"), "shop_for_day");
    expect(shop.ok).toBe(true);
    expect(player.money).toBe(160);
    expect(getQuantity(player, "coconut")).toBe(2);
    expect(world.life.activityHistory["canggu_station:shop_for_day"]).toMatchObject({
      count: 1,
      totalCount: 1,
      earnedMoney: 0
    });
  });

  it("keeps the intended work scarcity and daytime route money tension", () => {
    const workWorld = createInitialWorldState();
    expect(applyActivity(workWorld, context("milk_madu_berawa"), "remote_work_session").ok).toBe(true);
    expect(applyActivity(workWorld, context("milk_madu_berawa"), "remote_work_session").ok).toBe(true);
    const thirdWork = applyActivity(workWorld, context("milk_madu_berawa"), "remote_work_session");
    expect(thirdWork).toMatchObject({ ok: false, message: "Need Energy 30." });

    const routeWorld = createInitialWorldState();
    expect(applyActivity(routeWorld, context("milk_madu_berawa"), "remote_work_session").ok).toBe(true);
    expect(applyActivity(routeWorld, context("milk_madu_berawa"), "grab_coffee").ok).toBe(true);
    expect(applyActivity(routeWorld, context("milk_madu_berawa"), "eat_properly").ok).toBe(true);
    expect(applyActivity(routeWorld, context("berawa_beach"), "surf_beach_time").ok).toBe(true);
    routeWorld.clock.minuteOfDay = 18 * 60;
    const party = applyActivity(routeWorld, context("finns_beach_club"), "night_out");
    expect(routeWorld.players[routeWorld.localPlayerId].money).toBe(100);
    expect(party).toMatchObject({ ok: false, message: "Need Rp 180." });
  });

  it("advances the day clock to the next morning when sleeping is allowed", () => {
    const world = createInitialWorldState();
    world.clock.minuteOfDay = 22 * 60;
    expect(canSleepNow(world.clock, world.meters)).toBe(true);

    sleepUntilNextMorning(world);

    expect(world.clock.day).toBe(2);
    expect(world.clock.minuteOfDay).toBe(8 * 60);
  });

  it("restores Energy and bumps Wellbeing/Focus through the sleep cycle seam", () => {
    const world = createInitialWorldState();
    world.clock.minuteOfDay = 22 * 60;
    world.meters = { energy: 18, wellbeing: 50, focus: 40, social: 30 };

    const result = sleepAtHomeUntilMorning(world);

    expect(world.clock).toMatchObject({ day: 2, minuteOfDay: 8 * 60 });
    expect(result.meters).toMatchObject({ energy: 100, wellbeing: 58, focus: 46, social: 26 });
    expect(world.players[world.localPlayerId]).toMatchObject({ focus: 46, socialEnergy: 26 });
  });
});
