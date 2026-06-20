import type { OfflineActivity } from "../types";

export const offlineActivityDefinitions: OfflineActivity[] = [
  {
    activityId: "berawa_cleanup_preview",
    venueId: "berawa_beach",
    activityType: "neighborhood_ritual",
    onlinePreview: "Simulated preview: join a Berawa beach cleanup route and learn where real check-ins could fit later.",
    offlineCheckInRequired: true,
    reward: { reputationTag: "community_contributor", itemIds: ["cleanup_bag"] },
    socialCapacity: 12,
    startsAt: 7 * 60,
    endsAt: 9 * 60,
    requiresMultiplayer: false,
    futureCouponEligible: false,
    status: "simulated"
  },
  {
    activityId: "finns_crew_route_preview",
    venueId: "finns_recreation_club",
    activityType: "crew_mission",
    onlinePreview: "Simulated preview: a group route that will eventually connect players to real interest crews.",
    offlineCheckInRequired: true,
    reward: { reputationTag: "reliable" },
    socialCapacity: 6,
    startsAt: 17 * 60,
    endsAt: 19 * 60,
    requiresMultiplayer: true,
    futureCouponEligible: false,
    status: "simulated"
  },
  {
    activityId: "berawa_stamp_walk_preview",
    venueId: "canggu_station",
    activityType: "stamp_walk",
    onlinePreview: "Simulated preview: collect neighborhood stamps across grocery, cafe, and beach nodes.",
    offlineCheckInRequired: true,
    reward: { reputationTag: "explorer", itemIds: ["pantry_bag"] },
    socialCapacity: null,
    startsAt: null,
    endsAt: null,
    requiresMultiplayer: false,
    futureCouponEligible: true,
    status: "simulated"
  }
];
