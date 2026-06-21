import Phaser from "phaser";
import "./styles/global.css";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";

const viewport = {
  width: Math.max(320, window.innerWidth || 1280),
  height: Math.max(320, window.innerHeight || 720)
};
const devicePixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: viewport.width,
  height: viewport.height,
  backgroundColor: "#101820",
  pixelArt: false,
  antialias: true,
  antialiasGL: true,
  roundPixels: false,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: false,
    zoom: devicePixelRatio
  },
  scene: [BootScene, GameScene]
};

new Phaser.Game(config);
