import { describe, expect, it } from "vitest";
import { addItem, formatInventory, getQuantity, removeItem } from "./Inventory";
import { createInitialPlayerState } from "./WorldState";

describe("Inventory", () => {
  it("adds, stacks, removes, and deletes item entries deterministically", () => {
    const player = createInitialPlayerState();

    expect(getQuantity(player, "coffee_beans")).toBe(0);
    addItem(player, "coffee_beans", 2);
    addItem(player, "coffee_beans", 3);
    expect(getQuantity(player, "coffee_beans")).toBe(5);

    expect(removeItem(player, "coffee_beans", 4)).toBe(true);
    expect(getQuantity(player, "coffee_beans")).toBe(1);
    expect(removeItem(player, "coffee_beans", 2)).toBe(false);
    expect(getQuantity(player, "coffee_beans")).toBe(1);
    expect(removeItem(player, "coffee_beans", 1)).toBe(true);
    expect(getQuantity(player, "coffee_beans")).toBe(0);
    expect(player.inventory.some((entry) => entry.itemId === "coffee_beans")).toBe(false);
  });

  it("formats empty and known-item inventories for display", () => {
    expect(formatInventory([])).toEqual(["Empty bag"]);
    expect(formatInventory([{ itemId: "coconut", quantity: 2 }])).toEqual(["Young Coconut x2"]);
    expect(formatInventory([{ itemId: "unknown_item", quantity: 1 }])).toEqual(["unknown_item x1"]);
  });
});
