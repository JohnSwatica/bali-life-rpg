import { tileToWorld } from "../systems/map/TileStreetScale";

export const playerHomeBase = {
  id: "cheap_kos",
  name: "Cheap Kos Room",
  description: "The tiny room Ibu Sari helped you find for your first nights in Berawa.",
  ...tileToWorld(48, 17),
  radius: 92
} as const;
