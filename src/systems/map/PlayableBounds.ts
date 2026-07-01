import type { StreetBuildingSlot, StreetTemplate } from "./StreetTemplate";
import { roadRightTile, streetEndTile } from "./StreetTemplate";
import { TILE_SIZE } from "./TileStreetScale";

export interface PlayablePoint {
  x: number;
  y: number;
}

export interface RawWorldSize {
  width: number;
  height: number;
}

export interface PlayableBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  corridorMinX: number;
  corridorMaxX: number;
  beachExpansionStartY?: number;
}

interface Extent {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const PLAYABLE_MARGIN_PX = TILE_SIZE * 5;
const BEACH_EXPANSION_LEAD_TILES = 12;

export function deriveAuthoredStreetPlayableBounds(
  template: StreetTemplate,
  authoredPoints: readonly PlayablePoint[],
  world: RawWorldSize,
  marginPx = PLAYABLE_MARGIN_PX
): PlayableBounds {
  const beachExpansionStartY = template.beachTerminus
    ? Math.max(0, (template.beachTerminus.startsAtTile - BEACH_EXPANSION_LEAD_TILES) * TILE_SIZE)
    : undefined;
  const corridorExtents = [
    getStreetCorridorExtent(template),
    ...template.slots.filter((slot) => !isBeachSlot(slot)).map(slotExtent),
    ...authoredPoints.filter((point) => beachExpansionStartY === undefined || point.y < beachExpansionStartY).map(pointExtent)
  ];
  const allExtents = [
    getStreetCorridorExtent(template),
    ...template.slots.map(slotExtent),
    ...authoredPoints.map(pointExtent),
    ...(template.beachTerminus ? [beachTerminusExtent(template)] : [])
  ];

  const corridor = mergeExtents(corridorExtents);
  const all = mergeExtents(allExtents);
  const minX = clamp(all.minX - marginPx, 0, world.width);
  const maxX = clamp(all.maxX + marginPx, minX, world.width);
  const minY = clamp(all.minY - marginPx, 0, world.height);
  const maxY = clamp(all.maxY + marginPx, minY, world.height);
  const corridorMinX = clamp(corridor.minX - marginPx, minX, maxX);
  const corridorMaxX = clamp(corridor.maxX + marginPx, corridorMinX, maxX);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    minX,
    maxX,
    minY,
    maxY,
    corridorMinX,
    corridorMaxX,
    beachExpansionStartY
  };
}

export function getPlayableXRangeAtY(bounds: PlayableBounds, y: number): { minX: number; maxX: number } {
  if (bounds.beachExpansionStartY !== undefined && y >= bounds.beachExpansionStartY) {
    return { minX: bounds.minX, maxX: bounds.maxX };
  }
  return { minX: bounds.corridorMinX, maxX: bounds.corridorMaxX };
}

export function clampPointToPlayableBounds(
  bounds: PlayableBounds,
  point: PlayablePoint,
  edgeMargin = 0
): PlayablePoint {
  const y = clampWithMargin(point.y, bounds.minY, bounds.maxY, edgeMargin);
  const xRange = getPlayableXRangeAtY(bounds, y);
  return {
    x: clampWithMargin(point.x, xRange.minX, xRange.maxX, edgeMargin),
    y
  };
}

export function isPointInsidePlayableBounds(bounds: PlayableBounds, point: PlayablePoint, edgeMargin = 0): boolean {
  const yMin = Math.min(bounds.minY + edgeMargin, bounds.maxY);
  const yMax = Math.max(bounds.minY, bounds.maxY - edgeMargin);
  if (point.y < yMin || point.y > yMax) {
    return false;
  }
  const xRange = getPlayableXRangeAtY(bounds, point.y);
  const xMin = Math.min(xRange.minX + edgeMargin, xRange.maxX);
  const xMax = Math.max(xRange.minX, xRange.maxX - edgeMargin);
  return point.x >= xMin && point.x <= xMax;
}

function getStreetCorridorExtent(template: StreetTemplate): Extent {
  const minX = (template.roadLeftTile - template.sidewalkTiles) * TILE_SIZE;
  const maxX = (roadRightTile(template) + template.sidewalkTiles + 1) * TILE_SIZE;
  const minY = template.start.tileY * TILE_SIZE;
  const maxY = (streetEndTile(template) + 1) * TILE_SIZE;
  return { minX, maxX, minY, maxY };
}

function beachTerminusExtent(template: StreetTemplate): Extent {
  const terminus = template.beachTerminus!;
  const xPadTiles = template.roadWidthTiles + template.sidewalkTiles + template.slotDepthTiles;
  return {
    minX: (terminus.dockTileX - xPadTiles) * TILE_SIZE,
    maxX: (terminus.dockTileX + xPadTiles + 2) * TILE_SIZE,
    minY: terminus.startsAtTile * TILE_SIZE,
    maxY: (terminus.startsAtTile + terminus.sandTiles + terminus.waterTiles) * TILE_SIZE
  };
}

function slotExtent(slot: StreetBuildingSlot): Extent {
  return {
    minX: slot.tileX * TILE_SIZE,
    maxX: (slot.tileX + slot.depthTiles) * TILE_SIZE,
    minY: slot.tileY * TILE_SIZE,
    maxY: (slot.tileY + slot.widthTiles) * TILE_SIZE
  };
}

function pointExtent(point: PlayablePoint): Extent {
  return {
    minX: point.x,
    maxX: point.x,
    minY: point.y,
    maxY: point.y
  };
}

function isBeachSlot(slot: StreetBuildingSlot): boolean {
  return slot.category === "beach" || slot.venueId === "berawa_beach";
}

function mergeExtents(extents: Extent[]): Extent {
  return {
    minX: Math.min(...extents.map((extent) => extent.minX)),
    maxX: Math.max(...extents.map((extent) => extent.maxX)),
    minY: Math.min(...extents.map((extent) => extent.minY)),
    maxY: Math.max(...extents.map((extent) => extent.maxY))
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampWithMargin(value: number, min: number, max: number, margin: number): number {
  const innerMin = min + margin;
  const innerMax = max - margin;
  if (innerMin > innerMax) {
    return (min + max) / 2;
  }
  return clamp(value, innerMin, innerMax);
}
