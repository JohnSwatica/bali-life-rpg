import Phaser from "phaser";
import type { CuratedCategory } from "../../data/curatedVenues";
import { interiorDefinitions } from "../../data/interiors";
import { getStationVisualForVenue, type StationVisualDefinition } from "../../data/stationVisuals";
import {
  paddyFieldPatches,
  streetLandmarks,
  streetTextureProps,
  villaGateDressings,
  walkableStreetParcels
} from "../../data/worldDressing";
import type { MapFeatureDefinition, RoadPathDefinition } from "../../data/berawaLayout";
import {
  TILESET_KEY,
  TILE_IDS,
  TILE_SIZE,
  TILE_WORLD,
  createOriginalStreetTileset,
  tileToWorld
} from "./TileStreetScale";
import { paddyFieldState } from "./PaddyFields";
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
  landmarks: Phaser.GameObjects.Graphics;
  signs: StreetSignHandle[];
}

export interface StreetSignHandle {
  venueId: string;
  label: Phaser.GameObjects.Text;
}

export interface StreetSignCandidate {
  venueId: string;
  x: number;
  y: number;
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

const AMBIENT_STREET_PALETTE: BuildingPalette = {
  roof: 0x40a7b2,
  roofLight: 0x87d8d4,
  wall: 0xf0dfb9,
  trim: 0x4f7f5a,
  sign: 0x23594f,
  accent: 0xf2c35d
};

const ENTERABLE_INTERIOR_VENUE_IDS = new Set(Object.values(interiorDefinitions).map((interior) => interior.venueId));

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
  createLockedAlleyCue(scene, template);

  const buildings = scene.add.graphics().setDepth(-90);
  drawStreetBuildings(buildings, template);

  const landmarks = scene.add.graphics().setDepth(-78);
  drawStreetLandmarks(landmarks, template);

  const signs = createStreetSigns(scene, template);

