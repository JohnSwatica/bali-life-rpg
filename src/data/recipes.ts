import type { InventoryEntry, ReputationTag } from "../types";

export type CraftingStation = "home_base" | "cafe_counter" | "venue_kitchen";

export interface RecipeDefinition {
  id: string;
  name: string;
  description: string;
  ingredients: InventoryEntry[];
  result: InventoryEntry;
  station: CraftingStation;
  stationVenueIds: string[];
  reputationTag?: ReputationTag;
  affinityNpcIds: string[];
  implementationStatus: "stub";
}

export const recipeDefinitions: Record<string, RecipeDefinition> = {
  coconut_breakfast_bowl: {
    id: "coconut_breakfast_bowl",
    name: "Coconut Breakfast Bowl",
    description: "A future low-friction cooking action for a digital-nomad morning routine.",
    ingredients: [
      { itemId: "coconut", quantity: 1 },
      { itemId: "kopi_bali", quantity: 1 }
    ],
    result: { itemId: "coconut_breakfast_bowl", quantity: 1 },
    station: "home_base",
    stationVenueIds: [],
    reputationTag: "helpful",
    affinityNpcIds: ["ari"],
    implementationStatus: "stub"
  },
  cafe_brunch_share: {
    id: "cafe_brunch_share",
    name: "Cafe Brunch Share",
    description: "A future cafe-table social craft for sharing a small bite with an NPC or group.",
    ingredients: [
      { itemId: "butter_croissant", quantity: 1 },
      { itemId: "coffee_beans", quantity: 1 }
    ],
    result: { itemId: "brunch_slice", quantity: 1 },
    station: "cafe_counter",
    stationVenueIds: ["baked_berawa", "satu_satu_coffee", "milk_madu_berawa"],
    reputationTag: "social",
    affinityNpcIds: ["kadek", "made"],
    implementationStatus: "stub"
  }
};
