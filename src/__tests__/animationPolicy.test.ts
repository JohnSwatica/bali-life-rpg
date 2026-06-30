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
import { getScooterRattleAmplitude, getScooterVisualState } from "../systems/animation/ScooterAnimation";

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

  it("lets NPC route deltas drive the same cheap walk-cycle policy", () => {
    const routeDirection = directionFromDelta(8, 32);
    expect(routeDirection).toBe("down");
    expect(selectCharacterAnimation("npc-ari", routeDirection, true)).toEqual({
      key: characterAnimationKey("npc-ari", "walk", "down"),
      facingLeft: false
    });
    expect(selectCharacterAnimation("npc-made", directionFromDelta(-16, 2), true)).toEqual({
      key: characterAnimationKey("npc-made", "walk", "left"),
      facingLeft: true
    });
  });

  it("makes borrowed scooters visibly rougher than upgraded scooters", () => {
    expect(getScooterRattleAmplitude("borrowed_rattletrap", 40)).toBeGreaterThan(
      getScooterRattleAmplitude("daily_rental", 40)
    );
    expect(getScooterRattleAmplitude("daily_rental", 40)).toBeGreaterThan(getScooterRattleAmplitude("proper_bike", 40));
  });

  it("adds lean and speed cues without changing scooter gameplay speed", () => {
    const fastRight = getScooterVisualState({
      tier: "daily_rental",
      bikeCondition: 90,
      velocityX: 320,
      velocityY: 0,
      maxSpeed: 345,
      elapsedMs: 160
    });
    const stoppedRattletrap = getScooterVisualState({
      tier: "borrowed_rattletrap",
      bikeCondition: 45,
      velocityX: 0,
      velocityY: 0,
      maxSpeed: 345,
      elapsedMs: 160
    });
    expect(fastRight.angleDegrees).toBeGreaterThan(0);
    expect(fastRight.speedCueCount).toBeGreaterThan(0);
    expect(stoppedRattletrap.speedCueCount).toBe(0);
    expect(Math.abs(stoppedRattletrap.offsetX) + Math.abs(stoppedRattletrap.offsetY)).toBeGreaterThan(0);
  });
});
