import { describe, expect, it } from "vitest";
import { createInitialWorldState } from "../systems/WorldState";
import { completeAct0Step } from "../systems/life/ActProgression";
import {
  FIRST_RUN_IBU_REDIRECT_TOAST,
  isAct0FirstRunGateActive,
  shouldStartAct0FirstRunGate,
  shouldRedirectAct0FirstRunInteraction
} from "../systems/life/FirstRunGate";

describe("first-run Act 0 gate", () => {
  const venueTarget = {
    type: "venue" as const,
    id: "satu_satu_coffee",
    label: "Check out Satu-Satu Coffee",
    distance: 24
  };

  it("blocks non-Ibu interactions at meet_ibu_sari and allows Ibu Sari", () => {
    const world = createInitialWorldState();
    const firstRunSessionActive = shouldStartAct0FirstRunGate(world);
    world.questFlags.firstRunHintSeen = true;

    expect(firstRunSessionActive).toBe(true);
    expect(isAct0FirstRunGateActive(world, firstRunSessionActive)).toBe(true);
    expect(shouldRedirectAct0FirstRunInteraction(world, firstRunSessionActive, venueTarget)).toBe(true);
    expect(
      shouldRedirectAct0FirstRunInteraction(
        world,
        firstRunSessionActive,
        {
          type: "pickup",
          id: "fallen_coconut",
          label: "Pick up coconut",
          distance: 10
        }
      )
    ).toBe(true);
    expect(shouldRedirectAct0FirstRunInteraction(world, firstRunSessionActive, undefined, true)).toBe(true);
    expect(
      shouldRedirectAct0FirstRunInteraction(
        world,
        firstRunSessionActive,
        {
          type: "npc",
          id: "ibu_sari",
          label: "Talk to Ibu Sari",
          distance: 8
        }
      )
    ).toBe(false);
    expect(FIRST_RUN_IBU_REDIRECT_TOAST).toContain("Ibu Sari");
  });

  it("does not affect existing saves or later Act 0 steps", () => {
    const world = createInitialWorldState();

    expect(isAct0FirstRunGateActive(world, false)).toBe(false);
    expect(shouldRedirectAct0FirstRunInteraction(world, false, venueTarget)).toBe(false);

    world.questFlags.firstRunHintSeen = true;

    expect(shouldStartAct0FirstRunGate(world)).toBe(false);
    expect(isAct0FirstRunGateActive(world, false)).toBe(false);
    expect(shouldRedirectAct0FirstRunInteraction(world, false, venueTarget)).toBe(false);

    completeAct0Step(world, "meet_ibu_sari");

    expect(isAct0FirstRunGateActive(world, true)).toBe(false);
    expect(shouldRedirectAct0FirstRunInteraction(world, true, venueTarget)).toBe(false);
  });
});
