import { describe, expect, it } from "vitest";
import { getQuantity } from "../systems/Inventory";
import { applyActivity, getActivityAvailability, getVenueActivityContext } from "../systems/life/ActivityEngine";
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

  it("applies activity meter, money, item, time, and history effects", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];

    const work = applyActivity(world, context("milk_madu_berawa"), "remote_work_session");
    expect(work.ok).toBe(true);
    expect(work.moneyDelta).toBe(125);
    expect(player.money).toBe(195);
    expect(world.meters.energy).toBe(48);
    expect(world.meters.wellbeing).toBe(56);
    expect(world.meters.focus).toBe(52);
    expect(world.meters.social).toBe(31);
    expect(world.clock.minuteOfDay).toBe(11 * 60);
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

  it.skip("restores Energy and bumps Wellbeing/Focus on sleep after sleep logic is extracted from GameScene", () => {
    // Today the meter-restoration part of sleep lives in private GameScene.sleepToMorning().
    // This is intentionally skipped rather than refactoring runtime behavior in the additive test sprint.
  });
});
