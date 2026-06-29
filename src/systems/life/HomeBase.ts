import { playerHomeBase } from "../../data/homeBase";
import type { WorldState } from "../../types";

export function isPlayerAtHomeBase(world: WorldState, radius = playerHomeBase.radius): boolean {
  const player = world.players[world.localPlayerId];
  const dx = player.x - playerHomeBase.x;
  const dy = player.y - playerHomeBase.y;
  return Math.hypot(dx, dy) <= radius;
}

export function canUseHomeSleep(world: WorldState): boolean {
  return world.life.actProgress.act0Step === "sleep_first_night" && isPlayerAtHomeBase(world);
}
