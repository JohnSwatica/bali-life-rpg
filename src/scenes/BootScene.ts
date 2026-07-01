import Phaser from "phaser";
import {
  CHARACTER_ANIMATION_FRAME_RATE,
  CHARACTER_ANIMATION_POSES,
  CHARACTER_WALK_FRAME_COUNT,
  NPC_IDLE_ANIMATION_FRAME_COUNT,
  NPC_IDLE_ANIMATION_FRAME_RATE,
  NPC_REACTION_ANIMATION_FRAME_COUNT,
  NPC_REACTION_ANIMATION_FRAME_RATE,
  characterAnimationKey,
  characterTextureKey,
  npcIdleAnimationKey,
  npcIdleTextureKey,
  npcReactionAnimationKey,
  npcReactionTextureKey,
  type CharacterAnimationPose
} from "../systems/animation/CharacterAnimations";
import type { Direction, NpcIdleTag } from "../types";

const CHARACTER_KEYS = [
  "player",
  "npc-sari",
  "npc-kadek",
  "npc-made",
  "npc-ari",
  "npc-rio",
  "npc-pak-bagus",
  "npc-willow"
];
const NPC_IDLE_TAGS: NpcIdleTag[] = ["tidy_counter", "knead_oven", "laptop_sip", "tinker_board", "generic_idle"];

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    this.createCharacterTexture("player", 0x2e7d78, 0xf3c36b, 0x25384a);
    this.createCharacterTexture("npc-sari", 0xf59f43, 0xf5c179, 0x5a2b25);
    this.createCharacterTexture("npc-kadek", 0x6ab7ff, 0xe3b57a, 0x273043);
    this.createCharacterTexture("npc-made", 0x8bd17c, 0xdb9d67, 0x472d30);
    this.createCharacterTexture("npc-ari", 0xffd166, 0xc9874b, 0x23395b);
    this.createCharacterTexture("npc-rio", 0xff5d5d, 0xc9874b, 0x20242f);
    this.createCharacterTexture("npc-pak-bagus", 0xd4af6a, 0xd19a67, 0x42302b);
    this.createCharacterTexture("npc-willow", 0xc9a6ff, 0xf0c4a8, 0x6d5a95);
    this.createPickupTexture("pickup-coconut", 0x8a5a2f, 0x6f8f3d);
    this.createPickupTexture("pickup-frangipani", 0xfff5cf, 0xf3b5c6);
    this.createScooterTexture("player-bike", 0x2e7d78, 0xf4d58d);
    this.createScooterTexture("group-bike", 0x377d9f, 0xfff0bd);
    this.createScooterTexture("traffic-bike", 0xd95b43, 0xf6c453);
    this.createShadowTexture();
    for (const key of CHARACTER_KEYS) {
      this.createCharacterAnimations(key);
    }
    this.scene.start("GameScene");
  }

  private createCharacterTexture(key: string, shirt: number, skin: number, hair: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    this.drawCharacterFrame(graphics, shirt, skin, hair, "down", 0);
    graphics.generateTexture(key, 48, 48);
    graphics.clear();

    for (const pose of CHARACTER_ANIMATION_POSES) {
      for (let frame = 0; frame < CHARACTER_WALK_FRAME_COUNT; frame += 1) {
        this.drawCharacterFrame(graphics, shirt, skin, hair, pose, frame);
        graphics.generateTexture(characterTextureKey(key, pose, frame), 48, 48);
        graphics.clear();
      }
    }

    for (const tag of NPC_IDLE_TAGS) {
      for (let frame = 0; frame < NPC_IDLE_ANIMATION_FRAME_COUNT; frame += 1) {
        this.drawNpcIdleFrame(graphics, shirt, skin, hair, tag, frame);
        graphics.generateTexture(npcIdleTextureKey(key, tag, frame), 48, 48);
        graphics.clear();
      }
    }

    for (let frame = 0; frame < NPC_REACTION_ANIMATION_FRAME_COUNT; frame += 1) {
      this.drawNpcReactionFrame(graphics, shirt, skin, hair, frame);
      graphics.generateTexture(npcReactionTextureKey(key, frame), 48, 48);
      graphics.clear();
    }

    graphics.destroy();
  }

  private drawCharacterFrame(
    graphics: Phaser.GameObjects.Graphics,
    shirt: number,
    skin: number,
    hair: number,
    pose: CharacterAnimationPose,
    frame: number
  ): void {
    const bob = frame === 1 || frame === 3 ? -1 : 0;
    const step = frame === 1 ? 2 : frame === 3 ? -2 : 0;
    const armSwing = frame === 1 ? -1.5 : frame === 3 ? 1.5 : 0;

    graphics.fillStyle(0x000000, 0.22);
    graphics.fillEllipse(24, 39, 30, 10, 32);
    graphics.fillStyle(0x2b2730, 1);
    if (pose === "side") {
      graphics.fillRoundedRect(17 + step, 25, 7, 15, 3);
      graphics.fillRoundedRect(25 - step, 25, 7, 15, 3);
    } else {
      graphics.fillRoundedRect(16 + step, 25, 7, 15, 3);
      graphics.fillRoundedRect(25 - step, 25, 7, 15, 3);
    }
    graphics.fillStyle(shirt, 1);
    if (pose === "side") {
      graphics.fillRoundedRect(14, 17 + bob, 20, 20, 6);
      graphics.fillStyle(skin, 1);
      graphics.fillRoundedRect(12 + armSwing, 20 + bob, 5, 14, 3);
      graphics.fillRoundedRect(31 - armSwing, 20 + bob, 5, 14, 3);
    } else {
      graphics.fillRoundedRect(12, 17 + bob, 24, 20, 6);
      graphics.fillStyle(skin, 1);
      graphics.fillRoundedRect(8 + armSwing, 20 + bob, 5, 14, 3);
      graphics.fillRoundedRect(35 - armSwing, 20 + bob, 5, 14, 3);
    }
    graphics.fillStyle(0xf7efe0, 0.95);
    graphics.fillRoundedRect(15, 32 + bob, 18, 8, 4);
    graphics.fillStyle(skin, 1);
    graphics.fillCircle(pose === "side" ? 25 : 24, 13 + bob, 11);
    graphics.fillStyle(hair, 1);
    if (pose === "up") {
      graphics.fillCircle(19, 12 + bob, 7);
      graphics.fillCircle(28, 11 + bob, 8);
      graphics.fillRoundedRect(14, 8 + bob, 21, 12, 6);
      graphics.fillStyle(0x3a2524, 0.45);
      graphics.fillRoundedRect(17, 17 + bob, 14, 4, 3);
    } else if (pose === "side") {
      graphics.fillCircle(23, 8 + bob, 7);
      graphics.fillCircle(30, 9 + bob, 6);
      graphics.fillRoundedRect(17, 8 + bob, 18, 7, 5);
      graphics.fillStyle(0x201515, 1);
      graphics.fillCircle(29, 14 + bob, 1.4);
    } else {
      graphics.fillCircle(20, 8 + bob, 6);
      graphics.fillCircle(27, 7 + bob, 7);
      graphics.fillRoundedRect(15, 8 + bob, 19, 7, 5);
      graphics.fillStyle(0x201515, 1);
      graphics.fillCircle(20, 14 + bob, 1.4);
      graphics.fillCircle(28, 14 + bob, 1.4);
    }
  }

  private drawNpcIdleFrame(
    graphics: Phaser.GameObjects.Graphics,
    shirt: number,
    skin: number,
    hair: number,
    tag: NpcIdleTag,
    frame: number
  ): void {
    this.drawCharacterFrame(graphics, shirt, skin, hair, "down", frame);
    const reach = frame === 0 ? -1 : 2;
    graphics.fillStyle(this.idleToolColor(tag), 0.96);
    if (tag === "laptop_sip") {
      graphics.fillRoundedRect(13, 31, 22, 6, 2);
      graphics.fillCircle(34, 22 + reach, 3);
    } else if (tag === "knead_oven") {
      graphics.fillEllipse(24, 33, 20, 7, 32);
      graphics.fillStyle(0xfff0bd, 0.92);
      graphics.fillCircle(18 + reach, 31, 3);
      graphics.fillCircle(30 - reach, 31, 3);
    } else if (tag === "tinker_board") {
      graphics.fillRoundedRect(15, 28, 19, 9, 2);
      graphics.lineStyle(2, 0xf7efe0, 0.8);
      graphics.lineBetween(18, 31 + reach, 31, 31 - reach);
    } else if (tag === "tidy_counter") {
      graphics.fillRoundedRect(12, 31, 24, 5, 2);
      graphics.fillStyle(0xf7efe0, 0.92);
      graphics.fillCircle(19 + reach, 30, 3);
    } else {
      graphics.fillCircle(frame === 0 ? 17 : 31, 25, 2.5);
    }
  }

  private drawNpcReactionFrame(
    graphics: Phaser.GameObjects.Graphics,
    shirt: number,
    skin: number,
    hair: number,
    frame: number
  ): void {
    this.drawCharacterFrame(graphics, shirt, skin, hair, frame === 0 ? "side" : "down", frame);
    graphics.fillStyle(0xe6fff4, 0.96);
    graphics.fillCircle(35, 9, 4);
  }

  private idleToolColor(tag: NpcIdleTag): number {
    const colors: Record<NpcIdleTag, number> = {
      tidy_counter: 0xf7efe0,
      knead_oven: 0xd99f5a,
      laptop_sip: 0x2b3d4f,
      tinker_board: 0x7c5f46,
      generic_idle: 0xfff0bd
    };
    return colors[tag];
  }

  private createPickupTexture(key: string, primary: number, accent: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(16, 25, 22, 7, 32);
    graphics.fillStyle(primary, 1);
    graphics.fillCircle(16, 15, 9);
    graphics.fillStyle(accent, 1);
    graphics.fillEllipse(18, 11, 10, 5, 32);
    graphics.fillStyle(0xffffff, 0.45);
    graphics.fillCircle(12, 12, 2);
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
  }

  private createScooterTexture(key: string, body: number, accent: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x000000, 0.24);
    graphics.fillEllipse(32, 29, 54, 12, 32);
    graphics.fillStyle(0x1a2026, 1);
    graphics.fillCircle(13, 28, 8);
    graphics.fillCircle(50, 28, 8);
    graphics.fillStyle(body, 1);
    graphics.fillRoundedRect(18, 16, 30, 13, 7);
    graphics.fillStyle(accent, 1);
    graphics.fillRoundedRect(30, 9, 20, 10, 5);
    graphics.lineStyle(3, 0x24313a, 1);
    graphics.lineBetween(45, 16, 56, 10);
    graphics.lineBetween(18, 18, 7, 13);
    graphics.fillStyle(0xfff8df, 0.75);
    graphics.fillCircle(55, 10, 3);
    graphics.generateTexture(key, 64, 42);
    graphics.destroy();
  }

  private createShadowTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(24, 16, 40, 15, 32);
    graphics.generateTexture("soft-shadow", 48, 32);
    graphics.destroy();
  }

  private createCharacterAnimations(spriteKey: string): void {
    const directions: Direction[] = ["down", "up", "right"];
    for (const direction of directions) {
      const pose: CharacterAnimationPose = direction === "up" ? "up" : direction === "down" ? "down" : "side";
      this.createAnimationIfMissing(characterAnimationKey(spriteKey, "idle", direction), [
        characterTextureKey(spriteKey, pose, 0)
      ]);
      this.createAnimationIfMissing(
        characterAnimationKey(spriteKey, "walk", direction),
        Array.from({ length: CHARACTER_WALK_FRAME_COUNT }, (_, index) => characterTextureKey(spriteKey, pose, index)),
        CHARACTER_ANIMATION_FRAME_RATE
      );
    }

    for (const tag of NPC_IDLE_TAGS) {
      this.createAnimationIfMissing(
        npcIdleAnimationKey(spriteKey, tag),
        Array.from({ length: NPC_IDLE_ANIMATION_FRAME_COUNT }, (_, index) => npcIdleTextureKey(spriteKey, tag, index)),
        NPC_IDLE_ANIMATION_FRAME_RATE
      );
    }

    this.createAnimationIfMissing(
      npcReactionAnimationKey(spriteKey),
      Array.from({ length: NPC_REACTION_ANIMATION_FRAME_COUNT }, (_, index) => npcReactionTextureKey(spriteKey, index)),
      NPC_REACTION_ANIMATION_FRAME_RATE,
      0
    );
  }

  private createAnimationIfMissing(key: string, textureKeys: string[], frameRate = 1, repeat = -1): void {
    if (this.anims.exists(key)) {
      return;
    }
    this.anims.create({
      key,
      frames: textureKeys.map((textureKey) => ({ key: textureKey })),
      frameRate,
      repeat
    });
  }
}
