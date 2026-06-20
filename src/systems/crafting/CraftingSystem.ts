import { recipeDefinitions, type RecipeDefinition } from "../../data/recipes";
import { addItem, getQuantity, removeItem } from "../Inventory";
import type { PlayerEntityState } from "../../types";

export interface CraftingResult {
  ok: boolean;
  message: string;
  recipe?: RecipeDefinition;
}

export function getRecipe(recipeId: string): RecipeDefinition | undefined {
  return recipeDefinitions[recipeId];
}

export function canCraft(player: PlayerEntityState, recipe: RecipeDefinition): boolean {
  return recipe.ingredients.every((ingredient) => getQuantity(player, ingredient.itemId) >= ingredient.quantity);
}

export function craftRecipe(player: PlayerEntityState, recipeId: string): CraftingResult {
  const recipe = getRecipe(recipeId);
  if (!recipe) {
    return { ok: false, message: `Unknown recipe: ${recipeId}` };
  }
  if (!canCraft(player, recipe)) {
    return { ok: false, message: `Missing ingredients for ${recipe.name}.`, recipe };
  }

  for (const ingredient of recipe.ingredients) {
    removeItem(player, ingredient.itemId, ingredient.quantity);
  }
  addItem(player, recipe.result.itemId, recipe.result.quantity);
  return { ok: true, message: `Crafted ${recipe.name}.`, recipe };
}
