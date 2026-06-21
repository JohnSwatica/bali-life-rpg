import type { CuratedVenueMapNode, RoadPathDefinition } from "../../data/berawaLayout";

export interface VenueFootprint {
  width: number;
  height: number;
}

export interface MapPoint {
  x: number;
  y: number;
}

export interface VenuePresentationPlacement extends VenueFootprint {
  node: CuratedVenueMapNode;
  sourceX: number;
  sourceY: number;
  x: number;
  y: number;
  tangent: MapPoint;
  outwardNormal: MapPoint;
  snappedToRoad: boolean;
  roadId: string | null;
  roadName: string | null;
  roadWidth: number;
  distanceFromRoad: number;
}

export const PLAYER_PRESENTATION_FOOTPRINT: VenueFootprint = {
  width: 24,
  height: 30
};

export const BUILDING_SCALE_MULTIPLES = {
  normal: { width: 2.0, height: 1.5 },
  wide: { width: 2.3, height: 1.55 },
  questCritical: { width: 2.45, height: 1.65 },
  landmark: { width: 5.0, height: 3.0 },
  beachLandmark: { width: 4.6, height: 2.2 },
  beachMarker: { width: 2.4, height: 1.25 }
} as const;

export function getVenueFootprint(node: CuratedVenueMapNode): VenueFootprint {
  if (node.category === "beach") {
    return scaleFootprint(node.isLandmark ? BUILDING_SCALE_MULTIPLES.beachLandmark : BUILDING_SCALE_MULTIPLES.beachMarker);
  }

  if (node.isLandmark) {
    return scaleFootprint(BUILDING_SCALE_MULTIPLES.landmark);
  }

  if (node.questCritical) {
    return scaleFootprint(BUILDING_SCALE_MULTIPLES.questCritical);
  }

  if (node.category === "coworking" || node.category === "grocery" || node.category === "shop") {
    return scaleFootprint(BUILDING_SCALE_MULTIPLES.wide);
  }

  return scaleFootprint(BUILDING_SCALE_MULTIPLES.normal);
}

export function computeVenuePresentationLayout(
  nodes: CuratedVenueMapNode[],
  roads: RoadPathDefinition[]
): VenuePresentationPlacement[] {
  return nodes.map((node) => placeVenueBesideRoad(node, roads));
}

function placeVenueBesideRoad(node: CuratedVenueMapNode, roads: RoadPathDefinition[]): VenuePresentationPlacement {
  const footprint = getVenueFootprint(node);
  if (node.category === "beach") {
    return createUnsnappedPlacement(node, footprint);
  }

  const nearest = findNearestRoadSegment({ x: node.x, y: node.y }, roads);
  if (!nearest) {
    return createUnsnappedPlacement(node, footprint);
  }

  const sideVector = {
    x: node.x - nearest.closest.x,
    y: node.y - nearest.closest.y
  };
  const sideDot = dot(sideVector, nearest.normal);
  const side = Math.abs(sideDot) > 0.01 ? Math.sign(sideDot) : stableSideForId(node.venueId);
  const outwardNormal = {
    x: nearest.normal.x * side,
    y: nearest.normal.y * side
  };
  const roadsideGap = 8;
  const offset = nearest.roadWidth / 2 + footprint.height / 2 + roadsideGap;

  return {
    ...footprint,
    node,
    sourceX: node.x,
    sourceY: node.y,
    x: Math.round(nearest.closest.x + outwardNormal.x * offset),
    y: Math.round(nearest.closest.y + outwardNormal.y * offset),
    tangent: nearest.tangent,
    outwardNormal,
    snappedToRoad: true,
    roadId: nearest.roadId,
    roadName: nearest.roadName,
    roadWidth: nearest.roadWidth,
    distanceFromRoad: nearest.distance
  };
}

function scaleFootprint(multiple: { width: number; height: number }): VenueFootprint {
  return {
    width: Math.round(PLAYER_PRESENTATION_FOOTPRINT.width * multiple.width),
    height: Math.round(PLAYER_PRESENTATION_FOOTPRINT.height * multiple.height)
  };
}

function createUnsnappedPlacement(node: CuratedVenueMapNode, footprint: VenueFootprint): VenuePresentationPlacement {
  return {
    ...footprint,
    node,
    sourceX: node.x,
    sourceY: node.y,
    x: node.x,
    y: node.y,
    tangent: { x: 1, y: 0 },
    outwardNormal: { x: 0, y: 1 },
    snappedToRoad: false,
    roadId: null,
    roadName: null,
    roadWidth: 0,
    distanceFromRoad: 0
  };
}

interface NearestRoadSegment {
  roadId: string;
  roadName: string;
  roadWidth: number;
  closest: MapPoint;
  tangent: MapPoint;
  normal: MapPoint;
  distance: number;
}

function findNearestRoadSegment(point: MapPoint, roads: RoadPathDefinition[]): NearestRoadSegment | null {
  let nearest: NearestRoadSegment | null = null;

  for (const road of roads) {
    for (let index = 1; index < road.points.length; index += 1) {
      const start = road.points[index - 1];
      const end = road.points[index];
      const segment = describeSegment(point, start, end, road);
      if (!segment) {
        continue;
      }
      if (!nearest || segment.distance < nearest.distance) {
        nearest = segment;
      }
    }
  }

  return nearest;
}

function describeSegment(
  point: MapPoint,
  start: MapPoint,
  end: MapPoint,
  road: RoadPathDefinition
): NearestRoadSegment | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return null;
  }

  const length = Math.sqrt(lengthSquared);
  const tangent = { x: dx / length, y: dy / length };
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  const closest = {
    x: start.x + dx * t,
    y: start.y + dy * t
  };
  return {
    roadId: road.id,
    roadName: road.name,
    roadWidth: road.width,
    closest,
    tangent,
    normal: { x: -tangent.y, y: tangent.x },
    distance: Math.hypot(point.x - closest.x, point.y - closest.y)
  };
}

function dot(a: MapPoint, b: MapPoint): number {
  return a.x * b.x + a.y * b.y;
}

function stableSideForId(id: string): 1 | -1 {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return hash % 2 === 0 ? 1 : -1;
}
