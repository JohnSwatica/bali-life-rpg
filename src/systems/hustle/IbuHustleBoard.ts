import type { WorldState } from "../../types";

export function shouldOpenIbuHustleBoard(world: WorldState, npcId: string): boolean {
  return (
    npcId === "ibu_sari" &&
    world.life.actProgress.firstDayComplete &&
    world.life.actProgress.currentAct === 1 &&
    !world.life.hustle.moveOutReady
  );
}
