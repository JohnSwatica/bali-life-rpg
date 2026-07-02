import type { InteriorDefinition } from "../types";
import { TILE_SIZE } from "../systems/map/TileStreetScale";

const OFFSCREEN_INTERIOR_X = 20000;
const OFFSCREEN_INTERIOR_Y = 1024;
const WARUNG_X = OFFSCREEN_INTERIOR_X;
const WARUNG_Y = OFFSCREEN_INTERIOR_Y;
const BAKED_X = OFFSCREEN_INTERIOR_X;
const BAKED_Y = OFFSCREEN_INTERIOR_Y + TILE_SIZE * 11;
const MILK_MADU_X = OFFSCREEN_INTERIOR_X;
const MILK_MADU_Y = OFFSCREEN_INTERIOR_Y + TILE_SIZE * 22;
const KOS_X = OFFSCREEN_INTERIOR_X;
const KOS_Y = OFFSCREEN_INTERIOR_Y + TILE_SIZE * 33;
const RENTAL_X = OFFSCREEN_INTERIOR_X;
const RENTAL_Y = OFFSCREEN_INTERIOR_Y + TILE_SIZE * 43;
const SATU_SATU_X = OFFSCREEN_INTERIOR_X;
const SATU_SATU_Y = OFFSCREEN_INTERIOR_Y + TILE_SIZE * 54;

