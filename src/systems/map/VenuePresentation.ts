import type { CuratedVenueMapNode, RoadPathDefinition } from "../../data/berawaLayout";
import { PLAYER_UNIT, POKEMON_SCALE, playerUnits, roadWidthForImportance } from "./PlayerUnitScale";

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
  slideTangent: MapPoint;
  roadOutwardNormal: MapPoint;
  tangentSlide: number;
  snappedToRoad: boolean;
  roadId: string | null;
  roadName: string | null;
  roadWidth: number;
  distanceFromRoad: number;
}

export const PLAYER_PRESENTATION_FOOTPRINT: VenueFootprint = {
  width: PLAYER_UNIT.width,
  height: PLAYER_UNIT.height
};

export const BUILDING_SCALE_MULTIPLES = POKEMON_SCALE.buildings;

export const ROADSIDE_BUILDING_GAP = playerUnits(POKEMON_SCALE.layout.roadsideGap);
export const MAX_ROADSIDE_TANGENT_SLIDE = playerUnits(POKEMON_SCALE.layout.maxRoadsideTangentSlide);

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
  return resolveRoadsideOverlaps(nodes.map((node) => placeVenueBesideRoad(node, roads)));
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
  if (nearest.distance > playerUnits(POKEMON_SCALE.layout.maxRoadSnapDistance)) {
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
  const presentationRoadWidth = roadWidthForImportance(nearest.roadImportance);
  const offset = presentationRoadWidth / 2 + footprint.height / 2 + ROADSIDE_BUILDING_GAP;

  return {
    ...footprint,
    node,
    sourceX: node.x,
    sourceY: node.y,
    x: Math.round(nearest.closest.x + outwardNormal.x * offset),
    y: Math.round(nearest.closest.y + outwardNormal.y * offset),
    tangent: { x: 1, y: 0 },
    outwardNormal: { x: 0, y: 1 },
    slideTangent: nearest.tangent,
    roadOutwardNormal: outwardNormal,
    tangentSlide: 0,
    snappedToRoad: true,
    roadId: nearest.roadId,
    roadName: nearest.roadName,
    roadWidth: presentationRoadWidth,
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
    slideTangent: { x: 1, y: 0 },
    roadOutwardNormal: { x: 0, y: 1 },
    tangentSlide: 0,
    snappedToRoad: false,
    roadId: null,
    roadName: null,
    roadWidth: 0,
    distanceFromRoad: 0
  };
}

function resolveRoadsideOverlaps(placements: VenuePresentationPlacement[]): VenuePresentationPlacement[] {
  const resolved = placements.map((placement) => ({ ...placement }));
  packRoadsideRows(resolved);
  const passes = 72;

  for (let pass = 0; pass < passes; pass += 1) {
    let changed = false;
    for (let aIndex = 0; aIndex < resolved.length; aIndex += 1) {
      for (let bIndex = aIndex + 1; bIndex < resolved.length; bIndex += 1) {
        const a = resolved[aIndex];
        const b = resolved[bIndex];
        if (a.node.category === "beach" || b.node.category === "beach") {
          continue;
        }

        const overlap = getOrientedOverlap(a, b);
        if (!overlap.overlaps) {
          continue;
        }

        const moved = separatePlacementsAlongAxis(a, b, overlap);
        const movedA = moved > 0;
        const movedB = moved > 0;
        changed = movedA || movedB || changed;
      }
    }

    if (!changed) {
      break;
    }
  }

  return resolved.map((placement) => ({
    ...placement,
    x: Math.round(placement.x),
    y: Math.round(placement.y)
  }));
}

