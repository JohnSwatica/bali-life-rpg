import type { DiscoveryLedgerEntry, WorldState } from "../../types";

export function isDiscoveryLedgerEntryUnlocked(world: WorldState, entry: DiscoveryLedgerEntry): boolean {
  if (entry.unlock.type === "pickup_collected") {
    return Boolean(world.collectedPickups[entry.unlock.pickupId]);
  }
  if (entry.unlock.type === "act0_step_complete") {
    return world.life.actProgress.completedAct0StepIds.includes(entry.unlock.step);
  }
  if (entry.unlock.type === "driver_rating") {
    return world.life.hustle.completedDeliveryCount > 0 && world.life.hustle.driverRating >= entry.unlock.minimumRating;
  }
  return world.life.hustle.completedDeliveryCount >= entry.unlock.count;
}
