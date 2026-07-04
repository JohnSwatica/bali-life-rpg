import { describe, expect, it } from "vitest";
import { opportunityTemplates } from "../data/opportunities";
import {
  createDefaultOpportunityState,
  declineOpportunity,
  getAbsoluteMinute,
  spawnOpportunity
} from "../systems/opportunities/OpportunityEngine";
import {
  getRelationshipChoiceScene,
  getRelationshipChoiceSceneForNpc,
  RELATIONSHIP_CHOICE_SCENES
} from "../systems/relationships/RelationshipChoiceScenes";
import { createInitialWorldState } from "../systems/WorldState";
import type { OpportunityTemplate } from "../types";

function template(id: string): OpportunityTemplate {
  const found = opportunityTemplates.find((candidate) => candidate.id === id);
  expect(found).toBeDefined();
  return found!;
}

describe("rio no-questions choice", () => {
  it("registers the Rio scene as manual so quest turn-ins never trigger it", () => {
    const scene = getRelationshipChoiceScene("rio_no_questions_package");
    expect(scene).toBeDefined();
    expect(scene?.npcId).toBe("rio");
    expect(scene?.trigger).toBe("manual");
    expect(scene?.options[0].actionId).toBe("accept_no_questions");
    expect(scene?.options[1].actionId).toBe("decline_no_questions");

    expect(getRelationshipChoiceSceneForNpc("rio")).toBeUndefined();
  });

  it("keeps quest turn-in scenes discoverable by npc", () => {
    expect(getRelationshipChoiceSceneForNpc("kadek")?.id).toBe("kadek_bakery_turnin");
    expect(RELATIONSHIP_CHOICE_SCENES.kadek_bakery_turnin.trigger ?? "quest_turnin").toBe("quest_turnin");
  });

  it("declining applies the decline reward and removes the live offer", () => {
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();
    const now = getAbsoluteMinute(world.clock);
    const live = spawnOpportunity(state, template("no_questions_package"), now);
    const rootedBefore = world.reputation.rootedAxis;

    const result = declineOpportunity(state, world, live.id, now);

    expect(result.ok).toBe(true);
    expect(state.live).toHaveLength(0);
    expect(world.reputation.rootedAxis).toBeGreaterThan(rootedBefore);
    expect(world.reputation.tags).toContain("reliable");
    expect(state.templateCooldownUntil.no_questions_package).toBeGreaterThan(now + 100000);
    expect(state.messages.some((message) => message.body.startsWith("Declined:"))).toBe(true);
  });

  it("declining an accepted or missing offer fails safely", () => {
    const world = createInitialWorldState();
    const state = createDefaultOpportunityState();
    const now = getAbsoluteMinute(world.clock);
    const live = spawnOpportunity(state, template("no_questions_package"), now);
    live.status = "accepted";

    expect(declineOpportunity(state, world, live.id, now).ok).toBe(false);
    expect(declineOpportunity(state, world, "missing-id", now).ok).toBe(false);
    expect(state.live).toHaveLength(1);
  });
});
