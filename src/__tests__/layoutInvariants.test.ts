import { describe, expect, it } from "vitest";
import { activeStreetTemplate, curatedVenueNodes, venueMapNodes } from "../data/authoredStreetLayout";
import { deliveryDefinitions } from "../data/deliveries";
import { interiorDefinitions } from "../data/interiors";
import { authoredPlayableBounds, authoredPlayablePoints } from "../data/playableBounds";
import { paddyFieldPatches, villaGateDressings } from "../data/worldDressing";
import { stationVisualDefinitions } from "../data/stationVisuals";
import { getVenuePoint } from "../data/layoutLookup";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../data/map";
import { paddyFieldState } from "../systems/map/PaddyFields";
import { clampPointToPlayableBounds, isPointInsidePlayableBounds } from "../systems/map/PlayableBounds";
import {
  buildStreetTileData,
  getEnterableStreetVenueIds,
  getPermanentlySignedVenueIds,
  getStreetSignPrimaryText
} from "../systems/map/StreetRenderer";
import {
  createStreetSlots,
  roadRightTile,
  streetEndTile,
  type StreetSlotSpec,
  type StreetTemplate
} from "../systems/map/StreetTemplate";
import { TILE_IDS, TILE_SIZE } from "../systems/map/TileStreetScale";

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

  it("uses real venue names as primary sign text instead of station labels", () => {
    const stationLabels = new Set(stationVisualDefinitions.map((visual) => visual.signLabel));
    const slots = activeStreetTemplate.slots.filter((slot) => slot.venueId && slot.label);
    const signTexts = slots.map((slot) => getStreetSignPrimaryText(slot));

    expect(signTexts).toContain("CANGGU\nSTATION");
    expect(signTexts).toContain("MILK &\nMADU");
    for (const text of signTexts) {
      expect(stationLabels.has(text), text).toBe(false);
    }

    const duplicateTexts = signTexts.filter((text, index) => signTexts.indexOf(text) !== index);
    expect(duplicateTexts).toEqual([]);
    expect(getPermanentlySignedVenueIds(activeStreetTemplate).has("canggu_station")).toBe(true);
  });

  it("marks street venues with interiors as enterable doors", () => {
    const enterableStreetVenueIds = getEnterableStreetVenueIds(activeStreetTemplate);
    const interiorVenueIds = new Set(Object.values(interiorDefinitions).map((interior) => interior.venueId));

    expect([...enterableStreetVenueIds].every((venueId) => interiorVenueIds.has(venueId))).toBe(true);
    expect(enterableStreetVenueIds).toEqual(
      new Set([
        "canggu_station",
        "baked_berawa",
        "milk_madu_berawa",
        "bali_family_rental_scooter",
        "satu_satu_coffee",
        "bungalow_living"
      ])
    );
    expect(enterableStreetVenueIds.has("cheap_kos")).toBe(false);
  });

  it("keeps building access strips from painting sidewalk over the road band", () => {
    const data = buildStreetTileData(activeStreetTemplate);
    const roadLeft = activeStreetTemplate.roadLeftTile;
    const roadRight = roadRightTile(activeStreetTemplate);

    for (let y = activeStreetTemplate.start.tileY; y <= streetEndTile(activeStreetTemplate); y += 1) {
      for (let x = roadLeft; x <= roadRight; x += 1) {
        expect(data[y][x], `road band ${x},${y}`).not.toBe(TILE_IDS.sidewalk);
      }
    }
  });

  it("keeps authored paddy fields off road, sidewalk, venue plots, and beach tiles", () => {
    const data = buildStreetTileData(activeStreetTemplate);
    const forbiddenTiles: Set<number> = new Set([
      TILE_IDS.road,
      TILE_IDS.sidewalk,
      TILE_IDS.plot,
      TILE_IDS.sand,
      TILE_IDS.shallowWater,
      TILE_IDS.deepWater,
      TILE_IDS.waterEdge,
      TILE_IDS.dock
    ]);
    const templatePaddies = paddyFieldPatches.filter((patch) => patch.templateId === activeStreetTemplate.id);

    expect(templatePaddies.length).toBeGreaterThan(0);
    for (const patch of templatePaddies) {
      for (let y = patch.tileY; y < patch.tileY + patch.heightTiles; y += 1) {
        for (let x = patch.tileX; x < patch.tileX + patch.widthTiles; x += 1) {
          expect(forbiddenTiles.has(data[y][x]), `${patch.id} at ${x},${y}`).toBe(false);
        }
      }
    }
  });

  it("seeds one yellowing paddy patch while keeping the rest green by default", () => {
    const states = paddyFieldPatches.map((patch) => [patch.id, paddyFieldState(patch)] as const);

    expect(states.filter(([, state]) => state === "yellowing").map(([id]) => id)).toEqual(["corner_yellowing_paddy"]);
    expect(states.filter(([, state]) => state === "green").length).toBe(paddyFieldPatches.length - 1);
  });

  it("keeps villa gate dressing aligned to existing villa delivery dropoff points", () => {
    const villaDeliveries = deliveryDefinitions.filter(
      (delivery) => delivery.dropoffId.toLowerCase().includes("villa") || delivery.dropoffName.toLowerCase().includes("villa")
    );

    expect(villaGateDressings.map((gate) => gate.deliveryId).sort()).toEqual(villaDeliveries.map((delivery) => delivery.id).sort());
    for (const delivery of villaDeliveries) {
      const gate = villaGateDressings.find((candidate) => candidate.deliveryId === delivery.id);
      expect(gate).toBeDefined();
      expect(gate).toMatchObject({
        dropoffId: delivery.dropoffId,
        x: delivery.dropoffPoint.x,
        y: delivery.dropoffPoint.y
      });
    }
  });

  it("contains playable bounds to the authored corridor while keeping venues and interaction points reachable", () => {
    expect(authoredPlayableBounds.width).toBeLessThan(WORLD_WIDTH * 0.6);
    expect(authoredPlayableBounds.height).toBeLessThanOrEqual(WORLD_HEIGHT);
    expect(authoredPlayableBounds.x).toBeGreaterThanOrEqual(0);
    expect(authoredPlayableBounds.y).toBeGreaterThanOrEqual(0);
    expect(authoredPlayableBounds.x + authoredPlayableBounds.width).toBeLessThanOrEqual(WORLD_WIDTH);
    expect(authoredPlayableBounds.y + authoredPlayableBounds.height).toBeLessThanOrEqual(WORLD_HEIGHT);

    for (const node of venueMapNodes) {
      expect(isPointInsidePlayableBounds(authoredPlayableBounds, node), node.venueId).toBe(true);
    }
    for (const node of curatedVenueNodes) {
      expect(isPointInsidePlayableBounds(authoredPlayableBounds, node), node.venueId).toBe(true);
    }
    for (const point of authoredPlayablePoints) {
      expect(isPointInsidePlayableBounds(authoredPlayableBounds, point), `${point.x},${point.y}`).toBe(true);
    }
  });

  it("clamps stray north-street movement back to the corridor while preserving beach width", () => {
    const streetY = Math.max(authoredPlayableBounds.minY + 160, 160);
    const leftStreetClamp = clampPointToPlayableBounds(authoredPlayableBounds, { x: 0, y: streetY });
    const rightStreetClamp = clampPointToPlayableBounds(authoredPlayableBounds, { x: WORLD_WIDTH, y: streetY });

    expect(leftStreetClamp.x).toBe(authoredPlayableBounds.corridorMinX);
    expect(rightStreetClamp.x).toBe(authoredPlayableBounds.corridorMaxX);

    const beachY = authoredPlayableBounds.beachExpansionStartY
      ? authoredPlayableBounds.beachExpansionStartY + 160
      : authoredPlayableBounds.maxY;
    const leftBeachClamp = clampPointToPlayableBounds(authoredPlayableBounds, { x: 0, y: beachY });
    const rightBeachClamp = clampPointToPlayableBounds(authoredPlayableBounds, { x: WORLD_WIDTH, y: beachY });

    expect(leftBeachClamp.x).toBe(authoredPlayableBounds.minX);
    expect(rightBeachClamp.x).toBe(authoredPlayableBounds.maxX);
  });
});
