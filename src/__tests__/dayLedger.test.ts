import { describe, expect, it } from "vitest";
import { buildDayLedgerSummary, captureDayLedgerBaseline } from "../systems/life/DayLedger";
import { migrateLifeLoopState } from "../systems/life/LifeLoopState";
import { createInitialWorldState } from "../systems/WorldState";

function prepareAct1World() {
  const world = createInitialWorldState();
  world.life.actProgress.act0Step = "complete";
  world.life.actProgress.firstDayComplete = true;
  world.life.actProgress.currentAct = 1;
  world.players[world.localPlayerId].hasBike = true;
  world.clock.day = 2;
  world.clock.minuteOfDay = 8 * 60;
  return world;
}

describe("day ledger", () => {
  it("returns no summary before a baseline exists", () => {
    const world = prepareAct1World();
    expect(world.life.dayLedger).toBeNull();
    expect(buildDayLedgerSummary(world)).toBeNull();
  });

  it("captures a baseline and reports the closed day's deltas", () => {
    const world = prepareAct1World();
    captureDayLedgerBaseline(world);
    const player = world.players[world.localPlayerId];

    world.life.hustle.completedDeliveryCount += 2;
    world.life.hustle.deliveryEarnings += 120;
    world.life.hustle.driverRating += 0.4;
    player.money += 90;
    player.bikeCondition -= 15;
    world.clock.day = 3;

    const summary = buildDayLedgerSummary(world);
    expect(summary).not.toBeNull();
    expect(summary?.closedDay).toBe(2);
    expect(summary?.runsCompleted).toBe(2);
    expect(summary?.moneyDelta).toBe(90);
    expect(summary?.bikeConditionDelta).toBe(-15);
    expect(summary?.rows.some((row) => row.title === "2 runs completed")).toBe(true);
    expect(summary?.rows.some((row) => row.title.toLowerCase().includes("rent"))).toBe(true);
    expect(summary?.rows.some((row) => row.title.startsWith("Scooter wear"))).toBe(true);
  });

  it("flags a short wallet against upcoming rent", () => {
    const world = prepareAct1World();
    captureDayLedgerBaseline(world);
    world.players[world.localPlayerId].money = 100;
    world.clock.day = 3;

    const summary = buildDayLedgerSummary(world);
    const rentRow = summary?.rows.find((row) => row.title.toLowerCase().includes("rent"));
    expect(rentRow?.body).toContain("short");
  });

  it("migrates saves without a ledger and drops malformed baselines", () => {
    expect(migrateLifeLoopState({}).dayLedger).toBeNull();
    expect(migrateLifeLoopState({ dayLedger: { money: 40 } }).dayLedger).toBeNull();
    const migrated = migrateLifeLoopState({ dayLedger: { day: 2, money: 40 } });
    expect(migrated.dayLedger?.day).toBe(2);
    expect(migrated.dayLedger?.money).toBe(40);
    expect(migrated.dayLedger?.bikeCondition).toBe(100);
  });
});
