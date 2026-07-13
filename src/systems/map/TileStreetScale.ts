import Phaser from "phaser";

export const TILE_SIZE = 32;
export const TILESET_KEY = "bali-original-street-tiles";

export const TILE_WORLD = {
  widthTiles: 120,
  heightTiles: 85,
  width: 120 * TILE_SIZE,
  height: 85 * TILE_SIZE
} as const;

export const STREET_CAMERA = {
  desktopZoom: 1.76,
  mobileZoom: 1.38
} as const;

export const TILE_IDS = {
  grass: 0,
  grassShadow: 1,
  road: 2,
  sidewalk: 3,
  sand: 4,
  shallowWater: 5,
  deepWater: 6,
  waterEdge: 7,
  tree: 8,
  bush: 9,
  flower: 10,
  dock: 11,
  plot: 12,
  roof: 13,
  wall: 14
} as const;

const TILE_COUNT = Object.keys(TILE_IDS).length;

export interface TilePoint {
  tileX: number;
  tileY: number;
}

export function tileToWorld(tileX: number, tileY: number): { x: number; y: number } {
  return {
    x: tileX * TILE_SIZE + TILE_SIZE / 2,
    y: tileY * TILE_SIZE + TILE_SIZE / 2
  };
}

export function worldToTile(x: number, y: number): TilePoint {
  return {
    tileX: Math.floor(x / TILE_SIZE),
    tileY: Math.floor(y / TILE_SIZE)
  };
}

export function createOriginalStreetTileset(scene: Phaser.Scene): void {
  if (scene.textures.exists(TILESET_KEY)) {
    return;
  }

  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  drawGrass(g, TILE_IDS.grass, 0x68ad66, 0x7cc875);
  drawGrass(g, TILE_IDS.grassShadow, 0x579855, 0x6ab761);
  drawRoad(g, TILE_IDS.road);
  drawSidewalk(g, TILE_IDS.sidewalk);
  drawSand(g, TILE_IDS.sand);
  drawWater(g, TILE_IDS.shallowWater, 0x55c6c1, 0x9ee7df);
  drawWater(g, TILE_IDS.deepWater, 0x187b9b, 0x48c6cf);
  drawWaterEdge(g, TILE_IDS.waterEdge);
  drawTree(g, TILE_IDS.tree);
  drawBush(g, TILE_IDS.bush);
  drawFlower(g, TILE_IDS.flower);
  drawDock(g, TILE_IDS.dock);
  drawPlot(g, TILE_IDS.plot);
  drawRoof(g, TILE_IDS.roof);
  drawWall(g, TILE_IDS.wall);
  g.generateTexture(TILESET_KEY, TILE_SIZE * TILE_COUNT, TILE_SIZE);
  g.destroy();
}

function offset(tileId: number): number {
  return tileId * TILE_SIZE;
}

