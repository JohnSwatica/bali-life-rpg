import { offlineActivityDefinitions } from "../../data/offlineActivities";
import type { OfflineActivity } from "../../types";

export function getOfflineActivities(): OfflineActivity[] {
  return offlineActivityDefinitions;
}

export function getOfflineActivitiesForVenue(venueId: string): OfflineActivity[] {
  return offlineActivityDefinitions.filter((activity) => activity.venueId === venueId);
}
