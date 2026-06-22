import { describe, expect, it } from "vitest";
import { getQuantity, addItem } from "../Inventory";
import { createInitialPlayerState } from "../WorldState";
import { canCraft, craftRecipe, getRecipe } from "./CraftingSystem";

describe("CraftingSystem", () => {
  it("looks up recipe definitions by id", () => {
    expect(getRecipe("coconut_breakfast_bowl")?.name).toBe("Coconut Breakfast Bowl");
    expect(getRecipe("missing-recipe")).toBeUndefined();
  });

  it("fails without mutating inventory when ingredients are missing", () => {
    const player = createInitialPlayerState();
    const before = structuredClone(player.inventory);
    const recipe = getRecipe("coconut_breakfast_bowl");

    expect(recipe).toBeDefined();
    expect(recipe ? canCraft(player, recipe) : false).toBe(false);

    const result = craftRecipe(player, "coconut_breakfast_bowl");
    expect(result).toMatchObject({
      ok: false,
      message: "Missing ingredients for Coconut Breakfast Bowl."
    });
    expect(player.inventory).toEqual(before);
  });

  it("consumes ingredients and adds the result for a successful craft", () => {
    const player = createInitialPlayerState();
    addItem(player, "kopi_bali", 1);

    const result = craftRecipe(player, "coconut_breakfast_bowl");

    expect(result).toMatchObject({ ok: true, message: "Crafted Coconut Breakfast Bowl." });
    expect(getQuantity(player, "coconut")).toBe(0);
    expect(getQuantity(player, "kopi_bali")).toBe(0);
    expect(getQuantity(player, "coconut_breakfast_bowl")).toBe(1);
  });

  it("reports unknown recipes without mutating inventory", () => {
    const player = createInitialPlayerState();
    const before = structuredClone(player.inventory);

    expect(craftRecipe(player, "not-a-recipe")).toEqual({
      ok: false,
      message: "Unknown recipe: not-a-recipe"
    });
    expect(player.inventory).toEqual(before);
  });
});
