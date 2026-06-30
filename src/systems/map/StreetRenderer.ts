import Phaser from "phaser";
import type { CuratedCategory } from "../../data/curatedVenues";
import { getStationVisualForVenue, type StationVisualDefinition } from "../../data/stationVisuals";
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
  signs: Phaser.GameObjects.Text[];
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

interface BuildingPalette {
  roof: number;
  roofLight: number;
  wall: number;
  trim: number;
  sign: number;
  accent: number;
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

  const signs = createStreetSigns(scene, template);

  return { map, layer, buildings, props, signs };
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
    const stationVisual = getStationVisualForVenue(rect.slot.venueId, rect.slot.category);
    const palette = stationVisual?.palette ?? buildingPalette(rect.slot.category, rect.slot.isLandmark, hashString(rect.slot.venueId));
    const shadowOffset = 4;
    drawEntranceMat(g, rect, palette);
    g.fillStyle(0x24312a, 0.22);
    g.fillRoundedRect(rect.x + shadowOffset, rect.y + shadowOffset, rect.width, rect.height, 3);
    g.fillStyle(palette.wall, 1);
    g.fillRoundedRect(rect.x, rect.y + rect.height * 0.32, rect.width, rect.height * 0.68, 3);
    g.fillStyle(palette.roof, 1);
    g.fillRoundedRect(rect.x - 3, rect.y, rect.width + 6, rect.height * 0.48, 4);
    g.fillStyle(palette.roofLight, 0.72);
    g.fillRect(rect.x + 6, rect.y + 7, Math.max(8, rect.width - 12), 5);
    drawRoadFacingFacade(g, rect, palette);
    drawCategoryDetails(g, rect, palette, stationVisual);
  }
}

function createStreetSigns(scene: Phaser.Scene, template: StreetTemplate): Phaser.GameObjects.Text[] {
  return getStreetBuildingRects(template)
    .filter((rect) => rect.slot.venueId && rect.slot.label)
    .map((rect) => {
      const stationVisual = getStationVisualForVenue(rect.slot.venueId, rect.slot.category);
      const palette = stationVisual?.palette ?? buildingPalette(rect.slot.category, rect.slot.isLandmark, hashString(rect.slot.venueId ?? rect.slot.id));
      const sign = signPosition(rect);
      return scene.add
        .text(sign.x, sign.y, stationVisual?.signLabel ?? compactVenueName(rect.slot.label ?? rect.slot.venueId ?? ""), {
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: rect.slot.isLandmark ? "10px" : "9px",
          fontStyle: "800",
          color: "#fff8de",
          align: "center",
          backgroundColor: colorToCss(palette.sign),
          padding: { x: 4, y: 2 },
          wordWrap: { width: Math.max(46, Math.min(92, rect.width - 12)), useAdvancedWrap: true }
        })
        .setOrigin(0.5)
        .setDepth(-82)
        .setResolution(2);
    });
}

function drawEntranceMat(g: Phaser.GameObjects.Graphics, rect: StreetBuildingRect, palette: BuildingPalette): void {
  const side = rect.slot.side;
  const matWidth = 22;
  const matHeight = 34;
  const matX = side === "left" ? rect.x + rect.width + 4 : rect.x - matWidth - 4;
  const matY = rect.centerY - matHeight / 2;
  g.fillStyle(palette.accent, 0.38);
  g.fillRoundedRect(matX, matY, matWidth, matHeight, 3);
  g.lineStyle(2, palette.trim, 0.45);
  g.strokeRoundedRect(matX, matY, matWidth, matHeight, 3);
}

function drawRoadFacingFacade(g: Phaser.GameObjects.Graphics, rect: StreetBuildingRect, palette: BuildingPalette): void {
  const side = rect.slot.side;
  const isLeftSide = side === "left";
  const frontX = isLeftSide ? rect.x + rect.width : rect.x;
  const facadeX = isLeftSide ? frontX - 13 : frontX;
  const awningX = isLeftSide ? frontX - 38 : frontX + 2;
  const doorX = isLeftSide ? frontX - 16 : frontX + 6;
  const windowX = isLeftSide ? frontX - 18 : frontX + 8;

  g.fillStyle(palette.trim, 0.7);
  g.fillRect(facadeX, rect.y + 6, 13, rect.height - 12);

  g.fillStyle(palette.sign, 1);
  g.fillRoundedRect(awningX, rect.centerY - 45, 36, 15, 3);
  for (let index = 0; index < 4; index += 1) {
    g.fillStyle(index % 2 === 0 ? palette.roofLight : 0xfff1c6, 0.82);
    g.fillRect(awningX + index * 9, rect.centerY - 30, 8, 9);
  }

  g.fillStyle(0x5e3f2d, 0.86);
  g.fillRoundedRect(doorX, rect.centerY + 6, 10, 25, 2);
  g.fillStyle(0xf7eac1, 0.9);
  g.fillRoundedRect(windowX, rect.centerY - 12, 10, 12, 2);
  g.fillRoundedRect(windowX, rect.centerY + 38, 10, 12, 2);
}

