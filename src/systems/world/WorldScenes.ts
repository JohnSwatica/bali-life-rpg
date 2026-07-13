import { activeStreetTemplate, venueMapNodes } from "../../data/authoredStreetLayout";
import { npcDefinitions } from "../../data/npcs";
import { socialGroupDefinitions } from "../../data/groups";
import { getActiveEvents } from "../events/EventScheduler";
import { getOpportunityTemplate } from "../opportunities/OpportunityEngine";
import { getRioRaceEligibility, RIO_RACE } from "../ride/RivalRace";
import { isAct1LeoEncounterPending } from "../story/Act1IncitingHook";
import type { GameEvent, OpportunityType, WorldState } from "../../types";

export type OpportunityWorldSceneKind =
  | "gig_help_wanted"
  | "shady_package"
  | "social_gathering"
  | "help_distress"
  | "deal_signal"
  | "rumor_whisper"
  | "trade_swap"
  | "race_challenge";

export type EventWorldSceneKind = "run_gathering" | "work_table" | "market_walk" | "party_pulse" | "club_circle";

export interface WorldSceneActor {
  id: string;
  npcId?: string;
  spriteKey: string;
  role: "waving" | "gathering" | "distressed" | "working" | "social";
  offsetX: number;
  offsetY: number;
  approachOffsetX: number;
  approachOffsetY: number;
}

export interface OpportunityWorldScene {
  source: "opportunity";
  id: string;
  opportunityId: string;
  templateId: string;
  venueId: string;
  title: string;
  opportunityType: OpportunityType;
  sceneKind: OpportunityWorldSceneKind;
  cue: string;
  accepted: boolean;
  actors: WorldSceneActor[];
}

export interface EventWorldScene {
  source: "event";
  id: string;
  eventId: string;
  venueId: string;
  title: string;
  sceneKind: EventWorldSceneKind;
  cue: string;
  clubId?: string;
  actors: WorldSceneActor[];
}

export type WorldScene = OpportunityWorldScene | EventWorldScene;

const FALLBACK_NPCS = ["ari", "made", "kadek", "ibu_sari"];
const AUTHORED_WORLD_SCENE_VENUE_IDS = new Set(
  activeStreetTemplate.slots.map((slot) => slot.venueId).filter((venueId): venueId is string => Boolean(venueId))
);

export function resolveWorldSceneVenueAnchor(venueId: string) {
  if (!AUTHORED_WORLD_SCENE_VENUE_IDS.has(venueId)) {
    return undefined;
  }
  return venueMapNodes.find((node) => node.venueId === venueId);
}

export function getOpportunityWorldScenes(world: WorldState): OpportunityWorldScene[] {
  return world.opportunities.live
    .filter((live) => live.status === "live" || live.status === "accepted")
    .map((live) => {
      const template = getOpportunityTemplate(live.templateId);
      if (!template) {
        return null;
      }
      return {
        source: "opportunity" as const,
        id: `opportunity:${live.id}`,
        opportunityId: live.id,
        templateId: template.id,
        venueId: live.locationVenueId,
        title: template.title,
        opportunityType: template.type,
        sceneKind: opportunitySceneKind(template),
        cue: opportunitySceneCue(template, live.status === "accepted"),
        accepted: live.status === "accepted",
        actors: opportunitySceneActors(template, template.reward.affinityBumps?.map((bump) => bump.npcId) ?? [])
      };
    })
    .filter((scene): scene is OpportunityWorldScene => Boolean(scene && resolveWorldSceneVenueAnchor(scene.venueId)));
}