function packRoadsideRows(placements: VenuePresentationPlacement[]): void {
  const groups = new Map<string, VenuePresentationPlacement[]>();
  for (const placement of placements) {
    if (!placement.snappedToRoad || !placement.roadId || placement.node.category === "beach") {
      continue;
    }
    const normalKey = `${Math.round(placement.roadOutwardNormal.x * 5)}:${Math.round(placement.roadOutwardNormal.y * 5)}`;
    const key = `${placement.roadId}:${normalKey}`;
    const group = groups.get(key) ?? [];
    group.push(placement);
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    if (group.length < 2) {
      continue;
    }
    const referenceTangent = group[0].slideTangent;
    for (let pass = 0; pass < 8; pass += 1) {
      let changed = false;
      group.sort((a, b) => dot(a, referenceTangent) - dot(b, referenceTangent));

      for (let index = 1; index < group.length; index += 1) {
        const previous = group[index - 1];
        const current = group[index];
        const previousScalar = dot(previous, referenceTangent);
        const currentScalar = dot(current, referenceTangent);
        const normalDistance = Math.abs(dot({ x: current.x - previous.x, y: current.y - previous.y }, previous.roadOutwardNormal));
        const normalLimit = (previous.height + current.height) / 2 + ROADSIDE_BUILDING_GAP;
        if (normalDistance >= normalLimit) {
          continue;
        }

        const requiredScalarGap = (previous.width + current.width) / 2 + ROADSIDE_BUILDING_GAP;
        const overlap = previousScalar + requiredScalarGap - currentScalar;
        if (overlap <= 0) {
          continue;
        }

        const currentMoved = slideAlongReferenceTangent(current, referenceTangent, overlap);
        const leftover = overlap - currentMoved;
        if (leftover > 0) {
          changed = slideAlongReferenceTangent(previous, referenceTangent, -leftover) > 0 || changed;
        }
        changed = currentMoved > 0 || changed;
      }

      if (!changed) {
        break;
      }
    }
  }
}

function slidePlacementAwayFrom(
  placement: VenuePresentationPlacement,
  other: VenuePresentationPlacement,
  requestedDistance: number
): boolean {
  if (!placement.snappedToRoad) {
    return false;
  }

  const remaining = MAX_ROADSIDE_TANGENT_SLIDE - Math.abs(placement.tangentSlide);
  if (remaining <= 0) {
    return false;
  }

  const delta = {
    x: placement.x - other.x,
    y: placement.y - other.y
  };
  const direction = dot(delta, placement.slideTangent) >= 0 ? 1 : -1;
  return applySignedTangentSlide(placement, direction * Math.min(remaining, requestedDistance)) > 0;
}

function separatePlacementsAlongAxis(
  a: VenuePresentationPlacement,
  b: VenuePresentationPlacement,
  overlap: { depth: number; axis: MapPoint }
): number {
  const centerDelta = { x: b.x - a.x, y: b.y - a.y };
  const direction = dot(centerDelta, overlap.axis) >= 0 ? 1 : -1;
  const requiredProjection = Math.min(120, Math.max(12, overlap.depth + ROADSIDE_BUILDING_GAP));
  const aPower = a.snappedToRoad ? Math.abs(dot(a.slideTangent, overlap.axis)) : 0;
  const bPower = b.snappedToRoad ? Math.abs(dot(b.slideTangent, overlap.axis)) : 0;
  const totalPower = aPower + bPower;

  if (totalPower < 0.12) {
    const fallbackDistance = requiredProjection / 2;
    const movedA = slidePlacementAwayFrom(a, b, fallbackDistance) ? fallbackDistance : 0;
    const movedB = slidePlacementAwayFrom(b, a, fallbackDistance) ? fallbackDistance : 0;
    return movedA + movedB;
  }

  const aTarget = (requiredProjection * (aPower || 0)) / totalPower;
  const bTarget = requiredProjection - aTarget;
  let moved = 0;
  const movedA = slidePlacementProjection(a, overlap.axis, -direction * aTarget);
  const movedB = slidePlacementProjection(b, overlap.axis, direction * bTarget);
  moved += movedA + movedB;

  const missingA = aTarget - movedA;
  const missingB = bTarget - movedB;
  if (missingA > 0.5) {
    moved += slidePlacementProjection(b, overlap.axis, direction * missingA);
  }
  if (missingB > 0.5) {
    moved += slidePlacementProjection(a, overlap.axis, -direction * missingB);
  }

  return moved;
}

