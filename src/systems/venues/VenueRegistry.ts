import { venueDefinitions } from "../../data/venues";
import type { MapDiscoveryState, Venue } from "../../types";

export function getVenue(venueId: string): Venue | undefined {
  return venueDefinitions[venueId];
}

export function getAllVenues(): Venue[] {
  return Object.values(venueDefinitions);
}

export function getVenueForShop(shopId: string): Venue | undefined {
  return venueDefinitions[shopId];
}

export function meetsPriorityVenueThreshold(venue: Venue): boolean {
  return (venue.rating ?? 0) >= 4.5 && (venue.reviewCount ?? 0) >= 300;
}

export function isVenueVisibleOnMap(venue: Venue, discovery?: MapDiscoveryState): boolean {
  if (venue.mapVisibility === "always_visible" || venue.mapVisibility === "road_visible") {
    return true;
  }
  if (!discovery) {
    return false;
  }
  return discovery.revealAll || discovery.discoveredVenueIds.includes(venue.id);
}

export function getVisibleVenues(discovery?: MapDiscoveryState): Venue[] {
  return getAllVenues().filter((venue) => isVenueVisibleOnMap(venue, discovery));
}

export function getPriorityVenueCandidates(): Venue[] {
  return getAllVenues().filter((venue) => venue.isPriorityVenue || meetsPriorityVenueThreshold(venue));
}
