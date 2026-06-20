import Phaser from "phaser";

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
    this.createPickupTexture("pickup-coconut", 0x8a5a2f, 0x6f8f3d);
    this.createPickupTexture("pickup-frangipani", 0xfff5cf, 0xf3b5c6);
    this.createScooterTexture("player-bike", 0x2e7d78, 0xf4d58d);
    this.createScooterTexture("group-bike", 0x377d9f, 0xfff0bd);
    this.createScooterTexture("traffic-bike", 0xd95b43, 0xf6c453);
    this.createShadowTexture();
    this.scene.start("GameScene");
  }

  private createCharacterTexture(key: string, shirt: number, skin: number, hair: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x000000, 0.22);
    graphics.fillEllipse(24, 39, 30, 10, 32);
    graphics.fillStyle(0x2b2730, 1);
    graphics.fillRoundedRect(16, 25, 7, 15, 3);
    graphics.fillRoundedRect(25, 25, 7, 15, 3);
    graphics.fillStyle(shirt, 1);
    graphics.fillRoundedRect(12, 17, 24, 20, 6);
    graphics.fillStyle(0xf7efe0, 0.95);
    graphics.fillRoundedRect(15, 32, 18, 8, 4);
    graphics.fillStyle(skin, 1);
    graphics.fillCircle(24, 13, 11);
    graphics.fillStyle(hair, 1);
    graphics.fillCircle(20, 8, 6);
    graphics.fillCircle(27, 7, 7);
    graphics.fillRoundedRect(15, 8, 19, 7, 5);
    graphics.fillStyle(0x201515, 1);
    graphics.fillCircle(20, 14, 1.4);
    graphics.fillCircle(28, 14, 1.4);
    graphics.generateTexture(key, 48, 48);
    graphics.destroy();
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
}
