import { ambientNpcDefinitions } from "./ambientNpcs";
import { activeStreetTemplate, curatedVenueNodes, venueMapNodes } from "./authoredStreetLayout";
import { playerHomeBase } from "./homeBase";
import { pickupDefinitions, playerSpawn, WORLD_HEIGHT, WORLD_WIDTH } from "./map";
import { npcDefinitions } from "./npcs";
import {
  deriveAuthoredStreetPlayableBounds,
  type PlayablePoint
} from "../systems/map/PlayableBounds";

const authoredPlayablePointCandidates: PlayablePoint[] = [
  ...venueMapNodes,
  ...curatedVenueNodes,
  ...pickupDefinitions,
  playerHomeBase,
  playerSpawn,
  ...Object.values(npcDefinitions).flatMap((npc) =>
    (npc.routineRoutes ?? []).flatMap((route) => route.waypoints)
  ),
  ...ambientNpcDefinitions.flatMap((npc) => npc.route.waypoints)
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
