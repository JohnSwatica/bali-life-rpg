import { describe, expect, it, vi } from "vitest";

vi.mock("phaser", () => ({
  default: {
    Math: {
      Distance: {
        Between: (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x1 - x2, y1 - y2)
      }
    }
  }
}));

import { npcDefinitions } from "../data/npcs";
import { InteractionController } from "../systems/interaction/InteractionController";
import { getNpcIdleCue, getNpcIdleTag, getNpcIdleVisual } from "../systems/npcs/NpcIdleBehavior";
import {
  advanceNpcRouteMotion,
  getActiveNpcRoute,
  getNpcRouteActivityLabel
} from "../systems/npcs/NpcRoutineRoutes";
import type { NpcDefinition } from "../types";

const namedNpcIds = ["ibu_sari", "kadek", "made", "ari"] as const;

describe("NPC daily routine routes", () => {
  it("authors multi-waypoint daily routes for each named NPC", () => {
    for (const npcId of namedNpcIds) {
      const npc = npcDefinitions[npcId];

      expect(npc.routineRoutes?.length, npcId).toBeGreaterThanOrEqual(4);
      expect(npc.routineRoutes?.every((route) => route.waypoints.length >= 2), npcId).toBe(true);
    }
  });

  it("selects the active route from the day clock and exposes route activity labels", () => {
    const sari = npcDefinitions.ibu_sari;
    const prepRoute = getActiveNpcRoute(sari, 6 * 60);
    const lunchRoute = getActiveNpcRoute(sari, 12 * 60);

    expect(prepRoute.id).toBe("prep-route");
    expect(lunchRoute.id).toBe("lunch-route");
    expect(getNpcRouteActivityLabel(sari, prepRoute.id)).toBe("tidying the Canggu Station front shelf");
  });

  it("walks between waypoints and pauses when a waypoint is reached", () => {
    const route = getActiveNpcRoute(npcDefinitions.kadek, 13 * 60);
    const firstWaypoint = route.waypoints[0];
    const moved = advanceNpcRouteMotion(
      route,
      {
        routeId: route.id,
        waypointIndex: 0,
        pauseMsRemaining: 0,
        x: firstWaypoint.x - 20,
        y: firstWaypoint.y
      },
      1000,
      42
    );

    expect(moved.moving).toBe(true);
    expect(moved.x).toBeGreaterThan(firstWaypoint.x - 20);
    expect(moved.waypointIndex).toBe(0);

    const paused = advanceNpcRouteMotion(
      route,
      {
        routeId: route.id,
        waypointIndex: 0,
        pauseMsRemaining: 0,
        x: firstWaypoint.x,
        y: firstWaypoint.y
      },
      16,
      42
    );

    expect(paused.moving).toBe(false);
    expect(paused.waypointIndex).toBe(1);
    expect(paused.pauseMsRemaining).toBeGreaterThan(0);
  });

  it("falls back to legacy routine stops for NPCs without authored route data", () => {
    const legacyNpc: NpcDefinition = {
      ...npcDefinitions.ari,
      routineRoutes: undefined
    };

    const route = getActiveNpcRoute(legacyNpc, 10 * 60);

    expect(route.id).toBe("boards");
    expect(route.waypoints).toEqual([
      expect.objectContaining({
        id: "boards",
        x: legacyNpc.routine[0].x,
        y: legacyNpc.routine[0].y
      })
    ]);
  });

  it("resolves NPC interaction against the live sprite position", () => {
    const livePosition = { x: 1280, y: 760 };
    const controller = new InteractionController({
      getPlayerPosition: () => ({ ...livePosition }),
      getNpcSprite: (npcId) =>
        npcId === "ibu_sari"
          ? ({
              x: livePosition.x,
              y: livePosition.y
            } as Phaser.Physics.Arcade.Sprite)
          : undefined,
      isPickupAvailable: () => false,
      getWantedOffenders: () => [],
      getOffenderReward: () => 0
    });

    expect(controller.getNearestInteraction()).toMatchObject({
      type: "npc",
      id: "ibu_sari",
      label: "Talk to Ibu Sari"
    });
  });
});

describe("NPC idle behavior", () => {
  it("assigns role-readable idle tags to named NPCs", () => {
    expect(getNpcIdleTag(npcDefinitions.ibu_sari)).toBe("tidy_counter");
    expect(getNpcIdleCue(npcDefinitions.ibu_sari)).toBe("tidies");
    expect(getNpcIdleTag(npcDefinitions.kadek)).toBe("knead_oven");
    expect(getNpcIdleTag(npcDefinitions.ari)).toBe("laptop_sip");
    expect(getNpcIdleTag(npcDefinitions.made)).toBe("tinker_board");
  });

  it("falls back to a generic idle when no authored tag exists", () => {
    expect(getNpcIdleTag({})).toBe("generic_idle");
    expect(getNpcIdleCue({})).toBe("looks around");
  });

  it("produces a changing cheap visual cue while paused at waypoints", () => {
    const start = getNpcIdleVisual(npcDefinitions.made, 0);
    const later = getNpcIdleVisual(npcDefinitions.made, 360);

    expect(start.tag).toBe("tinker_board");
    expect(later.cue).toBe("tinkers");
    expect(later.angleDegrees).not.toBe(start.angleDegrees);
    expect(later.scaleY).toBeGreaterThanOrEqual(1);
  });
});
