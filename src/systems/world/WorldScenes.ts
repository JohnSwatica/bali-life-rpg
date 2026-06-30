import { npcDefinitions } from "../../data/npcs";
import { getOpportunityTemplate } from "../opportunities/OpportunityEngine";
import type { OpportunityType, WorldState } from "../../types";

export type OpportunityWorldSceneKind =
  | "gig_help_wanted"
  | "social_gathering"
  | "help_distress"
  | "deal_signal"
  | "rumor_whisper"
  | "trade_swap";

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

const FALLBACK_NPCS = ["ari", "made", "kadek", "ibu_sari"];

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
        venueId: template.locationVenueId,
        title: template.title,
        opportunityType: template.type,
        sceneKind: opportunitySceneKind(template.type),
        cue: opportunitySceneCue(template.type, live.status === "accepted"),
        accepted: live.status === "accepted",
        actors: opportunitySceneActors(template.type, template.reward.affinityBumps?.map((bump) => bump.npcId) ?? [])
      };
    })
    .filter((scene): scene is OpportunityWorldScene => Boolean(scene));
}

function opportunitySceneKind(type: OpportunityType): OpportunityWorldSceneKind {
  if (type === "gig") return "gig_help_wanted";
  if (type === "social") return "social_gathering";
  if (type === "help_out") return "help_distress";
  if (type === "flash_deal") return "deal_signal";
  if (type === "rumor") return "rumor_whisper";
  return "trade_swap";
}

function opportunitySceneCue(type: OpportunityType, accepted: boolean): string {
  if (accepted) return "TRACKED";
  if (type === "gig") return "HELP";
  if (type === "social") return "GATHER";
  if (type === "help_out") return "HELP?";
  if (type === "flash_deal") return "DEAL";
  if (type === "rumor") return "TIP";
  return "SWAP";
}

function opportunitySceneActors(type: OpportunityType, preferredNpcIds: string[]): WorldSceneActor[] {
  if (type === "flash_deal") {
    return [];
  }
  if (type === "social") {
    return buildActors(uniqueNpcIds([...preferredNpcIds, ...fallbackNpcIds()]), "gathering", 3);
  }
  if (type === "help_out") {
    return buildActors(uniqueNpcIds([...preferredNpcIds, "ibu_sari", ...fallbackNpcIds()]), "distressed", 1);
  }
  if (type === "gig") {
    return buildActors(uniqueNpcIds([...preferredNpcIds, "made", ...fallbackNpcIds()]), "waving", 1);
  }
  return buildActors(uniqueNpcIds([...preferredNpcIds, ...fallbackNpcIds()]), type === "trade" ? "social" : "gathering", 2);
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
