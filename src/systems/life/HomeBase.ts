import { getPlayerHomeBase } from "../../data/homeBase";
import type { WorldState } from "../../types";

export function isPlayerAtHomeBase(world: WorldState, radius?: number): boolean {
  const home = getPlayerHomeBase(world);
  const player = world.players[world.localPlayerId];
  const dx = player.x - home.x;
  const dy = player.y - home.y;
  return Math.hypot(dx, dy) <= (radius ?? home.radius);
}

export function canUseHomeSleep(world: WorldState): boolean {
  return world.life.actProgress.act0Step === "sleep_first_night" && isPlayerAtHomeBase(world);
}
