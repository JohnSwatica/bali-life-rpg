import { interiorDefinitions } from "../../data/interiors";
import type { InteriorDefinition } from "../../types";

export function getInteriorByVenueId(
  venueId: string,
  definitions: Record<string, InteriorDefinition> = interiorDefinitions
): InteriorDefinition | undefined {
  return Object.values(definitions).find((interior) => interior.venueId === venueId);
}

export function isInteriorPointInsideRoom(interior: InteriorDefinition, point: { x: number; y: number }, margin = 0): boolean {
  return (
    point.x >= interior.origin.x + margin &&
    point.x <= interior.origin.x + interior.width - margin &&
    point.y >= interior.origin.y + margin &&
    point.y <= interior.origin.y + interior.height - margin
  );
}