export function getEventWorldScenes(world: WorldState): EventWorldScene[] {
  return getActiveEvents(world.clock, world)
    .map((event) => {
      const clubId = event.host.type === "group" ? event.host.id : undefined;
      const group = clubId ? socialGroupDefinitions.find((candidate) => candidate.id === clubId) : undefined;
      const npcIds = uniqueNpcIds([...(event.participation.meetNpcs ?? []), ...(group?.memberIds ?? [])]);
      return {
        source: "event" as const,
        id: `event:${event.id}`,
        eventId: event.id,
        venueId: event.locationVenueId,
        title: event.title,
        sceneKind: eventSceneKind(event),
        cue: eventSceneCue(event, Boolean(group)),
        clubId,
        actors: buildActors(npcIds.length ? npcIds : fallbackNpcIds(), group ? "social" : eventActorRole(event), 3)
      };
    })
    .filter((scene) => Boolean(resolveWorldSceneVenueAnchor(scene.venueId)));
}

export function getRivalRaceWorldScenes(world: WorldState): OpportunityWorldScene[] {
  if (isAct1LeoEncounterPending(world) || !getRioRaceEligibility(world).eligible || !resolveWorldSceneVenueAnchor(RIO_RACE.venueId)) {
    return [];
  }
  return [
    {
      source: "opportunity",
      id: `race:${RIO_RACE.id}`,
      opportunityId: RIO_RACE.id,
      templateId: RIO_RACE.id,
      venueId: RIO_RACE.venueId,
      title: RIO_RACE.title,
      opportunityType: "gig",
      sceneKind: "race_challenge",
      cue: "RACE",
      accepted: false,
      actors: [
        {
          id: "rio-race-challenge",
          npcId: "rio",
          spriteKey: npcDefinitions.rio?.spriteKey ?? "npc-rio",
          role: "waving",
          offsetX: -18,
          offsetY: 0,
          approachOffsetX: -54,
          approachOffsetY: -68
        }
      ]
    }
  ];
}

export function getAct1IncitingHookWorldScenes(world: WorldState): OpportunityWorldScene[] {
  if (!isAct1LeoEncounterPending(world) || !resolveWorldSceneVenueAnchor(RIO_RACE.venueId)) {
    return [];
  }
  return [
    {
      source: "opportunity",
      id: "story:act1:leo-rate-cut",
      opportunityId: "rio_act1_rate_cut_encounter",
      templateId: "rio_act1_rate_cut_encounter",
      venueId: RIO_RACE.venueId,
      title: "Leo at the pickup rail",
      opportunityType: "gig",
      sceneKind: "race_challenge",
      cue: "LEO",
      accepted: false,
      actors: [
        {
          id: "rio-act1-rate-cut",
          npcId: "rio",
          spriteKey: npcDefinitions.rio?.spriteKey ?? "npc-rio",
          role: "waving",
          offsetX: -18,
          offsetY: 0,
          approachOffsetX: -54,
          approachOffsetY: -68
        }
      ]
    }
  ];
}

export function getVisibleWorldScenes(world: WorldState): WorldScene[] {
  return [...getOpportunityWorldScenes(world), ...getRivalRaceWorldScenes(world), ...getEventWorldScenes(world)];
}

export interface FieldFirstDiscoveryAudit {
  liveOpportunityCount: number;
  opportunitySceneCount: number;
  activeEventCount: number;
  eventSceneCount: number;
  phoneOnlyDiscoveryCount: number;
}

export function getFieldFirstDiscoveryAudit(world: WorldState): FieldFirstDiscoveryAudit {
  const liveOpportunityCount = world.opportunities.live.filter((live) => live.status === "live" || live.status === "accepted").length;
  const opportunitySceneCount = getOpportunityWorldScenes(world).length;
  const activeEventCount = getActiveEvents(world.clock, world).length;
  const eventSceneCount = getEventWorldScenes(world).length;
  const raceSceneCount = getRivalRaceWorldScenes(world).length;
  return {
    liveOpportunityCount,
    opportunitySceneCount: opportunitySceneCount + raceSceneCount,
    activeEventCount,
    eventSceneCount,
    phoneOnlyDiscoveryCount: Math.max(0, liveOpportunityCount - opportunitySceneCount) + Math.max(0, activeEventCount - eventSceneCount)
  };
}