  return { map, layer, buildings, props, landmarks, signs };
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
  const roadLeft = template.roadLeftTile;
  const roadRight = roadRightTile(template);
  const isLeftSide = slot.side === "left";
  const nearRoadEdge = isLeftSide ? roadLeft - 1 : roadRight + 1;
  const leftEdge = isLeftSide ? Math.min(slot.entrance.tileX, nearRoadEdge) : nearRoadEdge;
  const rightEdge = isLeftSide ? nearRoadEdge : Math.max(slot.entrance.tileX, nearRoadEdge);
  for (let x = leftEdge; x <= rightEdge; x += 1) {
    setTile(data, x, entranceY, TILE_IDS.sidewalk);
  }
  if (entranceY < template.start.tileY) {
    for (let x = roadLeft; x <= roadRight; x += 1) {
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
    const isEnterable = isStreetBuildingEnterable(rect.slot);
    const shadowOffset = 7;
    drawEntranceMat(g, rect, palette, isEnterable);
    g.fillStyle(0x101820, 0.34);
    g.fillRoundedRect(rect.x + shadowOffset, rect.y + shadowOffset, rect.width, rect.height, 5);
    g.fillStyle(0x253a35, 0.5);
    g.fillRoundedRect(rect.x - 2, rect.y - 2, rect.width + 4, rect.height + 4, 5);
    g.fillStyle(palette.wall, 1);
    g.fillRoundedRect(rect.x + 2, rect.y + rect.height * 0.32, rect.width - 4, rect.height * 0.66, 3);
    g.fillStyle(palette.roof, 1);
    g.fillRoundedRect(rect.x - 4, rect.y - 3, rect.width + 8, rect.height * 0.5, 5);
    g.fillStyle(palette.roofLight, 0.72);
    g.fillRect(rect.x + 6, rect.y + 7, Math.max(8, rect.width - 12), 5);
    g.lineStyle(2, 0x101820, 0.28);
    g.strokeRoundedRect(rect.x - 3, rect.y - 2, rect.width + 6, rect.height + 3, 5);
    drawRoadFacingFacade(g, rect, palette, isEnterable);
    drawCategoryDetails(g, rect, palette, stationVisual);
  }
}

function createStreetSigns(scene: Phaser.Scene, template: StreetTemplate): StreetSignHandle[] {
  return getStreetBuildingRects(template)
    .filter((rect) => rect.slot.venueId && rect.slot.label)
    .map((rect) => {
      const stationVisual = getStationVisualForVenue(rect.slot.venueId, rect.slot.category);
      const palette = stationVisual?.palette ?? buildingPalette(rect.slot.category, rect.slot.isLandmark, hashString(rect.slot.venueId ?? rect.slot.id));
      const sign = signPosition(rect);
      const label = scene.add.text(sign.x, sign.y, getStreetSignPrimaryText(rect.slot), {
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
      return { venueId: rect.slot.venueId!, label };
    });
}

export function selectVisibleStreetSignIds(
  signs: StreetSignCandidate[],
  player: { x: number; y: number },
  maxCount = 3,
  maxDistance = 380
): string[] {
  return signs
    .map((sign) => ({ sign, distance: Math.hypot(sign.x - player.x, sign.y - player.y) }))
    .filter(({ distance }) => distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance || a.sign.venueId.localeCompare(b.sign.venueId))
    .slice(0, Math.max(0, maxCount))
    .map(({ sign }) => sign.venueId);
}

export function getStreetSignPrimaryText(slot: Pick<StreetBuildingSlot, "label" | "venueId">): string {
  return compactVenueName(slot.label ?? slot.venueId ?? "");
}

export function getPermanentlySignedVenueIds(template: StreetTemplate): Set<string> {
  return new Set(
    template.slots
      .filter((slot) => slot.venueId && slot.label)
      .map((slot) => slot.venueId!)
  );
}

export function isStreetBuildingEnterable(slot: Pick<StreetBuildingSlot, "venueId">): boolean {
  return Boolean(slot.venueId && ENTERABLE_INTERIOR_VENUE_IDS.has(slot.venueId));
}

export function getEnterableStreetVenueIds(template: StreetTemplate): Set<string> {
  return new Set(
    template.slots
      .filter((slot) => slot.venueId && isStreetBuildingEnterable(slot))
      .map((slot) => slot.venueId!)
  );
}

function drawEntranceMat(g: Phaser.GameObjects.Graphics, rect: StreetBuildingRect, palette: BuildingPalette, isEnterable: boolean): void {
  const side = rect.slot.side;
  const matWidth = isEnterable ? 28 : 22;
  const matHeight = isEnterable ? 40 : 34;
  const matX = side === "left" ? rect.x + rect.width + 4 : rect.x - matWidth - 4;
  const matY = rect.centerY - matHeight / 2;
  g.fillStyle(isEnterable ? 0xffe2a0 : palette.accent, isEnterable ? 0.5 : 0.38);
  g.fillRoundedRect(matX, matY, matWidth, matHeight, 3);
  g.lineStyle(isEnterable ? 3 : 2, isEnterable ? palette.accent : palette.trim, isEnterable ? 0.75 : 0.45);
  g.strokeRoundedRect(matX, matY, matWidth, matHeight, 3);
}

function drawRoadFacingFacade(
  g: Phaser.GameObjects.Graphics,
  rect: StreetBuildingRect,
  palette: BuildingPalette,
  isEnterable: boolean
): void {
  const side = rect.slot.side;
  const isLeftSide = side === "left";
  const frontX = isLeftSide ? rect.x + rect.width : rect.x;
  const facadeX = isLeftSide ? frontX - 13 : frontX;
  const awningX = isLeftSide ? frontX - 38 : frontX + 2;
  const doorX = isLeftSide ? frontX - (isEnterable ? 20 : 16) : frontX + 6;
  const windowX = isLeftSide ? frontX - 18 : frontX + 8;
  const doorY = rect.centerY + 6;
  const doorWidth = isEnterable ? 14 : 10;
  const doorHeight = isEnterable ? 28 : 25;

  g.fillStyle(palette.trim, 0.7);
  g.fillRect(facadeX, rect.y + 6, 13, rect.height - 12);

  g.fillStyle(palette.sign, 1);
  g.fillRoundedRect(awningX, rect.centerY - 45, 36, 15, 3);
  for (let index = 0; index < 4; index += 1) {
    g.fillStyle(index % 2 === 0 ? palette.roofLight : 0xfff1c6, 0.82);
    g.fillRect(awningX + index * 9, rect.centerY - 30, 8, 9);
  }

  if (isEnterable) {
    const spillX = isLeftSide ? frontX + 34 : frontX - 34;
    g.fillStyle(0xffefbd, 0.22);
    g.beginPath();
    g.moveTo(frontX, doorY + 2);
    g.lineTo(spillX, doorY - 6);
    g.lineTo(spillX, doorY + doorHeight + 8);
    g.lineTo(frontX, doorY + doorHeight);
    g.closePath();
    g.fillPath();
    g.lineStyle(2, 0xfff1c6, 0.38);
    g.lineBetween(frontX, doorY + 3, spillX, doorY - 5);
    g.lineBetween(frontX, doorY + doorHeight - 2, spillX, doorY + doorHeight + 6);
  }

  g.fillStyle(0x5e3f2d, 0.86);
  g.fillRoundedRect(doorX, doorY, doorWidth, doorHeight, 2);
  if (isEnterable) {
    g.fillStyle(0xfff1c6, 0.86);
    g.fillRoundedRect(doorX + 3, doorY + 4, 3, doorHeight - 8, 1);
    g.fillCircle(doorX + doorWidth - 3, doorY + doorHeight * 0.55, 1.5);
  }
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
  if (!isVerticalStreet(template)) {
    return;
  }

  drawPaddyFields(g, template);
  drawWalkableParcels(g, template);
  drawVillaDropoffGates(g, template);
  drawCorridorAmbientProps(g, template);
  drawStreetTextureProps(g);
  drawBeachAmbientProps(g, template);
}

function drawWalkableParcels(g: Phaser.GameObjects.Graphics, template: StreetTemplate): void {
  for (const parcel of walkableStreetParcels.filter((candidate) => candidate.templateId === template.id)) {
    const x = parcel.tileX * TILE_SIZE;
    const y = parcel.tileY * TILE_SIZE;
    const width = parcel.widthTiles * TILE_SIZE;
    const height = parcel.heightTiles * TILE_SIZE;
    if (parcel.kind === "bus_dropoff") {
      g.fillStyle(0x101820, 0.22);
      g.fillRoundedRect(x + 3, y + 4, width, height, 5);
      g.fillStyle(0x77746d, 1);
      g.fillRoundedRect(x, y, width, height, 5);
      g.lineStyle(2, 0xf2c35d, 0.92);
      g.lineBetween(x + 10, y + height - 7, x + width - 10, y + height - 7);
      for (let offset = 18; offset < width - 12; offset += 34) {
        g.lineBetween(x + offset, y + 6, x + offset + 14, y + 6);
      }
      continue;
    }
    if (parcel.kind === "gated_alley") {
      g.fillStyle(0x2a211b, 0.22);
      g.fillRoundedRect(x + 3, y + 4, width, height, 5);
      g.fillStyle(0x8b8068, 1);
      g.fillRoundedRect(x, y, width, height, 5);
      g.lineStyle(2, 0xb8aa8c, 0.5);
      for (let seam = 12; seam < width; seam += 24) g.lineBetween(x + seam, y + 3, x + seam - 6, y + height - 3);
      const gateX = x + width - 18;
      g.fillStyle(0x253a35, 1);
      g.fillRect(gateX, y - 2, 8, height + 4);
      g.fillRect(gateX + 13, y - 2, 8, height + 4);
      g.lineStyle(4, 0x4f7f5a, 1);
      for (let barY = y + 7; barY < y + height; barY += 13) g.lineBetween(gateX, barY, gateX + 21, barY);
      g.fillStyle(0xf2c35d, 1);
      g.fillRoundedRect(gateX + 7, y + height / 2 - 6, 8, 12, 2);
      continue;
    }
    g.fillStyle(0x4d3825, 0.18);
    g.fillRoundedRect(x + 3, y + 5, width, height, 8);
    g.fillStyle(0xb88b55, 1);
    g.fillRoundedRect(x, y, width, height, 8);
    g.lineStyle(2, 0xe0bb78, 0.55);
    g.strokeRoundedRect(x + 2, y + 2, width - 4, height - 4, 7);
    for (let offset = 18; offset < width - 10; offset += 38) {
      g.fillStyle(offset % 76 === 18 ? 0x8f6841 : 0xd1a968, 0.58);
      g.fillEllipse(x + offset, y + height / 2 + (offset % 3) - 1, 12, 4);
    }
  }
}

function createLockedAlleyCue(scene: Phaser.Scene, template: StreetTemplate): void {
  const alley = walkableStreetParcels.find(
    (parcel) => parcel.templateId === template.id && parcel.id === "baked_locked_back_alley"
  );
  if (!alley) return;
  scene.add
    .text((alley.tileX + alley.widthTiles - 1.5) * TILE_SIZE, (alley.tileY + alley.heightTiles + 0.35) * TILE_SIZE,
      "LOCKED · Someone could open this", {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "11px",
        color: "#fff0bd",
        backgroundColor: "rgba(16, 24, 32, 0.82)",
        padding: { x: 5, y: 3 }
      })
    .setOrigin(1, 0)
    .setDepth(36);
}

function drawStreetLandmarks(g: Phaser.GameObjects.Graphics, template: StreetTemplate): void {
  for (const landmark of streetLandmarks.filter((candidate) => candidate.templateId === template.id)) {
    if (landmark.kind === "finns_tower") {
      drawFinnsTower(g, landmark.x, landmark.y);
    }
  }
}

function drawFinnsTower(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0x101820, 0.2);
  g.fillEllipse(x + 8, y + 5, 84, 24, 24);
  g.fillStyle(0x253a47, 1);
  g.fillRoundedRect(x - 24, y - 168, 48, 170, 7);
  g.fillStyle(0x4f8f66, 1);
  g.fillRoundedRect(x - 31, y - 112, 62, 27, 4);
  g.fillStyle(0xfff0bd, 0.92);
  g.fillRect(x - 17, y - 151, 34, 7);
  g.fillRect(x - 19, y - 74, 38, 5);
  g.fillStyle(0x6ab7ff, 0.72);
  for (let floor = 0; floor < 4; floor += 1) {
    g.fillRoundedRect(x - 13, y - 132 + floor * 24, 26, 11, 2);
  }
  g.fillStyle(0x253a35, 1);
  g.beginPath();
  g.moveTo(x - 34, y - 168);
  g.lineTo(x, y - 207);
  g.lineTo(x + 34, y - 168);
  g.closePath();
  g.fillPath();
  g.lineStyle(4, 0xf4d58d, 0.88);
  g.lineBetween(x, y - 207, x, y - 228);
  g.fillStyle(0xf4d58d, 0.96);
  g.fillCircle(x, y - 233, 7);
}

function drawPaddyFields(g: Phaser.GameObjects.Graphics, template: StreetTemplate): void {
  for (const patch of paddyFieldPatches.filter((candidate) => candidate.templateId === template.id)) {
    const x = patch.tileX * TILE_SIZE;
    const y = patch.tileY * TILE_SIZE;
    const width = patch.widthTiles * TILE_SIZE;
    const height = patch.heightTiles * TILE_SIZE;
    drawPaddyPatch(g, x, y, width, height, paddyFieldState(patch), hashString(patch.id));
  }
}

function drawPaddyPatch(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  state: "green" | "yellowing",
  seed: number
): void {
  const palette =
    state === "yellowing"
      ? { fill: 0xc9b65b, fillAlt: 0xd8c86d, wet: 0xa7b66b, border: 0x8a8141, marker: 0xf2d170 }
      : { fill: 0x76bd66, fillAlt: 0x86ca70, wet: 0x78c9b7, border: 0x4f8d55, marker: 0xf2c35d };
  g.fillStyle(0x000000, 0.09);
  g.fillRoundedRect(x + 5, y + 6, width, height, 7);
  g.fillStyle(palette.fill, 0.92);
  g.fillRoundedRect(x, y, width, height, 7);
  g.lineStyle(3, palette.border, 0.75);
  g.strokeRoundedRect(x + 2, y + 2, width - 4, height - 4, 6);
  for (let row = 1; row < Math.floor(height / 26); row += 1) {
    const lineY = y + row * 26 + ((seed + row * 7) % 7);
    g.lineStyle(2, palette.wet, 0.72);
    g.lineBetween(x + 10, lineY, x + width - 10, lineY + ((row + seed) % 2 === 0 ? 4 : -3));
  }
  for (let column = 0; column < Math.floor(width / 42); column += 1) {
    const fleckX = x + 18 + column * 42;
    const fleckY = y + 18 + ((seed + column * 11) % Math.max(20, height - 34));
    g.fillStyle(column % 2 === 0 ? palette.fillAlt : palette.wet, 0.56);
    g.fillRoundedRect(fleckX, fleckY, 18, 4, 2);
  }
  if (seed % 2 === 0) {
    drawFarmerHut(g, x + width - 38, y + 30);
  } else {
    drawScareFlag(g, x + width - 34, y + height - 42, palette.marker);
  }
}

function drawFarmerHut(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0x000000, 0.11);
  g.fillEllipse(x, y + 24, 54, 14, 18);
  g.fillStyle(0x7b5b3a, 1);
  g.fillRoundedRect(x - 18, y, 36, 25, 3);
  g.fillStyle(0xd8a148, 1);
  g.beginPath();
  g.moveTo(x - 25, y + 3);
  g.lineTo(x, y - 20);
  g.lineTo(x + 25, y + 3);
  g.closePath();
  g.fillPath();
  g.fillStyle(0x2f3329, 0.45);
  g.fillRect(x - 5, y + 10, 10, 15);
}

function drawScareFlag(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number): void {
  g.lineStyle(3, 0x6b4b2d, 0.9);
  g.lineBetween(x, y + 22, x, y - 20);
  g.lineBetween(x - 15, y - 5, x + 15, y - 5);
  g.fillStyle(color, 0.95);
  g.beginPath();
  g.moveTo(x + 2, y - 20);
  g.lineTo(x + 27, y - 13);
  g.lineTo(x + 2, y - 6);
  g.closePath();
  g.fillPath();
}

function drawVillaDropoffGates(g: Phaser.GameObjects.Graphics, template: StreetTemplate): void {
  const roadCenterX = roadCenterTile(template) * TILE_SIZE;
  for (const gate of villaGateDressings) {
    const side = gate.x < roadCenterX ? -1 : 1;
    drawVillaGate(g, gate.x + side * 42, gate.y, side);
  }
}

function drawVillaGate(g: Phaser.GameObjects.Graphics, x: number, y: number, side: -1 | 1): void {
  const wallWidth = 128;
  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(x, y + 38, wallWidth + 24, 20, 24);
  g.fillStyle(0xe8d7ae, 1);
  g.fillRoundedRect(x - wallWidth / 2, y - 18, wallWidth, 34, 4);
  g.fillStyle(0xb99162, 1);
  g.fillRoundedRect(x - 22, y - 22, 44, 44, 3);
  g.fillStyle(0x5b3c2c, 1);
  g.fillRoundedRect(x - 15, y - 16, 13, 34, 2);
  g.fillRoundedRect(x + 2, y - 16, 13, 34, 2);
  g.lineStyle(2, 0x39281d, 0.58);
  g.lineBetween(x, y - 14, x, y + 17);
  for (const dx of [-54, 54]) {
    g.fillStyle(0xc8b38a, 1);
    g.fillRoundedRect(x + dx - 5, y - 26, 10, 48, 3);
    g.fillStyle(0xffe7a0, 0.95);
    g.fillCircle(x + dx, y - 31, 6);
  }
  for (const dx of [-70, 70]) {
    g.fillStyle(0x3f8f5f, 1);
    g.fillCircle(x + dx, y - 8, 8);
    g.fillStyle(0xd95b9f, 0.95);
    g.fillCircle(x + dx - side * 3, y - 14, 4);
    g.fillCircle(x + dx + side * 4, y - 4, 3);
  }
}

function drawStreetTextureProps(g: Phaser.GameObjects.Graphics): void {
  for (const prop of streetTextureProps) {
    if (prop.kind === "canang") {
      drawCanangSari(g, prop.x, prop.y);
    } else if (prop.kind === "sleeping_dog") {
      drawSleepingDog(g, prop.x, prop.y, prop.direction ?? 1);
    } else if (prop.kind === "laundry") {
      drawLaundryLine(g, prop.x, prop.y, prop.direction ?? 1);
    } else if (prop.kind === "parked_scooter") {
      drawParkedScooter(g, prop.x, prop.y, prop.direction ?? 1, prop.color ?? 0x4e9fd6);
    }
  }
}

function drawCorridorAmbientProps(g: Phaser.GameObjects.Graphics, template: StreetTemplate): void {
  const roadRight = roadRightTile(template);
  const leftShadeX = (template.roadLeftTile - template.sidewalkTiles - 0.4) * TILE_SIZE;
  const leftSidewalkX = (template.roadLeftTile - template.sidewalkTiles + 0.65) * TILE_SIZE;
  const rightSidewalkX = (roadRight + template.sidewalkTiles + 0.55) * TILE_SIZE;
  const rightShadeX = (roadRight + template.sidewalkTiles + 1.45) * TILE_SIZE;
  const endTile = template.beachTerminus ? template.beachTerminus.startsAtTile - 4 : streetEndTile(template);
  let index = 0;

  for (let yTile = template.start.tileY + 4; yTile < endTile; yTile += 5) {
    const y = yTile * TILE_SIZE + 12;
    if (index % 3 === 0) {
      drawTreeCanopy(g, leftShadeX, y);
      drawPlanter(g, rightSidewalkX, y + 18, AMBIENT_STREET_PALETTE);
    } else if (index % 3 === 1) {
      drawBench(g, leftSidewalkX, y + 8, 1);
      drawLanternPost(g, rightSidewalkX, y - 8);
    } else {
      drawLanternPost(g, leftSidewalkX, y - 8);
      drawBench(g, rightShadeX, y + 8, -1);
    }
    index += 1;
  }
}

function drawBeachAmbientProps(g: Phaser.GameObjects.Graphics, template: StreetTemplate): void {
  if (template.beachTerminus) {
    const sandY = template.beachTerminus.startsAtTile * TILE_SIZE;
    const waterY = (template.beachTerminus.startsAtTile + template.beachTerminus.sandTiles) * TILE_SIZE;
    const dockCenterX = (template.beachTerminus.dockTileX + 1) * TILE_SIZE;
    const beachLeft = (template.beachTerminus.dockTileX - 11) * TILE_SIZE;
    const beachRight = (template.beachTerminus.dockTileX + 13) * TILE_SIZE;
    const approachY = sandY - 282;

    drawPalm(g, dockCenterX - 720, approachY - 8);
    drawBench(g, dockCenterX - 610, approachY + 34, 1);
    drawSurfboards(g, dockCenterX - 500, approachY + 46, AMBIENT_STREET_PALETTE);
    drawLanternPost(g, dockCenterX + 486, approachY + 20);
    drawPlanter(g, dockCenterX + 574, approachY + 46, AMBIENT_STREET_PALETTE);
    drawPalm(g, dockCenterX + 690, approachY + 12);

    for (const [x, offset] of [
      [beachLeft, 0],
      [dockCenterX - 230, 12],
      [dockCenterX + 220, 8],
      [beachRight, 18]
    ] as const) {
      drawPalm(g, x, sandY + 54 + offset);
    }

    drawUmbrella(g, dockCenterX - 260, sandY + 116, AMBIENT_STREET_PALETTE);
    drawBeachTowel(g, dockCenterX - 198, sandY + 144, 0x40a7b2, 0xfff1c6);
    drawSurfboards(g, dockCenterX - 118, sandY + 134, AMBIENT_STREET_PALETTE);
    drawBeachTowel(g, dockCenterX + 164, sandY + 132, 0xd95b43, 0xf2c35d);
    drawUmbrella(g, dockCenterX + 252, sandY + 112, AMBIENT_STREET_PALETTE);
    drawSurfboards(g, dockCenterX + 298, waterY - 28, AMBIENT_STREET_PALETTE);
  }
}

function drawCanangSari(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0x000000, 0.1);
  g.fillEllipse(x, y + 8, 24, 9, 12);
  g.fillStyle(0xd6b26b, 1);
  g.fillRoundedRect(x - 9, y - 5, 18, 14, 2);
  g.fillStyle(0xf8f1cb, 1);
  g.fillRect(x - 6, y - 2, 5, 5);
  g.fillStyle(0xffc44f, 1);
  g.fillRect(x + 1, y - 2, 5, 5);
  g.fillStyle(0xd95b9f, 1);
  g.fillCircle(x - 3, y + 6, 3);
  g.fillStyle(0x62b86f, 1);
  g.fillCircle(x + 5, y + 5, 3);
}

