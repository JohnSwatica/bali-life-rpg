import { socialGroupDefinitions } from "../../data/groups";
import { recordRelationshipMemory } from "../relationships/RelationshipMemory";
import type { SocialGroupDefinition, WorldState } from "../../types";

export function getAllSocialGroups(): SocialGroupDefinition[] {
  return socialGroupDefinitions;
}

export function getSocialGroup(groupId: string): SocialGroupDefinition | undefined {
  return socialGroupDefinitions.find((group) => group.id === groupId);
}

export function getJoinedSocialGroups(world: WorldState): SocialGroupDefinition[] {
  const joined = new Set(world.life.joinedClubIds);
  return socialGroupDefinitions.filter((group) => joined.has(group.id));
}

export function getSocialGroupsForVenue(venueId: string): SocialGroupDefinition[] {
  return socialGroupDefinitions.filter((group) => group.homeVenueId === venueId);
}

export function isSocialGroupJoined(world: WorldState, groupId: string): boolean {
  return world.life.joinedClubIds.includes(groupId);
}

export function joinSocialGroup(world: WorldState, groupId: string, at: number): { ok: boolean; message: string } {
  const group = getSocialGroup(groupId);
  if (!group) {
    return { ok: false, message: "Club not found." };
  }
  if (isSocialGroupJoined(world, groupId)) {
    return { ok: true, message: `Already joined ${group.name}.` };
  }

  world.life.joinedClubIds.push(groupId);
  if (group.homeVenueId) {
    recordRelationshipMemory(world, "venue", group.homeVenueId, "visited", `Joined ${group.name}.`, at);
  }
  for (const npcId of group.memberIds) {
    recordRelationshipMemory(world, "npc", npcId, "visited", `Met through ${group.name}.`, at);
  }
  return { ok: true, message: `Joined ${group.name}. Recurring events added to your calendar.` };
}
