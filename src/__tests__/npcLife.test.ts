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
import { ambientNpcDefinitions } from "../data/ambientNpcs";
import { InteractionController } from "../systems/interaction/InteractionController";
import {
  getNpcIdleCue,
  getNpcIdleTag,
  getNpcIdleVisual,
  shouldShowNpcIdleCueLabel
} from "../systems/npcs/NpcIdleBehavior";
import {
  advanceNpcRouteMotion,
  getActiveNpcRoute,
  getNpcRouteActivityLabel
} from "../systems/npcs/NpcRoutineRoutes";
import { getNpcProximityReaction } from "../systems/npcs/NpcProximityReactions";
import type { NpcDefinition, RelationshipMemory } from "../types";

const namedNpcIds = ["ibu_sari", "kadek", "made", "ari", "rio", "pak_bagus", "willow"] as const;

describe("NPC daily routine routes", () => {
  it("registers the narrative foundation NPCs without spawning Elena early", () => {
    expect(npcDefinitions.rio.role).toBe("Jalan Driver, Leaderboard #1");
    expect(npcDefinitions.pak_bagus.role).toBe("Berawa 2.0 Developer");
    expect(npcDefinitions.willow.role).toBe("@WillowWanders -- Wellness Creator");
    expect(npcDefinitions.elena).toBeUndefined();

    expect(npcDefinitions.rio.idleTag).toBe("generic_idle");
    expect(npcDefinitions.pak_bagus.idleTag).toBe("generic_idle");
    expect(npcDefinitions.willow.idleTag).toBe("generic_idle");
  });

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

  it("keeps raw idle cue labels out of default player-facing presentation", () => {
    expect(shouldShowNpcIdleCueLabel()).toBe(false);
    expect(shouldShowNpcIdleCueLabel(true)).toBe(true);
  });
});

describe("NPC proximity reactions", () => {
  it("does not fire outside the near-radius", () => {
    expect(getNpcProximityReaction(undefined, 121, 120)).toMatchObject({
      active: false,
      tier: "stranger",
      cue: "glances",
      pauseMs: 0
    });
  });

  it("gives strangers a glance without pausing their route", () => {
    expect(getNpcProximityReaction(undefined, 80, 120)).toMatchObject({
      active: true,
      tier: "stranger",
      cue: "glances",
      pauseMs: 0
    });
  });

  it("scales warmer reactions with existing affinity tiers", () => {
    const friendlyMemory = makeNpcMemory(8);
    const regularMemory = makeNpcMemory(18);
    const trustedMemory = makeNpcMemory(30);

    expect(getNpcProximityReaction(friendlyMemory, 80, 120)).toMatchObject({
      active: true,
      tier: "friendly",
      cue: "smiles"
    });
    expect(getNpcProximityReaction(friendlyMemory, 80, 120).pauseMs).toBeGreaterThan(0);
    expect(getNpcProximityReaction(regularMemory, 80, 120).pauseMs).toBeGreaterThan(
      getNpcProximityReaction(friendlyMemory, 80, 120).pauseMs
    );
    expect(getNpcProximityReaction(trustedMemory, 80, 120).cue).toBe("brightens");
  });
});

describe("ambient background population", () => {
  it("adds non-interactive background walkers with route and idle data", () => {
    expect(ambientNpcDefinitions.length).toBeGreaterThanOrEqual(3);
    for (const ambientNpc of ambientNpcDefinitions) {
      expect(npcDefinitions[ambientNpc.id]).toBeUndefined();
      expect(ambientNpc.route.waypoints.length).toBeGreaterThanOrEqual(3);
      expect(ambientNpc.idleTag).toBe("generic_idle");
    }
  });
});

function makeNpcMemory(affinity: number): RelationshipMemory {
  return {
    subjectType: "npc",
    subjectId: "ari",
    affinity,
    lastInteractionAt: 1,
    memories: []
  };
}
