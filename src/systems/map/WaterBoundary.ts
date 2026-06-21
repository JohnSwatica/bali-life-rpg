import { scaleDistance } from "./WorldScale";

export interface MapPoint {
  x: number;
  y: number;
}

export interface MapFeatureLike {
  kind: "beach" | "coastline" | "water";
  closed: boolean;
  points: MapPoint[];
}

export interface WaterBoundaryGuard {
  seaPolygon: MapPoint[];
  coastline: MapPoint[];
  beachPolygons: MapPoint[][];
  waterPolygons: MapPoint[][];
}

export interface WaterBoundaryResolution {
  reason: "sea" | "water";
  x: number;
  y: number;
}

interface WorldSize {
  width: number;
  height: number;
}

const DEFAULT_EDGE_BUFFER = scaleDistance(30);

export function createWaterBoundaryGuard(features: MapFeatureLike[], world: WorldSize): WaterBoundaryGuard {
  const coastline = features
    .filter((feature) => feature.kind === "coastline")
    .flatMap((feature) => feature.points)
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const seaPolygon =
    coastline.length > 1
      ? [
          ...coastline,
          { x: 0, y: world.height },
          { x: 0, y: coastline[0].y }
        ]
      : [];

  return {
    seaPolygon,
    coastline,
    beachPolygons: features
      .filter((feature) => feature.kind === "beach" && feature.closed && feature.points.length >= 3)
      .map((feature) => feature.points),
    waterPolygons: features
      .filter((feature) => feature.kind === "water" && feature.closed && feature.points.length >= 3)
      .map((feature) => feature.points)
  };
}

export function resolveWaterBoundaryPosition(
  guard: WaterBoundaryGuard,
  point: MapPoint,
  edgeBuffer = DEFAULT_EDGE_BUFFER
): WaterBoundaryResolution | null {
  if (isPointInAnyPolygon(point, guard.beachPolygons)) {
    return null;
  }

  if (guard.seaPolygon.length >= 3 && isPointInPolygon(point, guard.seaPolygon)) {
    const corrected = pushAcrossNearestEdge(point, guard.coastline, "toward-line", edgeBuffer, false);
    return { reason: "sea", ...corrected };
  }

  for (const polygon of guard.waterPolygons) {
    if (isPointInPolygon(point, polygon)) {
      const corrected = pushAcrossNearestEdge(point, polygon, "away-from-point", edgeBuffer, true);
      return { reason: "water", ...corrected };
    }
  }

  return null;
}

function isPointInAnyPolygon(point: MapPoint, polygons: MapPoint[][]): boolean {
  return polygons.some((polygon) => isPointInPolygon(point, polygon));
}

function isPointInPolygon(point: MapPoint, polygon: MapPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    const crosses =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / ((b.y - a.y) || Number.EPSILON) + a.x;
    if (crosses) {
      inside = !inside;
    }
  }
  return inside;
}

function pushAcrossNearestEdge(
  point: MapPoint,
  boundary: MapPoint[],
  mode: "toward-line" | "away-from-point",
  edgeBuffer: number,
  closed: boolean
): MapPoint {
  const nearest = getNearestBoundaryPoint(point, boundary, closed);
  if (!nearest) {
    return point;
  }

  const dx = nearest.x - point.x;
  const dy = nearest.y - point.y;
  const distance = Math.hypot(dx, dy) || 1;
  const direction =
    mode === "toward-line"
      ? { x: dx / distance, y: dy / distance }
      : { x: -dx / distance, y: -dy / distance };

  return {
    x: Math.round(nearest.x + direction.x * edgeBuffer),
    y: Math.round(nearest.y + direction.y * edgeBuffer)
  };
}

function getNearestBoundaryPoint(point: MapPoint, boundary: MapPoint[], closed: boolean): MapPoint | null {
  if (boundary.length === 0) {
    return null;
  }

  let nearest = boundary[0];
  let nearestDistance = Number.POSITIVE_INFINITY;
  const segmentCount = closed ? boundary.length : boundary.length - 1;

  for (let i = 0; i < segmentCount; i += 1) {
    const start = boundary[i];
    const end = boundary[(i + 1) % boundary.length];
    const candidate = closestPointOnSegment(point, start, end);
    const distance = squaredDistance(point, candidate);
    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }

  return nearest;
}

function closestPointOnSegment(point: MapPoint, start: MapPoint, end: MapPoint): MapPoint {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return start;
  }

  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return {
    x: start.x + dx * t,
    y: start.y + dy * t
  };
}

function squaredDistance(a: MapPoint, b: MapPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}