export const interiorDefinitions: Record<string, InteriorDefinition> = {
  warung_sari_interior: {
    id: "warung_sari_interior",
    venueId: "canggu_station",
    name: "Warung Sari",
    origin: { x: WARUNG_X, y: WARUNG_Y },
    width: TILE_SIZE * 12,
    height: TILE_SIZE * 8,
    entrance: {
      x: WARUNG_X + TILE_SIZE * 6,
      y: WARUNG_Y + TILE_SIZE * 6.5
    },
    exitMat: {
      x: WARUNG_X + TILE_SIZE * 6,
      y: WARUNG_Y + TILE_SIZE * 7.35,
      radius: TILE_SIZE * 0.65
    },
    stations: [
      {
        id: "meal_counter",
        x: WARUNG_X + TILE_SIZE * 5.9,
        y: WARUNG_Y + TILE_SIZE * 2.2,
        radius: TILE_SIZE * 1.1,
        label: "Use meal counter",
        activityVenueId: "canggu_station"
      }
    ],
    npcSlots: [
      {
        npcId: "ibu_sari",
        x: WARUNG_X + TILE_SIZE * 6.9,
        y: WARUNG_Y + TILE_SIZE * 2.35
      }
    ]
  },
  baked_berawa_interior: {
    id: "baked_berawa_interior",
    venueId: "baked_berawa",
    name: "BAKED. Berawa",
    origin: { x: BAKED_X, y: BAKED_Y },
    width: TILE_SIZE * 12,
    height: TILE_SIZE * 8,
    entrance: {
      x: BAKED_X + TILE_SIZE * 6,
      y: BAKED_Y + TILE_SIZE * 6.5
    },
    exitMat: {
      x: BAKED_X + TILE_SIZE * 6,
      y: BAKED_Y + TILE_SIZE * 7.35,
      radius: TILE_SIZE * 0.65
    },
    stations: [
      {
        id: "bakery_counter",
        x: BAKED_X + TILE_SIZE * 6.1,
        y: BAKED_Y + TILE_SIZE * 2.2,
        radius: TILE_SIZE * 1.1,
        label: "Use bakery counter",
        activityVenueId: "baked_berawa"
      }
    ],
    npcSlots: [
      {
        npcId: "kadek",
        x: BAKED_X + TILE_SIZE * 7.15,
        y: BAKED_Y + TILE_SIZE * 2.4
      }
    ]
  },
  milk_madu_interior: {
    id: "milk_madu_interior",
    venueId: "milk_madu_berawa",
    name: "Milk & Madu Berawa",
    origin: { x: MILK_MADU_X, y: MILK_MADU_Y },
    width: TILE_SIZE * 12,
    height: TILE_SIZE * 8,
    entrance: {
      x: MILK_MADU_X + TILE_SIZE * 6,
      y: MILK_MADU_Y + TILE_SIZE * 6.5
    },
    exitMat: {
      x: MILK_MADU_X + TILE_SIZE * 6,
      y: MILK_MADU_Y + TILE_SIZE * 7.35,
      radius: TILE_SIZE * 0.65
    },
    stations: [
      {
        id: "cafe_table",
        x: MILK_MADU_X + TILE_SIZE * 5.95,
        y: MILK_MADU_Y + TILE_SIZE * 4.2,
        radius: TILE_SIZE * 1.2,
        label: "Use cafe table",
        activityVenueId: "milk_madu_berawa"
      }
    ],
    npcSlots: [
      {
        npcId: "ari",
        x: MILK_MADU_X + TILE_SIZE * 4.2,
        y: MILK_MADU_Y + TILE_SIZE * 4.65
      },
      {
        npcId: "willow",
        x: MILK_MADU_X + TILE_SIZE * 8.15,
        y: MILK_MADU_Y + TILE_SIZE * 4.35
      },
      {
        npcId: "ibu_sari",
        x: MILK_MADU_X + TILE_SIZE * 3.25,
        y: MILK_MADU_Y + TILE_SIZE * 2.45
      }
    ]
  },
  cheap_kos_interior: {
    id: "cheap_kos_interior",
    venueId: "cheap_kos",
    name: "Cheap Kos Room",
    origin: { x: KOS_X, y: KOS_Y },
    width: TILE_SIZE * 10,
    height: TILE_SIZE * 7,
    entrance: {
      x: KOS_X + TILE_SIZE * 5,
      y: KOS_Y + TILE_SIZE * 5.65
    },
    exitMat: {
      x: KOS_X + TILE_SIZE * 5,
      y: KOS_Y + TILE_SIZE * 6.35,
      radius: TILE_SIZE * 0.65
    },
    stations: [
      {
        id: "kos_room_corner",
        x: KOS_X + TILE_SIZE * 4.95,
        y: KOS_Y + TILE_SIZE * 3.55,
        radius: TILE_SIZE * 1.35,
        label: "Use kos room",
        activityVenueId: "cheap_kos"
      }
    ],
    npcSlots: []
  },
  scooter_rental_interior: {
    id: "scooter_rental_interior",
    venueId: "bali_family_rental_scooter",
    name: "Bali Family Rental Scooter",
    origin: { x: RENTAL_X, y: RENTAL_Y },
    width: TILE_SIZE * 12,
    height: TILE_SIZE * 8,
    entrance: {
      x: RENTAL_X + TILE_SIZE * 6,
      y: RENTAL_Y + TILE_SIZE * 6.5
    },
    exitMat: {
      x: RENTAL_X + TILE_SIZE * 6,
      y: RENTAL_Y + TILE_SIZE * 7.35,
      radius: TILE_SIZE * 0.65
    },
    stations: [
      {
        id: "scooter_counter",
        x: RENTAL_X + TILE_SIZE * 5.95,
        y: RENTAL_Y + TILE_SIZE * 2.35,
        radius: TILE_SIZE * 1.25,
        label: "Use scooter counter",
        activityVenueId: "bali_family_rental_scooter"
      }
    ],
    npcSlots: [
      {
        npcId: "rio",
        x: RENTAL_X + TILE_SIZE * 7.1,
        y: RENTAL_Y + TILE_SIZE * 2.55
      }
    ]
  },
  satu_satu_interior: {
    id: "satu_satu_interior",
    venueId: "satu_satu_coffee",
    name: "Satu-Satu Coffee Company",
    origin: { x: SATU_SATU_X, y: SATU_SATU_Y },
    width: TILE_SIZE * 12,
    height: TILE_SIZE * 8,
    entrance: {
      x: SATU_SATU_X + TILE_SIZE * 6,
      y: SATU_SATU_Y + TILE_SIZE * 6.5
    },
    exitMat: {
      x: SATU_SATU_X + TILE_SIZE * 6,
      y: SATU_SATU_Y + TILE_SIZE * 7.35,
      radius: TILE_SIZE * 0.65
    },
    stations: [
      {
        id: "focus_table",
        x: SATU_SATU_X + TILE_SIZE * 5.85,
        y: SATU_SATU_Y + TILE_SIZE * 4.15,
        radius: TILE_SIZE * 1.25,
        label: "Use focus table",
        activityVenueId: "satu_satu_coffee"
      }
    ],
    npcSlots: [
      {
        npcId: "kadek",
        x: SATU_SATU_X + TILE_SIZE * 3.4,
        y: SATU_SATU_Y + TILE_SIZE * 4.85
      },
      {
        npcId: "made",
        x: SATU_SATU_X + TILE_SIZE * 6.25,
        y: SATU_SATU_Y + TILE_SIZE * 4.25
      },
      {
        npcId: "pak_bagus",
        x: SATU_SATU_X + TILE_SIZE * 8.6,
        y: SATU_SATU_Y + TILE_SIZE * 4.75
      }
    ]
  }
};