function drawSleepingDog(g: Phaser.GameObjects.Graphics, x: number, y: number, direction: number): void {
  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(x, y + 13, 50, 13, 20);
  g.fillStyle(0xb88752, 1);
  g.fillEllipse(x, y, 38, 18, 20);
  g.fillCircle(x + direction * 21, y - 3, 9);
  g.fillStyle(0x7b5b3a, 1);
  g.fillCircle(x + direction * 24, y - 8, 3);
  g.fillRoundedRect(x - direction * 18, y + 1, 18, 5, 3);
  g.lineStyle(2, 0x5b3c2c, 0.7);
  g.beginPath();
  g.arc(x - direction * 24, y - 1, 8, Math.PI * 0.1, Math.PI * 0.82);
  g.strokePath();
}

function drawLaundryLine(g: Phaser.GameObjects.Graphics, x: number, y: number, direction: number): void {
  const width = 92;
  g.lineStyle(3, 0x6b4b2d, 0.9);
  g.lineBetween(x - width / 2, y - 22, x - width / 2, y + 30);
  g.lineBetween(x + width / 2, y - 22, x + width / 2, y + 30);
  g.lineStyle(2, 0xf7eac1, 0.72);
  g.lineBetween(x - width / 2, y - 18, x + width / 2, y - 12);
  const colors = [0xf7eac1, 0x40a7b2, 0xd95b43, 0xf2c35d];
  colors.forEach((color, index) => {
    const clothX = x - 34 + index * 22;
    g.fillStyle(color, 0.96);
    g.fillRoundedRect(clothX, y - 18 + index % 2, 15 + (index % 2) * 4, 24, 2);
    g.fillStyle(0x5b3c2c, 0.8);
    g.fillCircle(clothX + 2 * direction, y - 17, 1.7);
  });
}