function drawCategoryDetails(
  g: Phaser.GameObjects.Graphics,
  rect: StreetBuildingRect,
  palette: BuildingPalette,
  stationVisual?: StationVisualDefinition
): void {
  const category = rect.slot.category;
  const side = rect.slot.side;
  const outsideX = side === "left" ? rect.x + rect.width + 34 : rect.x - 34;
  const direction = side === "left" ? 1 : -1;
  const baseY = rect.centerY;

  if (stationVisual?.prop === "laptop_table") {
    drawLaptopTable(g, outsideX, baseY - 10, palette);
    drawMenuBoard(g, outsideX + direction * 20, baseY + 26, palette);
    return;
  }

  if (stationVisual?.prop === "surf_reset") {
    drawSurfReset(g, outsideX, baseY - 18, palette);
    return;
  }

  if (stationVisual?.prop === "club_rope") {
    drawClubRope(g, outsideX, baseY - 12, direction, palette);
    return;
  }

  if (stationVisual?.prop === "warung_steam") {
    drawWarungSteam(g, outsideX, baseY, palette);
    return;
  }

  if (stationVisual?.prop === "coworking_desks") {
    drawCoworkingDesks(g, outsideX, baseY, palette);
    return;
  }

  if (rect.slot.venueId?.includes("scooter") || rect.slot.label?.toLowerCase().includes("scooter")) {
    drawParkedScooter(g, outsideX, baseY - 18, direction, 0xe35d4f);
    drawParkedScooter(g, outsideX, baseY + 16, direction, 0x4e9fd6);
    return;
  }

  if (category === "cafe" || category === "coffee" || category === "bakery") {
    drawCafeTable(g, outsideX, baseY - 14, palette);
    drawMenuBoard(g, outsideX + direction * 16, baseY + 22, palette);
    return;
  }

  if (category === "grocery" || category === "shop") {
    drawCrates(g, outsideX, baseY, palette);
    return;
  }

  if (category === "beach_club" || category === "beach") {
    drawUmbrella(g, outsideX, baseY - 20, palette);
    drawSurfboards(g, outsideX + direction * 18, baseY + 20, palette);
    return;
  }

  if (category === "bar" || category === "restaurant") {
    drawLanterns(g, outsideX, baseY - 24, palette);
    drawMenuBoard(g, outsideX, baseY + 26, palette);
    return;
  }

  drawPlanter(g, outsideX, baseY, palette);
}

function drawCafeTable(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  g.fillStyle(0x000000, 0.13);
  g.fillEllipse(x, y + 4, 32, 12, 24);
  g.fillStyle(palette.sign, 1);
  g.fillCircle(x, y, 9);
  g.fillStyle(0xf7eac1, 1);
  g.fillCircle(x - 16, y, 5);
  g.fillCircle(x + 16, y, 5);
  g.fillCircle(x, y - 16, 5);
  g.fillCircle(x, y + 16, 5);
}

function drawLaptopTable(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  drawCafeTable(g, x, y, palette);
  g.fillStyle(0x23313a, 1);
  g.fillRoundedRect(x - 9, y - 6, 18, 12, 2);
  g.fillStyle(0x94d9d2, 0.95);
  g.fillRect(x - 6, y - 3, 12, 6);
  g.fillStyle(0xfff1c6, 1);
  g.fillCircle(x + 18, y - 10, 4);
}

function drawSurfReset(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  drawUmbrella(g, x - 8, y, palette);
  drawSurfboards(g, x + 22, y + 26, palette);
  g.lineStyle(3, 0x3f91c9, 0.8);
  g.beginPath();
  g.arc(x - 6, y + 36, 22, Math.PI * 1.05, Math.PI * 1.72);
  g.strokePath();
  g.lineStyle(2, 0xffffff, 0.68);
  g.beginPath();
  g.arc(x - 4, y + 37, 15, Math.PI * 1.08, Math.PI * 1.62);
  g.strokePath();
}

function drawClubRope(g: Phaser.GameObjects.Graphics, x: number, y: number, direction: number, palette: BuildingPalette): void {
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(x, y + 40, 70, 18, 24);
  for (const dx of [-26, 26]) {
    g.fillStyle(palette.sign, 1);
    g.fillRoundedRect(x + dx - 3, y + 2, 6, 42, 3);
    g.fillStyle(palette.accent, 1);
    g.fillCircle(x + dx, y, 6);
  }
  g.lineStyle(4, palette.accent, 0.9);
  g.lineBetween(x - 26, y + 18, x + 26, y + 18);
  drawSpeaker(g, x + direction * 42, y + 14, palette);
}