function drawGrass(g: Phaser.GameObjects.Graphics, tileId: number, base: number, fleck: number): void {
  const x = offset(tileId);
  g.fillStyle(base, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(fleck, 0.32);
  g.fillRect(x + 5, 7, 3, 2);
  g.fillRect(x + 22, 12, 4, 2);
  g.fillRect(x + 14, 24, 3, 2);
}

function drawRoad(g: Phaser.GameObjects.Graphics, tileId: number): void {
  const x = offset(tileId);
  g.fillStyle(0x8f8878, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x746e5f, 1);
  g.fillRect(x, 0, TILE_SIZE, 3);
  g.fillRect(x, TILE_SIZE - 3, TILE_SIZE, 3);
  g.fillStyle(0xfff6d0, 0.84);
  g.fillRect(x + 13, 6, 6, 8);
  g.fillRect(x + 13, 21, 6, 7);
}

function drawSidewalk(g: Phaser.GameObjects.Graphics, tileId: number): void {
  const x = offset(tileId);
  g.fillStyle(0xd8caa7, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.lineStyle(1, 0xb9aa8a, 0.55);
  g.lineBetween(x, 16, x + TILE_SIZE, 16);
  g.lineBetween(x + 16, 0, x + 16, TILE_SIZE);
}

function drawSand(g: Phaser.GameObjects.Graphics, tileId: number): void {
  const x = offset(tileId);
  g.fillStyle(0xe4c77d, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0xcaa762, 0.42);
  g.fillCircle(x + 8, 9, 2);
  g.fillCircle(x + 23, 18, 1.5);
  g.fillCircle(x + 16, 27, 1.3);
}

function drawWater(g: Phaser.GameObjects.Graphics, tileId: number, base: number, wave: number): void {
  const x = offset(tileId);
  g.fillStyle(base, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.lineStyle(2, wave, 0.45);
  g.beginPath();
  g.moveTo(x + 3, 11);
  g.lineTo(x + 11, 8);
  g.lineTo(x + 20, 11);
  g.lineTo(x + 29, 8);
  g.strokePath();
  g.beginPath();
  g.moveTo(x + 2, 23);
  g.lineTo(x + 11, 20);
  g.lineTo(x + 20, 23);
  g.lineTo(x + 30, 20);
  g.strokePath();
}

function drawWaterEdge(g: Phaser.GameObjects.Graphics, tileId: number): void {
  const x = offset(tileId);
  g.fillStyle(0xe4c77d, 1);
  g.fillRect(x, 0, TILE_SIZE, 13);
  g.fillStyle(0x55c6c1, 1);
  g.fillRect(x, 13, TILE_SIZE, TILE_SIZE - 13);
  g.lineStyle(3, 0xf6e5a5, 0.85);
  g.beginPath();
  g.moveTo(x, 13);
  g.lineTo(x + 8, 15);
  g.lineTo(x + 16, 12);
  g.lineTo(x + 24, 15);
  g.lineTo(x + TILE_SIZE, 13);
  g.strokePath();
}

function drawTree(g: Phaser.GameObjects.Graphics, tileId: number): void {
  const x = offset(tileId);
  g.fillStyle(0x68ad66, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x8b5f2f, 1);
  g.fillRect(x + 13, 18, 6, 11);
  g.fillStyle(0x2f8848, 1);
  g.fillCircle(x + 12, 14, 9);
  g.fillCircle(x + 21, 13, 9);
  g.fillCircle(x + 17, 7, 9);
  g.fillStyle(0x57a65a, 1);
  g.fillCircle(x + 12, 10, 3);
}

function drawBush(g: Phaser.GameObjects.Graphics, tileId: number): void {
  const x = offset(tileId);
  g.fillStyle(0x68ad66, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x3e9a55, 1);
  g.fillCircle(x + 11, 18, 8);
  g.fillCircle(x + 20, 18, 8);
  g.fillCircle(x + 16, 13, 7);
}

function drawFlower(g: Phaser.GameObjects.Graphics, tileId: number): void {
  const x = offset(tileId);
  g.fillStyle(0x68ad66, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0xfff3c4, 1);
  g.fillCircle(x + 12, 13, 3);
  g.fillCircle(x + 20, 21, 3);
  g.fillStyle(0xf0a9bd, 1);
  g.fillCircle(x + 16, 18, 3);
}

function drawDock(g: Phaser.GameObjects.Graphics, tileId: number): void {
  const x = offset(tileId);
  g.fillStyle(0xa96f3e, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.lineStyle(2, 0x6f4529, 0.55);
  g.lineBetween(x + 8, 0, x + 8, TILE_SIZE);
  g.lineBetween(x + 20, 0, x + 20, TILE_SIZE);
  g.lineBetween(x, 9, x + TILE_SIZE, 9);
  g.lineBetween(x, 22, x + TILE_SIZE, 22);
}

function drawPlot(g: Phaser.GameObjects.Graphics, tileId: number): void {
  const x = offset(tileId);
  g.fillStyle(0x4f7159, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x355343, 0.5);
  g.fillRect(x + 2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
  g.lineStyle(1, 0x9bc084, 0.24);
  g.lineBetween(x + 5, 7, x + TILE_SIZE - 5, 7);
  g.lineBetween(x + 5, TILE_SIZE - 7, x + TILE_SIZE - 5, TILE_SIZE - 7);
}

function drawRoof(g: Phaser.GameObjects.Graphics, tileId: number): void {
  const x = offset(tileId);
  g.fillStyle(0xca6f50, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0xe29a6d, 0.72);
  g.fillRect(x + 2, 4, TILE_SIZE - 4, 5);
  g.fillRect(x + 2, 18, TILE_SIZE - 4, 4);
}

function drawWall(g: Phaser.GameObjects.Graphics, tileId: number): void {
  const x = offset(tileId);
  g.fillStyle(0xe8d7b4, 1);
  g.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0xc1a982, 0.45);
  g.fillRect(x + 6, 6, 7, 8);
  g.fillRect(x + 19, 6, 7, 8);
  g.fillStyle(0x76533a, 0.75);
  g.fillRect(x + 13, 17, 7, 13);
}
