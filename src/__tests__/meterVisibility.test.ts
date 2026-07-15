import { describe, expect, it } from "vitest";
import {
  areAdvancedMetersVisible,
  formatVisibleMeterDeltas,
  formatVisibleMeterValues,
  getVisibleMeters
} from "../systems/guidance/MeterVisibility";
import { applyActivity, getVenueActivityContext } from "../systems/life/ActivityEngine";
import { getStationRecoveryNudge } from "../systems/life/StationRecovery";
import { createInitialWorldState } from "../systems/WorldState";

describe("meter visibility staging", () => {
  it("surfaces Energy only through Act 0 and Act 1", () => {
    const world = createInitialWorldState();

    expect(getVisibleMeters(world)).toEqual(["energy"]);
    expect(formatVisibleMeterValues(world)).toBe(`Energy ${world.meters.energy}`);

    world.life.actProgress.currentAct = 1;
    world.life.actProgress.firstDayComplete = true;

    expect(getVisibleMeters(world)).toEqual(["energy"]);
  });

  it("reveals all meters only from the authored Act 2 transition", () => {
    const world = createInitialWorldState();

    world.life.actProgress.currentAct = 2;
    expect(areAdvancedMetersVisible(world)).toBe(true);
    expect(getVisibleMeters(world)).toEqual(["energy", "wellbeing", "focus", "social"]);

    world.life.actProgress.currentAct = 1;
    world.life.hustle.moveOutReady = true;

    expect(areAdvancedMetersVisible(world)).toBe(false);
    expect(getVisibleMeters(world)).toEqual(["energy"]);
  });

  it("filters visible meter delta copy before Act 2", () => {
    const world = createInitialWorldState();

    expect(formatVisibleMeterDeltas(world, { energy: -8, wellbeing: 4, focus: 3, social: 2 })).toBe("energy -8");

    world.life.actProgress.currentAct = 2;

    expect(formatVisibleMeterDeltas(world, { energy: -8, wellbeing: 4, focus: 3, social: 2 })).toBe(
      "energy -8, wellbeing +4, focus +3, social +2"
    );
  });

  it("keeps hidden meters simulating while filtering Act 0 activity result copy", () => {
    const world = createInitialWorldState();
    const startingFocus = world.meters.focus;
    const context = getVenueActivityContext("milk_madu_berawa");
    expect(context).not.toBeNull();

    const result = applyActivity(world, context!, "remote_work_session");

    expect(result.ok).toBe(true);
    expect(result.message).toContain("energy -30");
    expect(result.message.toLowerCase()).not.toMatch(/wellbeing|focus|social/);
    expect(world.meters.focus).toBeGreaterThan(startingFocus);
  });

  it("routes hidden Wellbeing and Focus recovery nudges through rest language before Act 2", () => {
    const world = createInitialWorldState();
    world.life.actProgress.firstDayComplete = true;
    world.life.actProgress.act0Step = "complete";
    world.life.actProgress.currentAct = 1;
    world.meters.energy = 80;
    world.meters.wellbeing = 20;

    expect(getStationRecoveryNudge(world)).toMatchObject({
      id: "wellbeing",
      title: "Recover before the next run",
      detail: "You're running on fumes -- take a proper break before stacking more hustle."
    });

    world.life.actProgress.currentAct = 2;

    expect(getStationRecoveryNudge(world)).toMatchObject({
      id: "wellbeing",
      title: "Reset your head",
      detail: expect.stringContaining("Wellbeing is shaky")
    });
  });
});
