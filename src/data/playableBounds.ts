import { ambientNpcDefinitions } from "./ambientNpcs";
import { activeStreetTemplate, curatedVenueNodes, venueMapNodes } from "./authoredStreetLayout";
import { playerHomeBase } from "./homeBase";
import { pickupDefinitions, playerSpawn, WORLD_HEIGHT, WORLD_WIDTH } from "./map";
import { npcDefinitions } from "./npcs";
import { walkableStreetParcels } from "./worldDressing";
import {
  deriveAuthoredStreetPlayableBounds,
  type PlayablePoint
} from "../systems/map/PlayableBounds";
import { TILE_SIZE } from "../systems/map/TileStreetScale";

const authoredPlayablePointCandidates: PlayablePoint[] = [
  ...venueMapNodes,
  ...curatedVenueNodes,
  ...pickupDefinitions,
  playerHomeBase,
  playerSpawn,
  ...Object.values(npcDefinitions).flatMap((npc) =>
    (npc.routineRoutes ?? []).flatMap((route) => route.waypoints)
  ),
  ...ambientNpcDefinitions.flatMap((npc) => npc.route.waypoints),
  ...walkableStreetParcels.flatMap((parcel) => [
    { x: parcel.tileX * TILE_SIZE, y: parcel.tileY * TILE_SIZE },
    {
      x: (parcel.tileX + parcel.widthTiles) * TILE_SIZE,
      y: (parcel.tileY + parcel.heightTiles) * TILE_SIZE
    }
  ])
];

export const authoredPlayablePoints = authoredPlayablePointCandidates.filter(
  (point) =>
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    point.x >= 0 &&
    point.x <= WORLD_WIDTH &&
    point.y >= 0 &&
    point.y <= WORLD_HEIGHT
);

export const authoredPlayableBounds = deriveAuthoredStreetPlayableBounds(
  activeStreetTemplate,
  authoredPlayablePoints,
  { width: WORLD_WIDTH, height: WORLD_HEIGHT }
);