function drawSpeaker(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  g.fillStyle(0x1f2930, 1);
  g.fillRoundedRect(x - 10, y - 18, 20, 36, 3);
  g.fillStyle(palette.accent, 0.85);
  g.fillCircle(x, y - 7, 5);
  g.fillCircle(x, y + 9, 7);
}

function drawWarungSteam(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  g.fillStyle(0x000000, 0.13);
  g.fillEllipse(x, y + 24, 58, 14, 24);
  g.fillStyle(palette.trim, 1);
  g.fillRoundedRect(x - 28, y - 4, 56, 26, 4);
  g.fillStyle(palette.roofLight, 1);
  g.fillRoundedRect(x - 22, y - 14, 44, 13, 3);
  g.fillStyle(0xf7eac1, 1);
  for (const dx of [-14, 0, 14]) {
    g.fillCircle(x + dx, y + 5, 6);
  }
  g.lineStyle(2, 0xffffff, 0.5);
  for (const dx of [-12, 2, 16]) {
    g.beginPath();
    g.arc(x + dx, y - 12, 6, Math.PI * 0.65, Math.PI * 1.4);
    g.strokePath();
  }
}

function drawCoworkingDesks(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(x, y + 26, 64, 14, 24);
  for (const [dx, dy] of [
    [-18, -6],
    [18, 10]
  ] as const) {
    g.fillStyle(palette.sign, 1);
    g.fillRoundedRect(x + dx - 15, y + dy - 5, 30, 14, 3);
    g.fillStyle(0xf7eac1, 1);
    g.fillRoundedRect(x + dx - 8, y + dy - 13, 16, 10, 2);
    g.fillStyle(palette.accent, 1);
    g.fillRect(x + dx - 5, y + dy - 10, 10, 4);
  }
}

function drawMenuBoard(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  g.fillStyle(0x5b3c2c, 1);
  g.fillRoundedRect(x - 9, y - 13, 18, 26, 2);
  g.fillStyle(palette.roofLight, 0.9);
  g.fillRect(x - 5, y - 7, 10, 2);
  g.fillRect(x - 5, y, 9, 2);
  g.fillRect(x - 5, y + 7, 7, 2);
}

function drawCrates(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  const colors = [0xf2c35d, 0xd95b43, 0x7fc56b];
  colors.forEach((color, index) => {
    g.fillStyle(0x76533a, 1);
    g.fillRoundedRect(x - 20 + index * 15, y + (index % 2) * 9, 14, 12, 2);
    g.fillStyle(color, 1);
    g.fillCircle(x - 13 + index * 15, y + 5 + (index % 2) * 9, 4);
  });
  drawPlanter(g, x + 22, y - 14, palette);
}

function drawUmbrella(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  g.fillStyle(palette.roof, 1);
  g.beginPath();
  g.moveTo(x, y - 18);
  g.lineTo(x - 26, y + 6);
  g.lineTo(x + 26, y + 6);
  g.closePath();
  g.fillPath();
  g.lineStyle(2, 0xfff1c6, 0.75);
  g.lineBetween(x, y - 18, x, y + 18);
  g.lineBetween(x, y - 18, x - 17, y + 6);
  g.lineBetween(x, y - 18, x + 17, y + 6);
}

function drawSurfboards(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  g.fillStyle(palette.accent, 1);
  g.fillRoundedRect(x - 14, y - 18, 8, 36, 5);
  g.fillStyle(0xfff1c6, 1);
  g.fillRoundedRect(x, y - 20, 8, 40, 5);
  g.lineStyle(2, palette.sign, 0.8);
  g.lineBetween(x + 4, y - 15, x + 4, y + 15);
}

function drawLanterns(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  g.lineStyle(2, 0x5b3c2c, 0.85);
  g.lineBetween(x - 18, y, x + 18, y);
  for (const dx of [-14, 0, 14]) {
    g.fillStyle(palette.accent, 1);
    g.fillCircle(x + dx, y + 8, 6);
    g.fillStyle(0xfff1c6, 0.8);
    g.fillCircle(x + dx - 1, y + 6, 2);
  }
}

function drawParkedScooter(g: Phaser.GameObjects.Graphics, x: number, y: number, direction: number, color: number): void {
  g.fillStyle(0x1f2930, 1);
  g.fillCircle(x - direction * 13, y + 6, 5);
  g.fillCircle(x + direction * 14, y + 6, 5);
  g.fillStyle(color, 1);
  g.fillRoundedRect(x - 11, y - 4, 22, 9, 5);
  g.fillStyle(0xfff1c6, 0.8);
  g.fillCircle(x + direction * 19, y - 4, 2.5);
}

