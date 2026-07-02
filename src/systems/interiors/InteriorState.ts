import { interiorDefinitions } from "../../data/interiors";
import { npcDefinitions } from "../../data/npcs";
import { getActiveNpcRoute } from "../npcs/NpcRoutineRoutes";
import { getVenueActivityContext, type VenueActivityContext } from "../life/ActivityEngine";
import type { InteriorDefinition, InteriorNpcSlotDefinition, InteriorStationDefinition, WorldState } from "../../types";

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

export function isNpcScheduledForInterior(world: WorldState, interior: InteriorDefinition, npcId: string): boolean {
  const npc = npcDefinitions[npcId];
  if (!npc) {
    return false;
  }
  const route = getActiveNpcRoute(npc, world.clock.minuteOfDay);
  return route.waypoints.some((waypoint) => waypoint.venueId === interior.venueId);
}

export function getOccupiedInteriorNpcSlots(world: WorldState, interior: InteriorDefinition): InteriorNpcSlotDefinition[] {
  return interior.npcSlots.filter((slot) => isNpcScheduledForInterior(world, interior, slot.npcId));
}

export function getInteriorStationActivityContext(station: InteriorStationDefinition): VenueActivityContext | undefined {
  return getVenueActivityContext(station.activityVenueId) ?? undefined;
}
