import { describe, expect, it } from "vitest";
import { createInitialWorldState } from "../systems/WorldState";
import { applyActivity, getActivityAvailability, getVenueActivityContext } from "../systems/life/ActivityEngine";
import { calculateWarungRushPerformance, createWarungRushState, getWarungRushDifficulty, pickUpWarungDish, serveWarungOrder, updateWarungRush } from "../systems/minigames/WarungRush";

describe("Warung Rush", () => {
  it("assigns orders, decays patience, and expires customers without ending the round", () => {
    let rush = createWarungRushState(0);
    expect(rush.orders[0]).toMatchObject({ tableId: "left", dishId: "nasi_campur", status: "waiting" });
    rush = updateWarungRush(rush, rush.orders[0].patienceMs + 1);
    expect(rush.orders[0].status).toBe("expired");
    expect(rush.expiredCount).toBe(1);
  });

  it("only serves the right dish to the right customer", () => {
    const rush = createWarungRushState(0);
    const held = pickUpWarungDish(rush);
    expect(serveWarungOrder(held, "right").served).toBe(false);
    const clean = serveWarungOrder(held, "left");
    expect(clean.served).toBe(true);
    expect(clean.state.servedCount).toBe(1);
  });

  it("ramps gently from two to four simultaneous orders", () => {
    expect(getWarungRushDifficulty(0)).toBe(2);
    expect(getWarungRushDifficulty(2)).toBe(3);
    expect(getWarungRushDifficulty(99)).toBe(4);
  });

  it("uses served count and patience to scale the existing activity reward path", () => {
    const world = createInitialWorldState();
    world.life.actProgress.currentAct = 1;
    world.clock.minuteOfDay = 12 * 60;
    const context = getVenueActivityContext("canggu_station")!;
    let rush = pickUpWarungDish(createWarungRushState(0));
    rush = serveWarungOrder(rush, "left").state;
    const result = applyActivity(world, context, "warung_lunch_rush", { performanceScore: calculateWarungRushPerformance(rush) });
    expect(result.ok).toBe(true);
    expect(result.moneyDelta).toBeGreaterThan(0);
    expect(world.meters.social).toBeGreaterThan(40);
  });

  it("caps the authored lunch hook at two plays per day", () => {
    const world = createInitialWorldState();
    world.life.actProgress.currentAct = 1;
    world.clock.minuteOfDay = 12 * 60;
    const context = getVenueActivityContext("canggu_station")!;
    const score = 1;
    applyActivity(world, context, "warung_lunch_rush", { performanceScore: score });
    applyActivity(world, context, "warung_lunch_rush", { performanceScore: score });
    expect(getActivityAvailability(world, context).find((entry) => entry.activity.id === "warung_lunch_rush")?.reason).toBe("Lunch rush is done for today.");
  });
});
