import { interiorDefinitions } from "../../data/interiors";
import { npcDefinitions } from "../../data/npcs";
import { getDeliveryDefinition } from "../../data/deliveries";
import { getActiveNpcRoute } from "../npcs/NpcRoutineRoutes";
import { getVenueActivityContext, type VenueActivityContext } from "../life/ActivityEngine";
import { isMadeRoomOfferPending } from "../story/Act1MadeRoomOffer";
import { canMadeAcceptFinale, canStartIbuGuaranteeScene } from "../story/Act1Finale";
import { getActiveEventsAtVenue } from "../events/EventScheduler";
import {
  isKadekAtKitchenCircleSession,
  isKitchenCircleDeflectionPending,
  isKitchenCircleInvitationPending,
  isKitchenCircleSessionEvent
} from "../story/Act2KitchenCircle";
import type { FieldObjectiveTargetRef } from "../guidance/FieldObjective";
import { scaleDistance } from "../map/WorldScale";
import type { InteriorDefinition, InteriorNpcSlotDefinition, InteriorStationDefinition, WorldState } from "../../types";

export const INTERIOR_NPC_INTERACTION_RADIUS = scaleDistance(40);

export interface ScheduledInteriorNpcSlot {
  interior: InteriorDefinition;
  slot: InteriorNpcSlotDefinition;
}

export interface InteriorDeliveryPickupTarget {
  deliveryId: string;
  label: string;
}

export interface ResolvedInteriorObjectiveTarget {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  type: FieldObjectiveTargetRef["type"];
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
  const activeKitchenSession = interior.id === "warung_sari_interior"
    ? getActiveEventsAtVenue(world.clock, interior.venueId, world).find(isKitchenCircleSessionEvent)
    : undefined;
  if (
    npcId === "ibu_sari" &&
    interior.id === "warung_sari_interior" &&
    (isKitchenCircleInvitationPending(world) || isKitchenCircleDeflectionPending(world) || Boolean(activeKitchenSession))
  ) {
    return true;
  }
  if (
    npcId === "kadek" &&
    interior.id === "warung_sari_interior" &&
    activeKitchenSession &&
    isKadekAtKitchenCircleSession(world.clock.day)
  ) {
    return true;
  }
  if (npcId === "ibu_sari" && interior.id === "warung_sari_interior" && canStartIbuGuaranteeScene(world)) {
    return true;
  }
  if (npcId === "made" && interior.id === "bungalow_living_interior" && canMadeAcceptFinale(world)) {
    return true;
  }
  if (npcId === "made" && interior.venueId === "bungalow_living" && isMadeRoomOfferPending(world)) {
    return true;
  }
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

export function getPrimaryInteriorStationForVenue(
  interior: InteriorDefinition,
  venueId: string
): InteriorStationDefinition | undefined {
  if (interior.venueId !== venueId) {
    return undefined;
  }
  return interior.stations.find((station) => station.activityVenueId === venueId) ?? interior.stations[0];
}

export function resolveInteriorObjectiveTargets(
  world: WorldState,
  interior: InteriorDefinition,
  targets: FieldObjectiveTargetRef[]
): ResolvedInteriorObjectiveTarget[] {
  const roomTargets = targets.flatMap((target): ResolvedInteriorObjectiveTarget[] => {
    if (target.type === "npc") {
      const slot = getOccupiedInteriorNpcSlots(world, interior).find((candidate) => candidate.npcId === target.npcId);
      return slot
        ? [
            {
              id: target.id,
              label: target.label,
              x: slot.x,
              y: slot.y,
              radius: INTERIOR_NPC_INTERACTION_RADIUS,
              type: target.type
            }
          ]
        : [];
    }
    if (target.type === "venue") {
      const station = getPrimaryInteriorStationForVenue(interior, target.venueId);
      return station
        ? [{ id: target.id, label: target.label, x: station.x, y: station.y, radius: station.radius, type: target.type }]
        : [];
    }
    if (target.type === "home") {
      const station = getPrimaryInteriorStationForVenue(interior, target.id);
      return station
        ? [{ id: target.id, label: target.label, x: station.x, y: station.y, radius: station.radius, type: target.type }]
        : [];
    }
    return isInteriorPointInsideRoom(interior, target)
      ? [{ id: target.id, label: target.label, x: target.x, y: target.y, radius: target.radius, type: target.type }]
      : [];
  });

  if (roomTargets.length > 0 || targets.length === 0) {
    return roomTargets;
  }

  return [
    {
      id: `interior_exit:${interior.id}`,
      label: `Leave ${interior.name}`,
      x: interior.exitMat.x,
      y: interior.exitMat.y,
      radius: interior.exitMat.radius,
      type: "point"
    }
  ];
}

export function getInteriorDeliveryPickupForStation(
  world: WorldState,
  station: InteriorStationDefinition
): InteriorDeliveryPickupTarget | undefined {
  const active = world.life.hustle.activeDelivery;
  if (!active) {
    return undefined;
  }
  const delivery = getDeliveryDefinition(active.deliveryId);
  const venueId = active.stage === "accepted" ? delivery?.pickupVenueId : delivery?.dropoffVenueId;
  if (!delivery || venueId !== station.activityVenueId) {
    return undefined;
  }
  return {
    deliveryId: active.deliveryId,
    label: active.stage === "accepted" ? delivery.pickupLabel : delivery.dropoffLabel
  };
}
