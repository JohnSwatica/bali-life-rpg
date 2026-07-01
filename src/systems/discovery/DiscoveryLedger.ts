import type { DiscoveryLedgerEntry, WorldState } from "../../types";

export function isDiscoveryLedgerEntryUnlocked(world: WorldState, entry: DiscoveryLedgerEntry): boolean {
  if (entry.unlock.type === "pickup_collected") {
    return Boolean(world.collectedPickups[entry.unlock.pickupId]);
  }
  return world.life.actProgress.completedAct0StepIds.includes(entry.unlock.step);
}
