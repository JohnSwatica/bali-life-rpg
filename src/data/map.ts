import type { PickupDefinition, RectDefinition } from "../types";
import { offsetVenuePoint } from "./layoutLookup";
import { TILE_WORLD } from "../systems/map/TileStreetScale";

export const WORLD_WIDTH = TILE_WORLD.width;
export const WORLD_HEIGHT = TILE_WORLD.height;

export const collisionRects: RectDefinition[] = [
];

export const pickupDefinitions: PickupDefinition[] = [
  { id: "coconut-west", itemId: "coconut", ...offsetVenuePoint("berawa_beach", { x: 205, y: 1290 }, -135, 24), respawnMinutes: 420, label: "Fallen coconut" },
  { id: "coconut-jetty", itemId: "coconut", ...offsetVenuePoint("berawa_beach", { x: 590, y: 1340 }, -42, 58), respawnMinutes: 420, label: "Fallen coconut" },
  { id: "coconut-rocks", itemId: "coconut", ...offsetVenuePoint("mowies_berawa", { x: 925, y: 1395 }, 86, 28), respawnMinutes: 420, label: "Fallen coconut" },
  { id: "flower-finns", itemId: "frangipani", ...offsetVenuePoint("finns_recreation_club", { x: 1840, y: 430 }, 78, -12), respawnMinutes: 240, label: "Frangipani blossom" },
  { id: "flower-berawa", itemId: "frangipani", ...offsetVenuePoint("milk_madu_berawa", { x: 1380, y: 500 }, 64, -74), respawnMinutes: 240, label: "Frangipani blossom" },
  { id: "elena-notebook-seat", itemId: "elena_notebook", ...offsetVenuePoint("canggu_station", { x: 610, y: 742 }, -150, -110), respawnMinutes: 999999, label: "Something under the seat" },
  { id: "elena-sim-seat", itemId: "elena_sim", ...offsetVenuePoint("canggu_station", { x: 610, y: 742 }, -122, -96), respawnMinutes: 999999, label: "A small plastic card" }
];

export const playerSpawn = offsetVenuePoint("canggu_station", { x: 610, y: 742 }, -170, -120);
