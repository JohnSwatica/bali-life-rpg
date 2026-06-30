import { getGameplayStationLoop, type GameplayStationId } from "../../data/stationLoops";
import { getSocialGroup, isSocialGroupJoined } from "../groups/GroupRegistry";
import { getVenue } from "../venues/VenueRegistry";
import type { SocialGroupDefinition, WorldState } from "../../types";
import type { VenueActivityContext } from "./ActivityEngine";

export type StationSocialBridgeStatus = "join_here" | "go_to_home" | "joined";

export interface StationSocialBridgeOption {
  group: SocialGroupDefinition;
  stationId: GameplayStationId;
  status: StationSocialBridgeStatus;
  homeVenueId: string;
  homeVenueName: string;
  reason: string;
}

const STATION_SOCIAL_GROUP_IDS: Record<GameplayStationId, string[]> = {
  cafe: ["focus_table_collective", "brunch_builders_table"],
  beach: ["berawa_run_crew", "berawa_surf_circle"],
  beach_club: ["brunch_builders_table"],
  warung: [],
  coworking: ["focus_table_collective"],
  home: []
};

export function getStationSocialBridgeOptions(world: WorldState, context: VenueActivityContext): StationSocialBridgeOption[] {
  if (!context.stationId || (world.life.actProgress.currentAct < 2 && !world.life.hustle.moveOutReady)) {
    return [];
  }

  const station = getGameplayStationLoop(context.stationId);
  return STATION_SOCIAL_GROUP_IDS[context.stationId]
    .map((groupId) => {
      const group = getSocialGroup(groupId);
      if (!group?.homeVenueId) {
        return null;
      }
      const status = isSocialGroupJoined(world, group.id)
        ? "joined"
        : group.homeVenueId === context.venueId
          ? "join_here"
          : "go_to_home";
      return {
        group,
        stationId: context.stationId!,
        status,
        homeVenueId: group.homeVenueId,
        homeVenueName: formatVenueName(group.homeVenueId),
        reason: `${station.title} can lead into ${group.name}.`
      } satisfies StationSocialBridgeOption;
    })
    .filter((option): option is StationSocialBridgeOption => Boolean(option));
}

function formatVenueName(venueId: string): string {
  return getVenue(venueId)?.name ?? venueId.replace(/_/g, " ");
}
