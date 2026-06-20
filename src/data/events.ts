import type { GameEvent } from "../types";

export const gameEventDefinitions: GameEvent[] = [
  {
    id: "surf_morning_berawa",
    title: "Berawa Surf Morning",
    type: "surf_morning",
    venueId: "berawa_beach",
    startsAt: 6 * 60,
    endsAt: 8 * 60 + 30,
    mode: "single",
    requiresMultiplayer: false,
    reward: { reputationTag: "explorer", itemIds: ["surf_sticker"] }
  },
  {
    id: "satu_satu_cafe_rush",
    title: "Satu-Satu Cafe Rush",
    type: "cafe_rush",
    venueId: "satu_satu_coffee",
    startsAt: 8 * 60,
    endsAt: 11 * 60,
    mode: "single",
    requiresMultiplayer: false,
    reward: { reputationTag: "venue_regular", itemIds: ["kopi_bali"] }
  },
  {
    id: "milk_madu_brunch_hour",
    title: "Milk & Madu Brunch Hour",
    type: "brunch_hour",
    venueId: "milk_madu_berawa",
    startsAt: 10 * 60 + 30,
    endsAt: 13 * 60,
    mode: "single",
    requiresMultiplayer: false,
    reward: { reputationTag: "social", itemIds: ["brunch_slice"] }
  },
  {
    id: "canggu_station_market_walk",
    title: "Canggu Station Market Walk",
    type: "market_walk",
    venueId: "canggu_station",
    startsAt: 15 * 60,
    endsAt: 17 * 60,
    mode: "single",
    requiresMultiplayer: false,
    reward: { reputationTag: "helpful", itemIds: ["pantry_bag"] }
  },
  {
    id: "berawa_crew_meetup_locked",
    title: "Berawa Crew Meetup",
    type: "crew_meetup",
    venueId: "finns_recreation_club",
    startsAt: 18 * 60,
    endsAt: 20 * 60,
    mode: "multi",
    requiresMultiplayer: true,
    reward: { reputationTag: "reliable" }
  }
];
