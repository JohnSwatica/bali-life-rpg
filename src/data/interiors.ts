import type { InteriorDefinition } from "../types";
import { TILE_SIZE } from "../systems/map/TileStreetScale";

const OFFSCREEN_INTERIOR_X = 20000;
const OFFSCREEN_INTERIOR_Y = 1024;

export const interiorDefinitions: Record<string, InteriorDefinition> = {
  warung_sari_interior: {
    id: "warung_sari_interior",
    venueId: "canggu_station",
    name: "Warung Sari",
    origin: { x: OFFSCREEN_INTERIOR_X, y: OFFSCREEN_INTERIOR_Y },
    width: TILE_SIZE * 12,
    height: TILE_SIZE * 8,
    entrance: {
      x: OFFSCREEN_INTERIOR_X + TILE_SIZE * 6,
      y: OFFSCREEN_INTERIOR_Y + TILE_SIZE * 6.5
    },
    exitMat: {
      x: OFFSCREEN_INTERIOR_X + TILE_SIZE * 6,
      y: OFFSCREEN_INTERIOR_Y + TILE_SIZE * 7.35,
      radius: TILE_SIZE * 0.65
    },
    stations: [],
    npcSlots: []
  }
};
