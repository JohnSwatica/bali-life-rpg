import { tileToWorld } from "../systems/map/TileStreetScale";
import { offsetVenuePoint } from "./layoutLookup";
import type { WorldState } from "../types";

export const playerHomeBase = {
  id: "cheap_kos",
  name: "Cheap Kos Room",
  description: "The tiny room Ibu Sari helped you find for your first nights in Berawa.",
  ...tileToWorld(48, 17),
  radius: 92
} as const;

export const sharedRoomHomeBase = {
  id: "shared_room",
  name: "Bungalow Shared Room",
  description: "Two mattresses, a working fan, and a window that lets the morning in.",
  ...offsetVenuePoint("bungalow_living", { x: 1510, y: 815 }, -150, 90),
  radius: 70
} as const;

export type PlayerHomeBase = typeof playerHomeBase | typeof sharedRoomHomeBase;

export function getPlayerHomeBase(world: WorldState): PlayerHomeBase {
  return world.collectedPickups.act1_move_out_complete ? sharedRoomHomeBase : playerHomeBase;
}
