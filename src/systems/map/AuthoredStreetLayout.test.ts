import { describe, expect, it } from "vitest";
import {
  activeStreetTemplate,
  curatedVenueNodes,
  venueMapNodes
} from "../../data/authoredStreetLayout";
import { getVenuePoint } from "../../data/layoutLookup";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../../data/map";
import { buildStreetTileData, getStreetBuildingRects } from "./StreetRenderer";
import type { StreetBuildingRect } from "./StreetRenderer";

const QUEST_CRITICAL_VENUE_IDS = [
  "canggu_station",
  "baked_berawa",
  "milk_madu_berawa",
  "bali_family_rental_scooter",
  "berawa_beach",
  "finns_beach_club",
  "atlas_beach_fest"
] as const;

describe("authored street layout invariants", () => {
  it("has no duplicate venue IDs in slots or map nodes", () => {
    const slotVenueIds = getStreetBuildingRects(activeStreetTemplate)
      .map((rect) => rect.slot.venueId)
      .filter((id): id is string => Boolean(id));
    const nodeVenueIds = curatedVenueNodes.map((node) => node.venueId);
    const venueMapIds = venueMapNodes.map((node) => node.venueId);

    expect(findDuplicates(slotVenueIds)).toEqual([]);
    expect(findDuplicates(nodeVenueIds)).toEqual([]);
    expect(findDuplicates(venueMapIds)).toEqual([]);
  });

  it("places venue buildings without footprint overlaps", () => {
    const rects = getStreetBuildingRects(activeStreetTemplate).filter((rect) => rect.slot.venueId);
    const overlaps: string[] = [];

    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        if (rectsOverlap(rects[i], rects[j])) {
          overlaps.push(`${rects[i].slot.venueId} overlaps ${rects[j].slot.venueId}`);
        }
      }
    }

    expect(overlaps).toEqual([]);
  });

  it("resolves every quest-critical venue through layoutLookup to finite in-bounds points", () => {
    for (const venueId of QUEST_CRITICAL_VENUE_IDS) {
      const point = getVenuePoint(venueId, { x: -9999, y: -9999 });
      expect(point, venueId).not.toEqual({ x: -9999, y: -9999 });
      expect(Number.isFinite(point.x), venueId).toBe(true);
      expect(Number.isFinite(point.y), venueId).toBe(true);
      expect(point.x, venueId).toBeGreaterThanOrEqual(0);
      expect(point.x, venueId).toBeLessThanOrEqual(WORLD_WIDTH);
      expect(point.y, venueId).toBeGreaterThanOrEqual(0);
      expect(point.y, venueId).toBeLessThanOrEqual(WORLD_HEIGHT);
    }
  });

  it("builds deterministic slot rectangles and tile data for the same template input", () => {
    expect(getStreetBuildingRects(activeStreetTemplate)).toEqual(getStreetBuildingRects(activeStreetTemplate));
    expect(buildStreetTileData(activeStreetTemplate)).toEqual(buildStreetTileData(activeStreetTemplate));
  });
});

describe.skip("HUD and minimap anchor invariants", () => {
  it("keeps screen-space anchors inside the viewport when layout helpers are exposed as pure functions", () => {
    // HUD button and minimap positioning currently live inside Phaser scene/controller instance methods.
    // Testing them without a live canvas would require exporting a pure layout helper first, which is a runtime
    // surface change outside this additive hardening pass.
  });
});

function rectsOverlap(a: StreetBuildingRect, b: StreetBuildingRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return [...duplicates].sort();
}
