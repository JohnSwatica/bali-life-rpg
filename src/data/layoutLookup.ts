import { scaleDistance, scalePoint } from "../systems/map/WorldScale";
import { venueMapNodes } from "./scaledBerawaLayout";

export interface LayoutPoint {
  x: number;
  y: number;
}

export function getVenuePoint(venueId: string, fallback: LayoutPoint): LayoutPoint {
  const node = venueMapNodes.find((candidate) => candidate.venueId === venueId);
  return node ? { x: node.x, y: node.y } : scalePoint(fallback);
}

export function offsetVenuePoint(venueId: string, fallback: LayoutPoint, dx = 0, dy = 0): LayoutPoint {
  const point = getVenuePoint(venueId, fallback);
  return { x: point.x + scaleDistance(dx), y: point.y + scaleDistance(dy) };
}
