import type { Direction, NpcIdleTag } from "../../types";

export type CharacterAnimationPose = "down" | "up" | "side";
export type CharacterAnimationMode = "idle" | "walk";

export const CHARACTER_IDLE_FRAME_COUNT = 1;
export const CHARACTER_WALK_FRAME_COUNT = 4;
export const NPC_IDLE_ANIMATION_FRAME_COUNT = 2;
export const NPC_REACTION_ANIMATION_FRAME_COUNT = 2;
export const CHARACTER_ANIMATION_FRAME_RATE = 7;
export const NPC_IDLE_ANIMATION_FRAME_RATE = 3;
export const NPC_REACTION_ANIMATION_FRAME_RATE = 10;

export const CHARACTER_ANIMATION_POSES: CharacterAnimationPose[] = ["down", "up", "side"];

export interface CharacterAnimationSelection {
  key: string;
  facingLeft: boolean;
}

export function characterPoseForDirection(direction: Direction): CharacterAnimationPose {
  if (direction === "up") {
    return "up";
  }
  if (direction === "left" || direction === "right") {
    return "side";
  }
  return "down";
}

export function characterTextureKey(spriteKey: string, pose: CharacterAnimationPose, frameIndex: number): string {
  return `${spriteKey}-${pose}-${frameIndex}`;
}

export function characterAnimationKey(spriteKey: string, mode: CharacterAnimationMode, direction: Direction): string {
  return `${spriteKey}:${mode}:${characterPoseForDirection(direction)}`;
}

export function npcIdleAnimationKey(spriteKey: string, idleTag: NpcIdleTag): string {
  return `${spriteKey}:idle:${idleTag}`;
}

export function npcIdleTextureKey(spriteKey: string, idleTag: NpcIdleTag, frameIndex: number): string {
  return `${spriteKey}-idle-${idleTag}-${frameIndex}`;
}

export function npcReactionAnimationKey(spriteKey: string): string {
  return `${spriteKey}:reaction:turn`;
}

export function npcReactionTextureKey(spriteKey: string, frameIndex: number): string {
  return `${spriteKey}-reaction-turn-${frameIndex}`;
}

export function selectCharacterAnimation(
  spriteKey: string,
  direction: Direction,
  moving: boolean
): CharacterAnimationSelection {
  return {
    key: characterAnimationKey(spriteKey, moving ? "walk" : "idle", direction),
    facingLeft: direction === "left"
  };
}

export function directionFromDelta(dx: number, dy: number, fallback: Direction = "down"): Direction {
  if (Math.abs(dx) <= 0.001 && Math.abs(dy) <= 0.001) {
    return fallback;
  }
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx < 0 ? "left" : "right";
  }
  return dy < 0 ? "up" : "down";
}