function slidePlacementProjection(
  placement: VenuePresentationPlacement,
  axis: MapPoint,
  signedProjectionDistance: number
): number {
  if (!placement.snappedToRoad || signedProjectionDistance === 0) {
    return 0;
  }

  const tangentProjection = dot(placement.slideTangent, axis);
  if (Math.abs(tangentProjection) < 0.08) {
    return 0;
  }

  const requestedSlide = signedProjectionDistance / tangentProjection;
  const movedSlide = applySignedTangentSlide(placement, requestedSlide);
  return movedSlide * Math.abs(tangentProjection);
}

function slideAlongReferenceTangent(
  placement: VenuePresentationPlacement,
  referenceTangent: MapPoint,
  signedDistance: number
): number {
  const direction = dot(referenceTangent, placement.slideTangent) >= 0 ? 1 : -1;
  return applySignedTangentSlide(placement, signedDistance * direction);
}

function applySignedTangentSlide(placement: VenuePresentationPlacement, signedDistance: number): number {
  const remaining = MAX_ROADSIDE_TANGENT_SLIDE - Math.abs(placement.tangentSlide);
  if (remaining <= 0 || signedDistance === 0) {
    return 0;
  }

  const distance = Math.sign(signedDistance) * Math.min(remaining, Math.abs(signedDistance));
  placement.x += placement.slideTangent.x * distance;
  placement.y += placement.slideTangent.y * distance;
  placement.tangentSlide += distance;
  return Math.abs(distance);
}

export function getVenuePlacementCorners(placement: VenuePresentationPlacement): MapPoint[] {
  const halfWidth = placement.width / 2;
  const halfHeight = placement.height / 2;
  return [
    placementLocalToWorld(placement, -halfWidth, -halfHeight),
    placementLocalToWorld(placement, halfWidth, -halfHeight),
    placementLocalToWorld(placement, halfWidth, halfHeight),
    placementLocalToWorld(placement, -halfWidth, halfHeight)
  ];
}

export function venuePlacementsOverlap(a: VenuePresentationPlacement, b: VenuePresentationPlacement): boolean {
  return getOrientedOverlap(a, b).overlaps;
}

function getOrientedOverlap(
  a: VenuePresentationPlacement,
  b: VenuePresentationPlacement
): { overlaps: boolean; depth: number; axis: MapPoint } {
  const aCorners = getVenuePlacementCorners(a);
  const bCorners = getVenuePlacementCorners(b);
  const axes = [a.tangent, a.outwardNormal, b.tangent, b.outwardNormal];
  let bestDepth = Number.POSITIVE_INFINITY;
  let bestAxis = axes[0];
  let bestCost = Number.POSITIVE_INFINITY;

  for (const axis of axes) {
    const aProjection = projectPolygon(aCorners, axis);
    const bProjection = projectPolygon(bCorners, axis);
    const depth = Math.min(aProjection.max, bProjection.max) - Math.max(aProjection.min, bProjection.min);
    if (depth <= 0) {
      return { overlaps: false, depth: 0, axis };
    }

    const movementPower =
      (a.snappedToRoad ? Math.abs(dot(a.tangent, axis)) : 0) +
      (b.snappedToRoad ? Math.abs(dot(b.tangent, axis)) : 0);
    const cost = depth / Math.max(0.12, movementPower);
    if (cost < bestCost) {
      bestCost = cost;
      bestDepth = depth;
      bestAxis = axis;
    }
  }

  return { overlaps: true, depth: bestDepth, axis: bestAxis };
}

function placementLocalToWorld(placement: VenuePresentationPlacement, localX: number, localY: number): MapPoint {
  return {
    x: placement.x + placement.tangent.x * localX + placement.outwardNormal.x * localY,
    y: placement.y + placement.tangent.y * localX + placement.outwardNormal.y * localY
  };
}

function projectPolygon(points: MapPoint[], axis: MapPoint): { min: number; max: number } {
  let min = dot(points[0], axis);
  let max = min;
  for (const point of points.slice(1)) {
    const projected = dot(point, axis);
    min = Math.min(min, projected);
    max = Math.max(max, projected);
  }
  return { min, max };
}

interface NearestRoadSegment {
  roadId: string;
  roadName: string;
  roadWidth: number;
  roadImportance: RoadPathDefinition["importance"];
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
    roadImportance: road.importance,
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
