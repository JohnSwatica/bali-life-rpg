import type { OpenHours, Venue } from "../types";

const dailyDaytime: OpenHours = {
  mon: { open: 7, close: 22 },
  tue: { open: 7, close: 22 },
  wed: { open: 7, close: 22 },
  thu: { open: 7, close: 22 },
  fri: { open: 7, close: 23 },
  sat: { open: 7, close: 23 },
  sun: { open: 7, close: 22 }
};

const placeholderSeams = {
  promotion: { enabled: false as const },
  checkIn: { enabled: false as const },
  booking: { enabled: false as const },
  delivery: { enabled: false as const }
};

const baseVenueMeta = {
  ratingSource: "manual_seed" as const,
  rating: null,
  reviewCount: null,
  lastVerifiedAt: null,
  verificationStatus: "needs_verification" as const,
  isPriorityVenue: false,
  venueCategory: "other" as const,
  mapVisibility: "hidden_until_discovered" as const,
  discoveryState: "runtime" as const
};

export const venueDefinitions: Record<string, Venue> = {
  finns_recreation_club: {
    id: "finns_recreation_club",
    name: "FINNS Recreation Club Area",
    type: "other",
    description: "A compressed club-area anchor for fitness, courts, routines, and future group meetups.",
    openHours: dailyDaytime,
    npcIds: ["kadek"],
    itemIds: ["padel_wristband", "safety_card"],
    questIds: ["berawa_bakery_run"],
    realWorldRef: { mapName: "FINNS Recreation Club" },
    ...placeholderSeams,
    implementationStatus: "partial",
    ...baseVenueMeta,
    venueCategory: "fitness"
  },
  canggu_station: {
    id: "canggu_station",
    name: "Canggu Station",
    type: "grocery",
    description: "Grocery and pantry stop on the FINNS-side Berawa run.",
    openHours: dailyDaytime,
    npcIds: ["ibu_sari"],
    itemIds: ["pantry_bag", "coconut", "nasi_bungkus", "kopi_bali", "padel_wristband"],
    questIds: ["canggu_station_restock"],
    realWorldRef: { mapName: "Canggu Station, Jalan Pantai Berawa" },
    ...placeholderSeams,
    implementationStatus: "partial",
    ...baseVenueMeta,
    venueCategory: "grocery"
  },
  milk_madu_berawa: {
    id: "milk_madu_berawa",
    name: "Milk & Madu Berawa",
    type: "cafe",
    description: "Busy brunch and casual founder-chat venue in the Berawa loop.",
    openHours: dailyDaytime,
    npcIds: ["made"],
    itemIds: ["brunch_slice", "kopi_bali", "coconut"],
    questIds: [],
    realWorldRef: { mapName: "Milk & Madu Berawa" },
    ...placeholderSeams,
    implementationStatus: "partial",
    ...baseVenueMeta,
    venueCategory: "cafe"
  },
  baked_berawa: {
    id: "baked_berawa",
    name: "BAKED. Berawa",
    type: "bakery",
    description: "Semat-side bakery stop for pastries, beans, and early meetups.",
    openHours: dailyDaytime,
    npcIds: ["kadek"],
    itemIds: ["butter_croissant", "coffee_beans", "kopi_bali"],
    questIds: ["berawa_bakery_run"],
    realWorldRef: { mapName: "BAKED. Berawa" },
    ...placeholderSeams,
    implementationStatus: "partial",
    ...baseVenueMeta,
    venueCategory: "cafe"
  },
  bungalow_living: {
    id: "bungalow_living",
    name: "Bungalow Living Bali",
    type: "homeware",
    description: "Homeware and cafe energy for settling into Berawa rather than just passing through.",
    openHours: dailyDaytime,
    npcIds: ["made"],
    itemIds: ["home_cushion", "woven_sarong", "beach_tote"],
    questIds: [],
    realWorldRef: { mapName: "Bungalow Living Bali" },
    ...placeholderSeams,
    implementationStatus: "partial",
    ...baseVenueMeta,
    venueCategory: "homeware"
  },
  satu_satu_coffee: {
    id: "satu_satu_coffee",
    name: "Satu-Satu Coffee Company",
    type: "coffee",
    description: "Morning coffee and laptop-focus anchor for the digital nomad loop.",
    openHours: dailyDaytime,
    npcIds: ["made", "kadek"],
    itemIds: ["coffee_beans", "kopi_bali", "butter_croissant"],
    questIds: [],
    realWorldRef: { mapName: "Satu-Satu Coffee Company Berawa" },
    ...placeholderSeams,
    implementationStatus: "partial",
    ...baseVenueMeta,
    venueCategory: "cafe"
  },
  bali_family_rental_scooter: {
    id: "bali_family_rental_scooter",
    name: "Bali Family Rental Scooter",
    type: "other",
    description: "Local scooter-rental seam for mobility tutorials and future transport commerce.",
    openHours: dailyDaytime,
    npcIds: [],
    itemIds: ["scooter_rental", "scooter_key", "safety_card"],
    questIds: [],
    realWorldRef: { mapName: "Bali Family Rental Scooter, Jalan Pantai Berawa" },
    ...placeholderSeams,
    implementationStatus: "partial",
    ...baseVenueMeta,
    venueCategory: "transport"
  },
  berawa_beach: {
    id: "berawa_beach",
    name: "Berawa Beach",
    type: "other",
    description: "Beach edge for surf mornings, sunset tables, cleanup previews, and future check-ins.",
    openHours: dailyDaytime,
    npcIds: ["ari"],
    itemIds: ["coconut", "surf_wax", "cleanup_bag"],
    questIds: [],
    realWorldRef: { mapName: "Berawa Beach" },
    ...placeholderSeams,
    implementationStatus: "stub",
    ...baseVenueMeta,
    venueCategory: "landmark",
    mapVisibility: "road_visible"
  },
  nude_cafe_berawa: {
    id: "nude_cafe_berawa",
    name: "Nude Cafe Berawa",
    type: "cafe",
    description: "Priority-candidate cafe placeholder. Rating/review data needs verification before use.",
    openHours: dailyDaytime,
    npcIds: [],
    itemIds: ["kopi_bali", "brunch_slice"],
    questIds: [],
    realWorldRef: { mapName: "Nude Cafe Berawa" },
    ...placeholderSeams,
    implementationStatus: "stub",
    ...baseVenueMeta,
    venueCategory: "cafe"
  },
  ulekan_berawa: {
    id: "ulekan_berawa",
    name: "Ulekan Berawa",
    type: "other",
    description: "Priority-candidate restaurant placeholder. Rating/review data needs verification before use.",
    openHours: dailyDaytime,
    npcIds: [],
    itemIds: ["nasi_bungkus"],
    questIds: [],
    realWorldRef: { mapName: "Ulekan Berawa" },
    ...placeholderSeams,
    implementationStatus: "stub",
    ...baseVenueMeta,
    venueCategory: "restaurant"
  },
  mowies_berawa: {
    id: "mowies_berawa",
    name: "Mowies Berawa",
    type: "other",
    description: "Priority-candidate beach bar/cafe placeholder. Rating/review data needs verification before use.",
    openHours: dailyDaytime,
    npcIds: [],
    itemIds: ["coconut", "surf_sticker"],
    questIds: [],
    realWorldRef: { mapName: "Mowies Berawa" },
    ...placeholderSeams,
    implementationStatus: "stub",
    ...baseVenueMeta,
    venueCategory: "bar"
  }
};
