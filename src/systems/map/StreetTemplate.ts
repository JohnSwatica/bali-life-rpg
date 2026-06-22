import type { CuratedCategory } from "../../data/curatedVenues";
import type { TilePoint } from "./TileStreetScale";

export type StreetAxis = "horizontal" | "vertical";
export type StreetSide = "left" | "right" | "top" | "bottom";

export interface StreetBuildingSlot {
  id: string;
  side: StreetSide;
  order: number;
  tileX: number;
  tileY: number;
  widthTiles: number;
  depthTiles: number;
  entrance: TilePoint;
  venueId?: string;
  curatedVenueId?: string;
  label?: string;
  category?: CuratedCategory;
  isLandmark?: boolean;
  questCritical?: boolean;
}

export interface StreetTemplate {
  id: string;
  name: string;
  axis: StreetAxis;
  lengthTiles: number;
  roadWidthTiles: number;
  sidewalkTiles: number;
  slotDepthTiles: number;
  start: TilePoint;
  roadLeftTile: number;
  slots: StreetBuildingSlot[];
  beachTerminus?: {
    startsAtTile: number;
    sandTiles: number;
    waterTiles: number;
    dockTileX: number;
  };
}

export interface StreetSlotSpec {
  side: StreetSide;
  order: number;
  widthTiles: number;
  depthTiles?: number;
  venueId?: string;
  curatedVenueId?: string;
  label?: string;
  category?: CuratedCategory;
  isLandmark?: boolean;
  questCritical?: boolean;
}

export function isVerticalStreet(template: StreetTemplate): boolean {
  return template.axis === "vertical";
}

export function roadRightTile(template: StreetTemplate): number {
  return template.roadLeftTile + template.roadWidthTiles - 1;
}

export function roadCenterTile(template: StreetTemplate): number {
  return template.roadLeftTile + (template.roadWidthTiles - 1) / 2;
}

export function streetEndTile(template: StreetTemplate): number {
  return template.start.tileY + template.lengthTiles - 1;
}

export function createStreetSlots(template: Omit<StreetTemplate, "slots">, specs: StreetSlotSpec[]): StreetBuildingSlot[] {
  return specs.map((spec) => {
    const depthTiles = spec.depthTiles ?? template.slotDepthTiles;
    const tileY = template.start.tileY + spec.order * (spec.widthTiles + 1);
    const tileX = tileXForSide(template, spec.side, spec.widthTiles);
    return {
      id: `${template.id}-${spec.side}-${spec.order}`,
      side: spec.side,
      order: spec.order,
      tileX,
      tileY,
      widthTiles: spec.widthTiles,
      depthTiles,
      entrance: entranceForSlot(template, spec.side, tileX, tileY, spec.widthTiles, depthTiles),
      venueId: spec.venueId,
      curatedVenueId: spec.curatedVenueId,
      label: spec.label,
      category: spec.category,
      isLandmark: spec.isLandmark,
      questCritical: spec.questCritical
    };
  });
}

function tileXForSide(template: Omit<StreetTemplate, "slots">, side: StreetSide, widthTiles: number): number {
  if (!isVerticalStreet(template as StreetTemplate)) {
    return template.start.tileX;
  }
  if (side === "left") {
    return template.roadLeftTile - template.sidewalkTiles - template.slotDepthTiles - 1;
  }
  if (side === "right") {
    return roadRightTile(template as StreetTemplate) + template.sidewalkTiles + 2;
  }
  return Math.round(roadCenterTile(template as StreetTemplate) - widthTiles / 2);
}

function entranceForSlot(
  template: Omit<StreetTemplate, "slots">,
  side: StreetSide,
  tileX: number,
  tileY: number,
  widthTiles: number,
  depthTiles: number
): TilePoint {
  if (!isVerticalStreet(template as StreetTemplate)) {
    return { tileX: tileX + Math.floor(widthTiles / 2), tileY };
  }
  const entranceY = tileY + Math.floor(widthTiles / 2);
  if (side === "left") {
    return {
      tileX: tileX + depthTiles - 1,
      tileY: entranceY
    };
  }
  if (side === "right") {
    return {
      tileX,
      tileY: entranceY
    };
  }
  return {
    tileX: tileX + Math.floor(widthTiles / 2),
    tileY: entranceY
  };
}