function drawBench(g: Phaser.GameObjects.Graphics, x: number, y: number, direction: number): void {
  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(x, y + 13, 48, 10, 24);
  g.fillStyle(0x8b5f2f, 1);
  g.fillRoundedRect(x - 22, y - 5, 44, 9, 3);
  g.fillRoundedRect(x - 20, y + 6, 40, 7, 3);
  g.fillStyle(0x5b3c2c, 1);
  g.fillRect(x - 17, y + 12, 4, 10);
  g.fillRect(x + 13, y + 12, 4, 10);
  g.fillStyle(0xf2c35d, 0.9);
  g.fillCircle(x + direction * 18, y - 10, 4);
}

function drawLanternPost(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0x5b3c2c, 1);
  g.fillRoundedRect(x - 2, y - 2, 4, 38, 2);
  g.fillStyle(0xf2c35d, 1);
  g.fillCircle(x, y - 6, 7);
  g.fillStyle(0xfff1c6, 0.8);
  g.fillCircle(x - 2, y - 8, 2);
}

function drawBeachTowel(g: Phaser.GameObjects.Graphics, x: number, y: number, colorA: number, colorB: number): void {
  g.fillStyle(0x000000, 0.1);
  g.fillEllipse(x, y + 10, 50, 14, 24);
  g.fillStyle(colorA, 0.95);
  g.fillRoundedRect(x - 24, y - 7, 48, 24, 4);
  g.fillStyle(colorB, 0.95);
  g.fillRect(x - 18, y - 7, 7, 24);
  g.fillRect(x + 4, y - 7, 7, 24);
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
