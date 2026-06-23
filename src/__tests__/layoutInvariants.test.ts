import { describe, expect, it } from "vitest";
import { activeStreetTemplate, curatedVenueNodes, venueMapNodes } from "../data/authoredStreetLayout";
import { getVenuePoint } from "../data/layoutLookup";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../data/map";
import { createStreetSlots, type StreetSlotSpec, type StreetTemplate } from "../systems/map/StreetTemplate";
import { TILE_SIZE } from "../systems/map/TileStreetScale";

interface Rect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function slotRect(slot: (typeof activeStreetTemplate.slots)[number]): Rect {
  const verticalSide = activeStreetTemplate.axis === "vertical" && (slot.side === "left" || slot.side === "right");
  return {
    id: slot.venueId ?? slot.id,
    x: slot.tileX * TILE_SIZE,
    y: slot.tileY * TILE_SIZE,
    width: (verticalSide ? slot.depthTiles : slot.widthTiles) * TILE_SIZE,
    height: (verticalSide ? slot.widthTiles : slot.depthTiles) * TILE_SIZE
  };
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

describe("authored street layout invariants", () => {
  it("has no duplicate venue IDs and no overlapping venue slots", () => {
    const slots = activeStreetTemplate.slots.filter((slot) => slot.venueId);
    const ids = slots.map((slot) => slot.venueId);

    expect(new Set(ids).size).toBe(ids.length);

    const rects = slots.map(slotRect);
    const collisions: string[] = [];
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        if (overlaps(rects[i], rects[j])) {
          collisions.push(`${rects[i].id}:${rects[j].id}`);
        }
      }
    }
    expect(collisions).toEqual([]);
  });

  it("resolves quest-critical and mobility venues to finite in-bounds authored positions", () => {
    const requiredVenueIds = [
      "canggu_station",
      "baked_berawa",
      "milk_madu_berawa",
      "bali_family_rental_scooter",
      "berawa_beach"
    ];

    for (const venueId of requiredVenueIds) {
      expect(venueMapNodes.some((node) => node.venueId === venueId), `${venueId} node`).toBe(true);
      expect(curatedVenueNodes.some((node) => node.venueId === venueId), `${venueId} curated node`).toBe(true);
      const point = getVenuePoint(venueId, { x: -9999, y: -9999 });
      expect(Number.isFinite(point.x), `${venueId} x`).toBe(true);
      expect(Number.isFinite(point.y), `${venueId} y`).toBe(true);
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(WORLD_WIDTH);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(WORLD_HEIGHT);
    }
  });

  it("assigns StreetTemplate slots deterministically for the same input", () => {
    const base: Omit<StreetTemplate, "slots"> = {
      id: "test_street",
      name: "Test Street",
      axis: "vertical",
      lengthTiles: 24,
      roadWidthTiles: 6,
      sidewalkTiles: 2,
      slotDepthTiles: 5,
      start: { tileX: 0, tileY: 4 },
      roadLeftTile: 12
    };
    const specs: StreetSlotSpec[] = [
      { side: "left", order: 0, widthTiles: 3, venueId: "a" },
      { side: "right", order: 1, widthTiles: 4, depthTiles: 6, venueId: "b" },
      { side: "top", order: 2, tileX: 10, tileY: 18, widthTiles: 5, depthTiles: 3, venueId: "c" }
    ];

    expect(createStreetSlots(base, specs)).toEqual(createStreetSlots(base, specs));
  });
});
