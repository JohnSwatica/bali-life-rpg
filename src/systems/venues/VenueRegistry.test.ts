import { describe, expect, it } from "vitest";
import type { Venue } from "../../types";
import {
  getPriorityVenueCandidates,
  getVenue,
  getVenueForShop,
  getVisibleVenues,
  isVenueVisibleOnMap,
  meetsPriorityVenueThreshold
} from "./VenueRegistry";

describe("VenueRegistry", () => {
  it("resolves venues and shop-backed venues by id", () => {
    expect(getVenue("canggu_station")?.name).toBe("Canggu Station");
    expect(getVenueForShop("baked_berawa")?.name).toBe("BAKED. Berawa");
    expect(getVenue("missing-venue")).toBeUndefined();
  });

  it("respects discovery state for map visibility", () => {
    const cangguStation = getVenue("canggu_station");
    const beach = getVenue("berawa_beach");
    expect(cangguStation).toBeDefined();
    expect(beach).toBeDefined();

    expect(isVenueVisibleOnMap(cangguStation as Venue)).toBe(false);
    expect(isVenueVisibleOnMap(beach as Venue)).toBe(true);
    expect(
      isVenueVisibleOnMap(cangguStation as Venue, {
        discoveredAreaIds: [],
        discoveredVenueIds: ["canggu_station"],
        revealAll: false
      })
    ).toBe(true);
    expect(
      isVenueVisibleOnMap(cangguStation as Venue, {
        discoveredAreaIds: [],
        discoveredVenueIds: [],
        revealAll: true
      })
    ).toBe(true);
  });

  it("filters visible venues without exposing undiscovered hidden venues", () => {
    const visibleWithoutDiscovery = getVisibleVenues().map((venue) => venue.id);
    expect(visibleWithoutDiscovery).toContain("berawa_beach");
    expect(visibleWithoutDiscovery).not.toContain("canggu_station");

    const visibleAfterDiscovery = getVisibleVenues({
      discoveredAreaIds: [],
      discoveredVenueIds: ["canggu_station"],
      revealAll: false
    }).map((venue) => venue.id);
    expect(visibleAfterDiscovery).toContain("canggu_station");
  });

  it("encodes the priority venue threshold without claiming live rating data", () => {
    const baseVenue = getVenue("milk_madu_berawa") as Venue;
    const thresholdMatch = { ...baseVenue, rating: 4.5, reviewCount: 300 };
    const belowRating = { ...baseVenue, rating: 4.4, reviewCount: 1000 };
    const belowReviews = { ...baseVenue, rating: 4.9, reviewCount: 299 };

    expect(meetsPriorityVenueThreshold(thresholdMatch)).toBe(true);
    expect(meetsPriorityVenueThreshold(belowRating)).toBe(false);
    expect(meetsPriorityVenueThreshold(belowReviews)).toBe(false);
    expect(getPriorityVenueCandidates().every((venue) => venue.isPriorityVenue || meetsPriorityVenueThreshold(venue))).toBe(true);
  });
});