function drawPlanter(g: Phaser.GameObjects.Graphics, x: number, y: number, palette: BuildingPalette): void {
  g.fillStyle(0x8b5f2f, 1);
  g.fillRoundedRect(x - 14, y + 5, 28, 12, 3);
  g.fillStyle(palette.accent, 1);
  g.fillCircle(x - 8, y + 3, 6);
  g.fillCircle(x + 1, y, 7);
  g.fillCircle(x + 9, y + 4, 6);
}

function signPosition(rect: StreetBuildingRect): { x: number; y: number } {
  const x = rect.slot.side === "left" ? rect.x + rect.width - 39 : rect.x + 39;
  return {
    x,
    y: rect.centerY - 37
  };
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

function compactVenueName(name: string): string {
  const manual: Record<string, string> = {
    "Behind The Green Door": "GREEN\nDOOR",
    "Golden Monkey Chinese Restaurant": "GOLDEN\nMONKEY",
    "L'Osteria Funiculì Funiculà Canggu": "L'OSTERIA",
    "Satu-Satu Coffee Company": "SATU\nSATU",
    "Bali Family Rental Scooter": "SCOOTER\nRENTAL",
    "Milk & Madu Berawa": "MILK &\nMADU",
    "FINNS Recreation Club": "FINNS\nREC",
    "FINNS Beach Club": "FINNS\nBEACH",
    "Atlas Beach Fest": "ATLAS",
    "Berawa Beach": "BERAWA\nBEACH",
    "Bungalow Living Bali": "BUNGALOW",
    "Monsieur Spoon Berawa": "MONSIEUR\nSPOON",
    "Canggu Station": "CANGGU\nSTATION"
  };
  if (manual[name]) {
    return manual[name];
  }
  return name
    .replace(/\b(Berawa|Canggu|Bali|Cafe|Restaurant)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, 18);
}

function colorToCss(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

function hashString(value: string | undefined): number {
  let hash = 0;
  for (const char of value ?? "") {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function buildingPalette(category: CuratedCategory | undefined, isLandmark = false, seed = 0): BuildingPalette {
  if (isLandmark || category === "beach_club") {
    const options: BuildingPalette[] = [
      { roof: 0x40a7b2, roofLight: 0x87d8d4, wall: 0xf0dfb9, trim: 0x2a7f8a, sign: 0x145c66, accent: 0xf6c85f },
      { roof: 0x2f87c2, roofLight: 0x8ed3f5, wall: 0xf2dfb8, trim: 0x236a9a, sign: 0x1b5274, accent: 0xffd77a }
    ];
    return options[seed % options.length];
  }
  if (category === "coffee" || category === "cafe" || category === "bakery") {
    const options: BuildingPalette[] = [
      { roof: 0xc96f4f, roofLight: 0xf1a16f, wall: 0xf2dfb8, trim: 0x8d4f3a, sign: 0x693a2e, accent: 0x2e7d78 },
      { roof: 0xd89a42, roofLight: 0xffc56f, wall: 0xf5e4bd, trim: 0xa96f3e, sign: 0x6f4529, accent: 0x3f8f5f },
      { roof: 0x7fa7c7, roofLight: 0xb8d9ec, wall: 0xf0dfb9, trim: 0x517995, sign: 0x2f5568, accent: 0xd66f5c }
    ];
    return options[seed % options.length];
  }
  if (category === "grocery" || category === "shop") {
    const options: BuildingPalette[] = [
      { roof: 0x669b5a, roofLight: 0xa4d47d, wall: 0xf0dfb9, trim: 0x3f7544, sign: 0x2f6238, accent: 0xf2c35d },
      { roof: 0x4f9b88, roofLight: 0x8dd2be, wall: 0xf2dfb8, trim: 0x2f7468, sign: 0x23594f, accent: 0xf28b5d }
    ];
    return options[seed % options.length];
  }
  if (category === "bar" || category === "restaurant") {
    const options: BuildingPalette[] = [
      { roof: 0x8d6ac8, roofLight: 0xc0a9e8, wall: 0xeedcb8, trim: 0x644d96, sign: 0x4b3a75, accent: 0xf0b35f },
      { roof: 0x2f6f78, roofLight: 0x73b7bc, wall: 0xf0dfb9, trim: 0x23565d, sign: 0x1f454b, accent: 0xd95b43 },
      { roof: 0xb95f61, roofLight: 0xea9393, wall: 0xf2dfb8, trim: 0x7a4243, sign: 0x633031, accent: 0xffd166 }
    ];
    return options[seed % options.length];
  }
  return { roof: 0xb96d52, roofLight: 0xe39b72, wall: 0xf0dfb9, trim: 0x81513d, sign: 0x65402f, accent: 0x7fc56b };
}

function setTile(data: number[][], x: number, y: number, tileId: number): void {
  if (y < 0 || y >= data.length || x < 0 || x >= data[y].length) {
    return;
  }
  data[y][x] = tileId;
}
