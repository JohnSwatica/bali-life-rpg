import type { InteriorDefinition } from "../types";
import { TILE_SIZE } from "../systems/map/TileStreetScale";

const OFFSCREEN_INTERIOR_X = 20000;
const OFFSCREEN_INTERIOR_Y = 1024;
const WARUNG_X = OFFSCREEN_INTERIOR_X;
const WARUNG_Y = OFFSCREEN_INTERIOR_Y;

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
  }
};
