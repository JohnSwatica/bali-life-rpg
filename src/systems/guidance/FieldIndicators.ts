import { getActiveEvents, getUpcomingEvents } from "../events/EventScheduler";
import { getOpportunityTemplate } from "../opportunities/OpportunityEngine";
import { getRelationshipArcStates } from "../relationships/RelationshipArcs";
import { resolveWorldSceneVenueAnchor } from "../world/WorldScenes";
import type { WorldState } from "../../types";

export interface NpcFieldIndicator {
  type: "relationship";
  npcId: string;
  label: string;
}

export interface VenueFieldIndicator {
  type: "opportunity" | "event";
  venueId: string;
  label: string;
  id: string;
}

export interface FieldIndicators {
  npcs: NpcFieldIndicator[];
  venues: VenueFieldIndicator[];
}

export function getFieldIndicators(world: WorldState): FieldIndicators {
  return {
    npcs: getNpcFieldIndicators(world),
    venues: getVenueFieldIndicators(world)
  };
}

export function getNpcFieldIndicators(world: WorldState): NpcFieldIndicator[] {
  const seenNpcIds = new Set<string>();
  const indicators: NpcFieldIndicator[] = [];
  for (const state of getRelationshipArcStates(world)) {
    if (!state.available || seenNpcIds.has(state.arc.npcId)) {
      continue;
    }
    seenNpcIds.add(state.arc.npcId);
    indicators.push({
      type: "relationship",
      npcId: state.arc.npcId,
      label: state.beat.title
    });
  }
  return indicators;
}

export function getVenueFieldIndicators(world: WorldState): VenueFieldIndicator[] {
  const indicators: VenueFieldIndicator[] = [];

  for (const opportunity of world.opportunities.live) {
    if (opportunity.status !== "live" && opportunity.status !== "accepted") {
      continue;
    }
    const template = getOpportunityTemplate(opportunity.templateId);
    if (!resolveWorldSceneVenueAnchor(opportunity.locationVenueId)) {
      continue;
    }
    indicators.push({
      type: "opportunity",
      venueId: opportunity.locationVenueId,
      label: template?.title ?? "Opportunity",
      id: opportunity.id
    });
  }

  const eventWindow = [...getActiveEvents(world.clock, world), ...getUpcomingEvents(world.clock, world, 90)];
  const seenEventIds = new Set<string>();
  for (const event of eventWindow) {
    if (seenEventIds.has(event.id)) {
      continue;
    }
    if (!resolveWorldSceneVenueAnchor(event.locationVenueId)) {
      continue;
    }
    seenEventIds.add(event.id);
    indicators.push({
      type: "event",
      venueId: event.locationVenueId,
      label: event.title,
      id: event.id
    });
  }

  return indicators;
}
