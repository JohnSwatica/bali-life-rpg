import { describe, expect, it } from "vitest";
import {
  CHARACTER_IDLE_FRAME_COUNT,
  CHARACTER_WALK_FRAME_COUNT,
  NPC_IDLE_ANIMATION_FRAME_COUNT,
  NPC_REACTION_ANIMATION_FRAME_COUNT,
  characterAnimationKey,
  characterPoseForDirection,
  directionFromDelta,
  npcIdleAnimationKey,
  npcReactionAnimationKey,
  selectCharacterAnimation
} from "../systems/animation/CharacterAnimations";

describe("cheap animation policy", () => {
  it("keeps character animation frame counts intentionally tiny", () => {
    expect(CHARACTER_IDLE_FRAME_COUNT).toBe(1);
    expect(CHARACTER_WALK_FRAME_COUNT).toBe(4);
    expect(NPC_IDLE_ANIMATION_FRAME_COUNT).toBe(2);
    expect(NPC_REACTION_ANIMATION_FRAME_COUNT).toBe(2);
  });

  it("selects player walk and idle animation keys from facing direction", () => {
    expect(characterPoseForDirection("up")).toBe("up");
    expect(characterPoseForDirection("left")).toBe("side");
    expect(selectCharacterAnimation("player", "right", true)).toEqual({
      key: characterAnimationKey("player", "walk", "right"),
      facingLeft: false
    });
    expect(selectCharacterAnimation("player", "left", false)).toEqual({
      key: characterAnimationKey("player", "idle", "left"),
      facingLeft: true
    });
  });

  it("resolves the dominant movement axis into a four-direction facing", () => {
    expect(directionFromDelta(-3, 1)).toBe("left");
    expect(directionFromDelta(1, -4)).toBe("up");
    expect(directionFromDelta(0, 0, "right")).toBe("right");
  });

  it("names NPC idle and reaction animation keys predictably for scene wiring", () => {
    expect(npcIdleAnimationKey("npc-sari", "tidy_counter")).toBe("npc-sari:idle:tidy_counter");
    expect(npcReactionAnimationKey("npc-kadek")).toBe("npc-kadek:reaction:turn");
  });
});
