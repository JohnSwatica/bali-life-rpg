import Phaser from "phaser";
import type { CuratedCategory } from "../../data/curatedVenues";
import type { MapFeatureDefinition, RoadPathDefinition } from "../../data/berawaLayout";
import {
  TILESET_KEY,
  TILE_IDS,
  TILE_SIZE,
  TILE_WORLD,
  createOriginalStreetTileset,
  tileToWorld
} from "./TileStreetScale";
import {
  type StreetBuildingSlot,
  type StreetTemplate,
  isVerticalStreet,
  roadCenterTile,
  roadRightTile,
  streetEndTile
} from "./StreetTemplate";

export interface StreetRenderHandle {
  map: Phaser.Tilemaps.Tilemap;
  layer: Phaser.Tilemaps.TilemapLayer;
  buildings: Phaser.GameObjects.Graphics;
  props: Phaser.GameObjects.Graphics;
}

export interface StreetBuildingRect {
  slot: StreetBuildingSlot;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export function renderStreetTemplate(scene: Phaser.Scene, template: StreetTemplate): StreetRenderHandle {
  createOriginalStreetTileset(scene);
  const data = buildStreetTileData(template);
  const map = scene.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
  const tileset = map.addTilesetImage(TILESET_KEY, TILESET_KEY, TILE_SIZE, TILE_SIZE);
  if (!tileset) {
    throw new Error("Failed to create Bali street tileset");
  }
  const layer = map.createLayer(0, tileset, 0, 0);
  if (!layer) {
    throw new Error("Failed to create Bali street tile layer");
  }
  layer.setDepth(-120);

  const props = scene.add.graphics().setDepth(-95);
  drawStreetProps(props, template);

  const buildings = scene.add.graphics().setDepth(-90);
  drawStreetBuildings(buildings, template);

  return { map, layer, buildings, props };
}

export function buildStreetTileData(template: StreetTemplate): number[][] {
  const data = Array.from({ length: TILE_WORLD.heightTiles }, (_, y) =>
    Array.from({ length: TILE_WORLD.widthTiles }, (_, x) => ((x + y) % 9 === 0 ? TILE_IDS.grassShadow : TILE_IDS.grass))
  );

  paintStreetBase(data, template);
  paintBuildingPlots(data, template);
  paintBeachTerminus(data, template);
  return data;
}

export function getStreetBuildingRects(template: StreetTemplate): StreetBuildingRect[] {
  return template.slots.map((slot) => {
    const isVerticalSide = isVerticalStreet(template) && (slot.side === "left" || slot.side === "right");
    const width = (isVerticalSide ? slot.depthTiles : slot.widthTiles) * TILE_SIZE;
    const height = (isVerticalSide ? slot.widthTiles : slot.depthTiles) * TILE_SIZE;
    const x = slot.tileX * TILE_SIZE;
    const y = slot.tileY * TILE_SIZE;
    return {
      slot,
      x,
      y,
      width,
      height,
      centerX: x + width / 2,
      centerY: y + height / 2
    };
  });
}

export function getStreetRoadPaths(template: StreetTemplate): RoadPathDefinition[] {
  if (isVerticalStreet(template)) {
    const top = tileToWorld(roadCenterTile(template), template.start.tileY);
    const bottom = tileToWorld(roadCenterTile(template), streetEndTile(template));
    return [
      {
        id: `${template.id}-main-road`,
        name: template.name,
        width: template.roadWidthTiles * TILE_SIZE,
        points: [top, bottom],
        importance: "primary"
      }
    ];
  }
  const left = tileToWorld(template.start.tileX, template.start.tileY);
  const right = tileToWorld(template.start.tileX + template.lengthTiles - 1, template.start.tileY);
  return [
    {
      id: `${template.id}-main-road`,
      name: template.name,
      width: template.roadWidthTiles * TILE_SIZE,
      points: [left, right],
      importance: "primary"
    }
  ];
}

export function getStreetMapFeatures(template: StreetTemplate): MapFeatureDefinition[] {
  if (!template.beachTerminus || !isVerticalStreet(template)) {
    return [];
  }
  const y = template.beachTerminus.startsAtTile * TILE_SIZE;
  const waterY = (template.beachTerminus.startsAtTile + template.beachTerminus.sandTiles) * TILE_SIZE;
  return [
    {
      id: `${template.id}-beach`,
      kind: "beach",
      name: "Berawa Beach",
      closed: true,
      points: [
        { x: 0, y },
        { x: TILE_WORLD.width, y },
        { x: TILE_WORLD.width, y: waterY },
        { x: 0, y: waterY }
      ]
    },
    {
      id: `${template.id}-water`,
      kind: "water",
      name: "Indian Ocean",
      closed: true,
      points: [
        { x: 0, y: waterY },
        { x: TILE_WORLD.width, y: waterY },
        { x: TILE_WORLD.width, y: TILE_WORLD.height },
        { x: 0, y: TILE_WORLD.height }
      ]
    },
    {
      id: `${template.id}-shoreline`,
      kind: "coastline",
      name: "Berawa shore",
      closed: false,
      points: [
        { x: 0, y: waterY },
        { x: TILE_WORLD.width, y: waterY }
      ]
    }
  ];
}

function paintStreetBase(data: number[][], template: StreetTemplate): void {
  if (!isVerticalStreet(template)) {
    return;
  }

  const startY = template.start.tileY;
  const endY = streetEndTile(template);
  const roadLeft = template.roadLeftTile;
  const roadRight = roadRightTile(template);
  for (let y = startY; y <= endY; y += 1) {
    for (let x = roadLeft; x <= roadRight; x += 1) {
      setTile(data, x, y, TILE_IDS.road);
    }
    for (let x = roadLeft - template.sidewalkTiles; x < roadLeft; x += 1) {
      setTile(data, x, y, TILE_IDS.sidewalk);
    }
    for (let x = roadRight + 1; x <= roadRight + template.sidewalkTiles; x += 1) {
      setTile(data, x, y, TILE_IDS.sidewalk);
    }
  }
}

function paintBuildingPlots(data: number[][], template: StreetTemplate): void {
  for (const slot of template.slots) {
    paintSlotAccess(data, template, slot);
  }

  for (const rect of getStreetBuildingRects(template)) {
    const startX = Math.floor(rect.x / TILE_SIZE);
    const startY = Math.floor(rect.y / TILE_SIZE);
    const widthTiles = Math.max(1, Math.round(rect.width / TILE_SIZE));
    const heightTiles = Math.max(1, Math.round(rect.height / TILE_SIZE));
    for (let y = startY; y < startY + heightTiles; y += 1) {
      for (let x = startX; x < startX + widthTiles; x += 1) {
        setTile(data, x, y, TILE_IDS.plot);
      }
    }
  }
}

function paintSlotAccess(data: number[][], template: StreetTemplate, slot: StreetBuildingSlot): void {
  if (!isVerticalStreet(template) || (slot.side !== "left" && slot.side !== "right")) {
    return;
  }
  const entranceY = slot.entrance.tileY;
  const leftEdge = Math.min(slot.entrance.tileX, template.roadLeftTile);
  const rightEdge = Math.max(slot.entrance.tileX, roadRightTile(template));
  for (let x = leftEdge; x <= rightEdge; x += 1) {
    setTile(data, x, entranceY, TILE_IDS.sidewalk);
  }
  if (entranceY < template.start.tileY) {
    for (let x = template.roadLeftTile; x <= roadRightTile(template); x += 1) {
      setTile(data, x, entranceY, TILE_IDS.road);
    }
  }
}

function paintBeachTerminus(data: number[][], template: StreetTemplate): void {
  if (!template.beachTerminus) {
    return;
  }
  const sandStart = template.beachTerminus.startsAtTile;
  const waterStart = sandStart + template.beachTerminus.sandTiles;
  for (let y = sandStart; y < waterStart; y += 1) {
    for (let x = 0; x < TILE_WORLD.widthTiles; x += 1) {
      setTile(data, x, y, TILE_IDS.sand);
    }
  }
  for (let y = waterStart; y < TILE_WORLD.heightTiles; y += 1) {
    for (let x = 0; x < TILE_WORLD.widthTiles; x += 1) {
      setTile(data, x, y, y === waterStart ? TILE_IDS.waterEdge : y - waterStart < 4 ? TILE_IDS.shallowWater : TILE_IDS.deepWater);
    }
  }

  for (let y = sandStart - 1; y < waterStart + 4; y += 1) {
    setTile(data, template.beachTerminus.dockTileX, y, TILE_IDS.dock);
    setTile(data, template.beachTerminus.dockTileX + 1, y, TILE_IDS.dock);
  }
}

function drawStreetBuildings(g: Phaser.GameObjects.Graphics, template: StreetTemplate): void {
  for (const rect of getStreetBuildingRects(template)) {
    if (!rect.slot.venueId) {
      continue;
    }
    const palette = buildingPalette(rect.slot.category, rect.slot.isLandmark);
    const shadowOffset = 4;
    g.fillStyle(0x24312a, 0.22);
    g.fillRoundedRect(rect.x + shadowOffset, rect.y + shadowOffset, rect.width, rect.height, 3);
    g.fillStyle(palette.wall, 1);
    g.fillRoundedRect(rect.x, rect.y + rect.height * 0.32, rect.width, rect.height * 0.68, 3);
    g.fillStyle(palette.roof, 1);
    g.fillRoundedRect(rect.x - 3, rect.y, rect.width + 6, rect.height * 0.48, 4);
    g.fillStyle(palette.roofLight, 0.72);
    g.fillRect(rect.x + 6, rect.y + 7, Math.max(8, rect.width - 12), 5);
    g.fillStyle(0x5e3f2d, 0.82);
    const doorWidth = Math.max(10, Math.min(22, rect.width * 0.18));
    g.fillRoundedRect(rect.centerX - doorWidth / 2, rect.y + rect.height - 21, doorWidth, 20, 2);
    g.fillStyle(0xf7eac1, 0.9);
    const windowWidth = Math.max(10, Math.min(18, rect.width * 0.18));
    g.fillRoundedRect(rect.x + 9, rect.y + rect.height * 0.48, windowWidth, 13, 2);
    g.fillRoundedRect(rect.x + rect.width - windowWidth - 9, rect.y + rect.height * 0.48, windowWidth, 13, 2);
  }
}

function drawStreetProps(g: Phaser.GameObjects.Graphics, template: StreetTemplate): void {
  for (let y = 8; y < TILE_WORLD.heightTiles - 12; y += 7) {
    drawTreeCanopy(g, 11 * TILE_SIZE, y * TILE_SIZE + 16);
    drawTreeCanopy(g, (TILE_WORLD.widthTiles - 12) * TILE_SIZE, y * TILE_SIZE + 16);
  }

  if (template.beachTerminus) {
    const sandY = template.beachTerminus.startsAtTile * TILE_SIZE;
    for (let x = 8 * TILE_SIZE; x < TILE_WORLD.width - 8 * TILE_SIZE; x += 8 * TILE_SIZE) {
      drawPalm(g, x, sandY + 54 + ((x / TILE_SIZE) % 3) * 8);
    }
  }
}

function drawTreeCanopy(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0x82572f, 1);
  g.fillRoundedRect(x - 5, y + 12, 10, 18, 4);
  g.fillStyle(0x2f8848, 1);
  g.fillCircle(x - 10, y, 17);
  g.fillCircle(x + 11, y, 17);
  g.fillCircle(x, y - 15, 18);
  g.fillStyle(0x66b66a, 0.82);
  g.fillCircle(x - 8, y - 10, 5);
}

