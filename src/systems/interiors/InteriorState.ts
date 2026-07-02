import { interiorDefinitions } from "../../data/interiors";
import { npcDefinitions } from "../../data/npcs";
import { getDeliveryDefinition } from "../../data/deliveries";
import { getActiveNpcRoute } from "../npcs/NpcRoutineRoutes";
import { getVenueActivityContext, type VenueActivityContext } from "../life/ActivityEngine";
import type { InteriorDefinition, InteriorNpcSlotDefinition, InteriorStationDefinition, WorldState } from "../../types";

export interface ScheduledInteriorNpcSlot {
  interior: InteriorDefinition;
  slot: InteriorNpcSlotDefinition;
}

export interface InteriorDeliveryPickupTarget {
  deliveryId: string;
  label: string;
}

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

export function getScheduledInteriorForNpc(
  world: WorldState,
  npcId: string,
  definitions: Record<string, InteriorDefinition> = interiorDefinitions
): ScheduledInteriorNpcSlot | undefined {
  for (const interior of Object.values(definitions)) {
    const slot = interior.npcSlots.find((candidate) => candidate.npcId === npcId);
    if (slot && isNpcScheduledForInterior(world, interior, npcId)) {
      return { interior, slot };
    }
  }
  return undefined;
}

export function getInteriorStationActivityContext(station: InteriorStationDefinition): VenueActivityContext | undefined {
  return getVenueActivityContext(station.activityVenueId) ?? undefined;
}

export function getInteriorDeliveryPickupForStation(
  world: WorldState,
  station: InteriorStationDefinition
): InteriorDeliveryPickupTarget | undefined {
  const active = world.life.hustle.activeDelivery;
  if (!active || active.stage !== "accepted") {
    return undefined;
  }
  const delivery = getDeliveryDefinition(active.deliveryId);
  if (!delivery || delivery.pickupVenueId !== station.activityVenueId) {
    return undefined;
  }
  return {
    deliveryId: active.deliveryId,
    label: delivery.pickupLabel
  };
}
