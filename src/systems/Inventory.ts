import { itemDefinitions } from "../data/items";
import type { InventoryEntry, PlayerEntityState } from "../types";

export function getQuantity(player: PlayerEntityState, itemId: string): number {
  return player.inventory.find((entry) => entry.itemId === itemId)?.quantity ?? 0;
}

export function addItem(player: PlayerEntityState, itemId: string, quantity = 1): void {
  const existing = player.inventory.find((entry) => entry.itemId === itemId);
  if (existing) {
    existing.quantity += quantity;
    return;
  }
  player.inventory.push({ itemId, quantity });
}

export function removeItem(player: PlayerEntityState, itemId: string, quantity = 1): boolean {
  const existing = player.inventory.find((entry) => entry.itemId === itemId);
  if (!existing || existing.quantity < quantity) {
    return false;
  }
  existing.quantity -= quantity;
  if (existing.quantity <= 0) {
    player.inventory = player.inventory.filter((entry) => entry.itemId !== itemId);
  }
  return true;
}

export function formatInventory(entries: InventoryEntry[]): string[] {
  if (entries.length === 0) {
    return ["Empty bag"];
  }
  return entries.map((entry) => {
    const item = itemDefinitions[entry.itemId];
    return `${item?.name ?? entry.itemId} x${entry.quantity}`;
  });
}
