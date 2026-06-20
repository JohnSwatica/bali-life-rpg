import type { PickupDefinition, RectDefinition } from "../types";
import { offsetVenuePoint } from "./layoutLookup";

export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1700;

export const collisionRects: RectDefinition[] = [
  { id: "canggu-station-building", x: 480, y: 560, width: 260, height: 150 },
  { id: "home-row-1", x: 235, y: 345, width: 250, height: 150 },
  { id: "baked-berawa-building", x: 560, y: 300, width: 230, height: 145 },
  { id: "milk-madu-roof", x: 1060, y: 450, width: 260, height: 95 },
  { id: "bungalow-living-building", x: 1410, y: 665, width: 280, height: 140 },
  { id: "finns-main", x: 1600, y: 165, width: 340, height: 160 },
  { id: "finns-wall-left", x: 1510, y: 160, width: 52, height: 300 },
  { id: "finns-wall-right", x: 1980, y: 160, width: 52, height: 300 },
  { id: "cliff-rocks-1", x: 780, y: 1260, width: 120, height: 90 },
  { id: "cliff-rocks-2", x: 1110, y: 1315, width: 145, height: 75 },
  { id: "ocean-block", x: 0, y: 1505, width: 2400, height: 195 }
];

export const pickupDefinitions: PickupDefinition[] = [
  { id: "coconut-west", itemId: "coconut", ...offsetVenuePoint("berawa_beach", { x: 205, y: 1290 }, -135, 24), respawnMinutes: 420, label: "Fallen coconut" },
  { id: "coconut-jetty", itemId: "coconut", ...offsetVenuePoint("berawa_beach", { x: 590, y: 1340 }, -42, 58), respawnMinutes: 420, label: "Fallen coconut" },
  { id: "coconut-rocks", itemId: "coconut", ...offsetVenuePoint("mowies_berawa", { x: 925, y: 1395 }, 86, 28), respawnMinutes: 420, label: "Fallen coconut" },
  { id: "flower-finns", itemId: "frangipani", ...offsetVenuePoint("finns_recreation_club", { x: 1840, y: 430 }, 78, -12), respawnMinutes: 240, label: "Frangipani blossom" },
  { id: "flower-berawa", itemId: "frangipani", ...offsetVenuePoint("milk_madu_berawa", { x: 1380, y: 500 }, 64, -74), respawnMinutes: 240, label: "Frangipani blossom" }
];

export const playerSpawn = offsetVenuePoint("milk_madu_berawa", { x: 865, y: 900 }, -120, 60);