function drawPalm(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.lineStyle(7, 0x8b5f2f, 1);
  g.lineBetween(x, y + 22, x + 7, y - 12);
  g.lineStyle(6, 0x2f8848, 1);
  for (let index = 0; index < 6; index += 1) {
    const angle = (-Math.PI / 2) + (index - 2.5) * 0.45;
    g.lineBetween(x + 7, y - 12, x + 7 + Math.cos(angle) * 34, y - 12 + Math.sin(angle) * 18);
  }
}

function buildingPalette(category: CuratedCategory | undefined, isLandmark = false): { roof: number; roofLight: number; wall: number } {
  if (isLandmark || category === "beach_club") {
    return { roof: 0x40a7b2, roofLight: 0x87d8d4, wall: 0xf0dfb9 };
  }
  if (category === "coffee" || category === "cafe" || category === "bakery") {
    return { roof: 0xc96f4f, roofLight: 0xf1a16f, wall: 0xf2dfb8 };
  }
  if (category === "grocery" || category === "shop") {
    return { roof: 0x669b5a, roofLight: 0xa4d47d, wall: 0xf0dfb9 };
  }
  if (category === "bar" || category === "restaurant") {
    return { roof: 0x8d6ac8, roofLight: 0xc0a9e8, wall: 0xeedcb8 };
  }
  return { roof: 0xb96d52, roofLight: 0xe39b72, wall: 0xf0dfb9 };
}

function setTile(data: number[][], x: number, y: number, tileId: number): void {
  if (y < 0 || y >= data.length || x < 0 || x >= data[y].length) {
    return;
  }
  data[y][x] = tileId;
}
