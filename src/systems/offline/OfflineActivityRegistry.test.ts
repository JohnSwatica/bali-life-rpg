import { describe, expect, it } from "vitest";
import { getOfflineActivities, getOfflineActivitiesForVenue } from "./OfflineActivityRegistry";

describe("OfflineActivityRegistry", () => {
  it("exposes only honestly simulated offline activity placeholders", () => {
    const activities = getOfflineActivities();

    expect(activities.length).toBeGreaterThan(0);
    expect(activities.every((activity) => activity.status === "simulated")).toBe(true);
    expect(activities.some((activity) => activity.requiresMultiplayer)).toBe(true);
  });

  it("filters activities by venue", () => {
    const beachActivities = getOfflineActivitiesForVenue("berawa_beach");

    expect(beachActivities.map((activity) => activity.activityId)).toEqual(["berawa_cleanup_preview"]);
    expect(getOfflineActivitiesForVenue("missing-venue")).toEqual([]);
  });
});
