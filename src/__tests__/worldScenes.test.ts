import { describe, expect, it } from "vitest";
import { getOpportunityWorldScenes } from "../systems/world/WorldScenes";
import { createInitialWorldState } from "../systems/WorldState";
import type { LiveOpportunity, WorldState } from "../types";

function addLiveOpportunity(world: WorldState, templateId: string, status: LiveOpportunity["status"] = "live"): void {
  world.opportunities.live.push({
    id: `${templateId}:test`,
    templateId,
    status,
    spawnedAt: 1,
    expiresAt: 120,
    locationVenueId: "test_venue"
  });
}

describe("world-surfaced opportunity scenes", () => {
  it("renders gigs as help-wanted scenes with a waving actor", () => {
    const world = createInitialWorldState();
    addLiveOpportunity(world, "milk_madu_lunch_rush_shift");

    expect(getOpportunityWorldScenes(world)).toContainEqual(
      expect.objectContaining({
        source: "opportunity",
        opportunityType: "gig",
        venueId: "milk_madu_berawa",
        sceneKind: "gig_help_wanted",
        cue: "HELP",
        actors: [expect.objectContaining({ role: "waving" })]
      })
    );
  });

  it("renders social opportunities as small converging gatherings", () => {
    const world = createInitialWorldState();
    addLiveOpportunity(world, "ari_sunset_ping");

    const scene = getOpportunityWorldScenes(world).find((candidate) => candidate.templateId === "ari_sunset_ping");
    expect(scene).toMatchObject({
      opportunityType: "social",
      sceneKind: "social_gathering",
      cue: "GATHER"
    });
    expect(scene?.actors.length).toBeGreaterThanOrEqual(2);
    expect(scene?.actors.every((actor) => actor.role === "gathering")).toBe(true);
  });

  it("renders help-outs as distressed waiting scenes", () => {
    const world = createInitialWorldState();
    addLiveOpportunity(world, "canggu_station_dropped_cart");

    expect(getOpportunityWorldScenes(world)).toContainEqual(
      expect.objectContaining({
        opportunityType: "help_out",
        venueId: "canggu_station",
        sceneKind: "help_distress",
        cue: "HELP?",
        actors: [expect.objectContaining({ role: "distressed" })]
      })
    );
  });

  it("renders flash deals as venue signals, not actor gatherings", () => {
    const world = createInitialWorldState();
    addLiveOpportunity(world, "baked_croissant_flash", "accepted");

    expect(getOpportunityWorldScenes(world)).toContainEqual(
      expect.objectContaining({
        opportunityType: "flash_deal",
        venueId: "baked_berawa",
        sceneKind: "deal_signal",
        cue: "TRACKED",
        accepted: true,
        actors: []
      })
    );
  });
});
