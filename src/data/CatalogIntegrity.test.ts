import { describe, expect, it } from "vitest";
import { activityDefinitions, interestGroupDefinitions } from "./community";
import { gameEventDefinitions } from "./events";
import { itemDefinitions } from "./items";
import { WORLD_HEIGHT, WORLD_WIDTH, pickupDefinitions } from "./map";
import { npcDefinitions } from "./npcs";
import { offlineActivityDefinitions } from "./offlineActivities";
import { questDefinitions } from "./quests";
import { recipeDefinitions } from "./recipes";
import { shopDefinitions } from "./shops";
import { venueDefinitions } from "./venues";

describe("data catalog integrity", () => {
  it("keeps record keys aligned with definition ids", () => {
    expect(mismatchedRecordIds(itemDefinitions)).toEqual([]);
    expect(mismatchedRecordIds(npcDefinitions)).toEqual([]);
    expect(mismatchedRecordIds(venueDefinitions)).toEqual([]);
    expect(mismatchedRecordIds(shopDefinitions)).toEqual([]);
    expect(mismatchedRecordIds(questDefinitions)).toEqual([]);
    expect(mismatchedRecordIds(recipeDefinitions)).toEqual([]);
    expect(mismatchedRecordIds(interestGroupDefinitions)).toEqual([]);
  });

  it("keeps venue references pointed at existing NPCs, items, and quests", () => {
    const errors: string[] = [];

    for (const venue of Object.values(venueDefinitions)) {
      for (const npcId of venue.npcIds) {
        if (!npcDefinitions[npcId]) {
          errors.push(`${venue.id} references missing npc ${npcId}`);
        }
      }
      for (const itemId of venue.itemIds) {
        if (!itemDefinitions[itemId]) {
          errors.push(`${venue.id} references missing item ${itemId}`);
        }
      }
      for (const questId of venue.questIds) {
        if (!questDefinitions[questId]) {
          errors.push(`${venue.id} references missing quest ${questId}`);
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("keeps shop and quest references valid", () => {
    const errors: string[] = [];

    for (const shop of Object.values(shopDefinitions)) {
      if (!venueDefinitions[shop.id]) {
        errors.push(`${shop.id} has no matching venue definition`);
      }
      if (shop.keeperNpcId && !npcDefinitions[shop.keeperNpcId]) {
        errors.push(`${shop.id} references missing keeper ${shop.keeperNpcId}`);
      }
      for (const itemId of [...shop.sells, ...shop.buys]) {
        if (!itemDefinitions[itemId]) {
          errors.push(`${shop.id} references missing item ${itemId}`);
        }
      }
      if (!isPositiveFinite(shop.radius) || !isFinitePoint(shop.x, shop.y)) {
        errors.push(`${shop.id} has invalid interaction geometry`);
      }
    }

    for (const quest of Object.values(questDefinitions)) {
      if (!npcDefinitions[quest.giverNpcId]) {
        errors.push(`${quest.id} references missing giver ${quest.giverNpcId}`);
      }
      for (const reward of quest.rewardItems) {
        if (!itemDefinitions[reward.itemId]) {
          errors.push(`${quest.id} rewards missing item ${reward.itemId}`);
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("keeps event, offline activity, and recipe references valid", () => {
    const errors: string[] = [];

    for (const event of gameEventDefinitions) {
      if (event.venueId && !venueDefinitions[event.venueId]) {
        errors.push(`${event.id} references missing venue ${event.venueId}`);
      }
      for (const itemId of event.reward?.itemIds ?? []) {
        if (!itemDefinitions[itemId]) {
          errors.push(`${event.id} rewards missing item ${itemId}`);
        }
      }
    }

    for (const activity of offlineActivityDefinitions) {
      if (!venueDefinitions[activity.venueId]) {
        errors.push(`${activity.activityId} references missing venue ${activity.venueId}`);
      }
      for (const itemId of activity.reward?.itemIds ?? []) {
        if (!itemDefinitions[itemId]) {
          errors.push(`${activity.activityId} rewards missing item ${itemId}`);
        }
      }
      if (activity.status !== "simulated") {
        errors.push(`${activity.activityId} is not honestly marked simulated`);
      }
    }

    for (const recipe of Object.values(recipeDefinitions)) {
      for (const ingredient of recipe.ingredients) {
        if (!itemDefinitions[ingredient.itemId]) {
          errors.push(`${recipe.id} requires missing item ${ingredient.itemId}`);
        }
      }
      if (!itemDefinitions[recipe.result.itemId]) {
        errors.push(`${recipe.id} produces missing item ${recipe.result.itemId}`);
      }
      for (const venueId of recipe.stationVenueIds) {
        if (!venueDefinitions[venueId]) {
          errors.push(`${recipe.id} references missing station venue ${venueId}`);
        }
      }
      for (const npcId of recipe.affinityNpcIds) {
        if (!npcDefinitions[npcId]) {
          errors.push(`${recipe.id} references missing affinity npc ${npcId}`);
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("keeps NPC routines, pickups, and social activities in runtime bounds", () => {
    const errors: string[] = [];

    for (const npc of Object.values(npcDefinitions)) {
      for (const stop of npc.routine) {
        if (!isInBoundsPoint(stop.x, stop.y)) {
          errors.push(`${npc.id}/${stop.id} has out-of-bounds routine point`);
        }
        if (stop.startMinute < 0 || stop.endMinute > 1440 || stop.startMinute >= stop.endMinute) {
          errors.push(`${npc.id}/${stop.id} has invalid routine time window`);
        }
      }
    }

    for (const pickup of pickupDefinitions) {
      if (!itemDefinitions[pickup.itemId]) {
        errors.push(`${pickup.id} references missing item ${pickup.itemId}`);
      }
      if (!isInBoundsPoint(pickup.x, pickup.y) || pickup.respawnMinutes <= 0) {
        errors.push(`${pickup.id} has invalid pickup geometry or respawn`);
      }
    }

    for (const activity of activityDefinitions) {
      if (activity.groupId && !interestGroupDefinitions[activity.groupId]) {
        errors.push(`${activity.id} references missing group ${activity.groupId}`);
      }
      for (const reward of activity.rewardItems) {
        if (!itemDefinitions[reward.itemId]) {
          errors.push(`${activity.id} rewards missing item ${reward.itemId}`);
        }
      }
      if (!isInBoundsPoint(activity.x, activity.y) || !isPositiveFinite(activity.radius)) {
        errors.push(`${activity.id} has invalid activity geometry`);
      }
    }

    expect(findDuplicates(pickupDefinitions.map((pickup) => pickup.id))).toEqual([]);
    expect(findDuplicates(activityDefinitions.map((activity) => activity.id))).toEqual([]);
    expect(findDuplicates(gameEventDefinitions.map((event) => event.id))).toEqual([]);
    expect(findDuplicates(offlineActivityDefinitions.map((activity) => activity.activityId))).toEqual([]);
    expect(errors).toEqual([]);
  });
});

function mismatchedRecordIds<T extends { id: string }>(record: Record<string, T>): string[] {
  return Object.entries(record)
    .filter(([key, value]) => key !== value.id)
    .map(([key, value]) => `${key} !== ${value.id}`);
}

function isFinitePoint(x: number, y: number): boolean {
  return Number.isFinite(x) && Number.isFinite(y);
}

function isInBoundsPoint(x: number, y: number): boolean {
  return isFinitePoint(x, y) && x >= 0 && x <= WORLD_WIDTH && y >= 0 && y <= WORLD_HEIGHT;
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return [...duplicates].sort();
}