function opportunitySceneKind(template: { id: string; type: OpportunityType }): OpportunityWorldSceneKind {
  if (template.id === "no_questions_package") return "shady_package";
  if (template.type === "gig") return "gig_help_wanted";
  if (template.type === "social") return "social_gathering";
  if (template.type === "help_out") return "help_distress";
  if (template.type === "flash_deal") return "deal_signal";
  if (template.type === "rumor") return "rumor_whisper";
  return "trade_swap";
}

function opportunitySceneCue(template: { id: string; type: OpportunityType }, accepted: boolean): string {
  if (accepted) return "TRACKED";
  if (template.id === "no_questions_package") return "CHOICE";
  if (template.type === "gig") return "HELP";
  if (template.type === "social") return "GATHER";
  if (template.type === "help_out") return "HELP?";
  if (template.type === "flash_deal") return "DEAL";
  if (template.type === "rumor") return "RUMOR";
  return "SWAP";
}

function opportunitySceneActors(template: { id: string; type: OpportunityType }, preferredNpcIds: string[]): WorldSceneActor[] {
  if (template.type === "flash_deal") {
    return [];
  }
  if (template.id === "no_questions_package") {
    return buildActors(uniqueNpcIds(["rio", ...preferredNpcIds, ...fallbackNpcIds()]), "social", 1);
  }
  if (template.type === "social") {
    return buildActors(uniqueNpcIds([...preferredNpcIds, ...fallbackNpcIds()]), "gathering", 3);
  }
  if (template.type === "help_out") {
    return buildActors(uniqueNpcIds([...preferredNpcIds, "ibu_sari", ...fallbackNpcIds()]), "distressed", 1);
  }
  if (template.type === "gig") {
    return buildActors(uniqueNpcIds([...preferredNpcIds, "made", ...fallbackNpcIds()]), "waving", 1);
  }
  return buildActors(uniqueNpcIds([...preferredNpcIds, ...fallbackNpcIds()]), template.type === "trade" ? "social" : "gathering", 2);
}

function eventSceneKind(event: GameEvent): EventWorldSceneKind {
  if (event.host.type === "group") return "club_circle";
  if (event.type === "run") return "run_gathering";
  if (event.type === "coworking") return "work_table";
  if (event.type === "market") return "market_walk";
  if (event.type === "party" || event.type === "live_music") return "party_pulse";
  return "club_circle";
}

function eventSceneCue(event: GameEvent, isClub: boolean): string {
  if (isClub) return "CLUB";
  if (event.type === "run") return "RUN";
  if (event.type === "coworking") return "WORK";
  if (event.type === "market") return "MARKET";
  if (event.type === "party" || event.type === "live_music") return "LIVE";
  return "NOW";
}

function eventActorRole(event: GameEvent): WorldSceneActor["role"] {
  if (event.type === "coworking") return "working";
  if (event.type === "party" || event.type === "meetup") return "social";
  return "gathering";
}

function buildActors(npcIds: string[], role: WorldSceneActor["role"], limit: number): WorldSceneActor[] {
  return npcIds.slice(0, limit).map((npcId, index) => {
    const npc = npcDefinitions[npcId];
    const fallbackSprite = ["npc-ari", "npc-made", "npc-kadek", "npc-sari"][index % 4];
    const side = index - (Math.min(limit, npcIds.length) - 1) / 2;
    return {
      id: `${npcId}-${role}-${index}`,
      npcId: npc?.id,
      spriteKey: npc?.spriteKey ?? fallbackSprite,
      role,
      offsetX: side * 30,
      offsetY: index % 2 === 0 ? -16 : 10,
      approachOffsetX: side * 64 + (index % 2 === 0 ? -36 : 36),
      approachOffsetY: -66 - index * 12
    };
  });
}

function fallbackNpcIds(): string[] {
  return FALLBACK_NPCS.filter((npcId) => Boolean(npcDefinitions[npcId]));
}

function uniqueNpcIds(npcIds: string[]): string[] {
  return [...new Set(npcIds.filter((npcId) => Boolean(npcDefinitions[npcId])))];
}
