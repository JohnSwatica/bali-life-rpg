import { describe, expect, it } from "vitest";
import { activityDefinitions } from "../data/activities";
import { createInitialWorldState } from "../systems/WorldState";
import { getActivityAvailability, getVenueActivityContext } from "../systems/life/ActivityEngine";
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

  it("uses served count and patience to calculate performance without changing its mechanics", () => {
    let rush = pickUpWarungDish(createWarungRushState(0));
    rush = serveWarungOrder(rush, "left").state;
    expect(calculateWarungRushPerformance(rush)).toBeGreaterThan(0.5);
  });

  it("has no generic activity definition or venue-menu launch surface", () => {
    const world = createInitialWorldState();
    world.life.actProgress.currentAct = 2;
    world.clock.minuteOfDay = 12 * 60;
    const context = getVenueActivityContext("canggu_station")!;
    expect(activityDefinitions.some((activity) => activity.id === "warung_lunch_rush")).toBe(false);
    expect(getActivityAvailability(world, context).some((entry) => entry.activity.id === "warung_lunch_rush")).toBe(false);
  });
});
