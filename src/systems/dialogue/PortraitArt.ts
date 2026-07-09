import type { AffinityTier } from "../relationships/RelationshipMemory";

export type PortraitVariant = "neutral" | "warm";

interface PortraitDefinition {
  npcId: string;
  alt: string;
  skin: string;
  hair: string;
  shirt: string;
  accent: string;
  background: string;
  shape: "kerchief" | "cap" | "helmet";
}

const PORTRAITS: Record<string, PortraitDefinition> = {
  ibu_sari: {
    npcId: "ibu_sari",
    alt: "Ibu Sari portrait",
    skin: "#9f6846",
    hair: "#3a2a21",
    shirt: "#f59f43",
    accent: "#fff0bd",
    background: "#254b45",
    shape: "kerchief"
  },
  kadek: {
    npcId: "kadek",
    alt: "Kadek portrait",
    skin: "#b97851",
    hair: "#2f2722",
    shirt: "#6ab7ff",
    accent: "#f5e0a8",
    background: "#273f5f",
    shape: "cap"
  },
  rio: {
    npcId: "rio",
    alt: "Rio portrait",
    skin: "#a76548",
    hair: "#20232a",
    shirt: "#ff8f6b",
    accent: "#101820",
    background: "#5b3440",
    shape: "helmet"
  }
};

const portraitCache = new Map<string, string>();

export function getPortraitDefinition(npcId: string): PortraitDefinition | null {
  return PORTRAITS[npcId] ?? null;
}

export function portraitVariantForTier(tier: AffinityTier): PortraitVariant {
  return tier === "friendly" || tier === "regular" || tier === "trusted" ? "warm" : "neutral";
}

export function getPortraitDataUrl(npcId: string, variant: PortraitVariant): string | null {
  const definition = getPortraitDefinition(npcId);
  if (!definition || typeof document === "undefined") {
    return null;
  }
  const cacheKey = `${npcId}:${variant}`;
  const cached = portraitCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  drawPortrait(ctx, definition, variant);
  const dataUrl = canvas.toDataURL("image/png");
  portraitCache.set(cacheKey, dataUrl);
  return dataUrl;
}

function drawPortrait(ctx: CanvasRenderingContext2D, definition: PortraitDefinition, variant: PortraitVariant): void {
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = definition.background;
  roundRect(ctx, 0, 0, 128, 128, 14);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ellipse(ctx, 64, 119, 58, 10);

  ctx.fillStyle = definition.shirt;
  roundRect(ctx, 32, 82, 64, 44, 16);
  ctx.fill();
  ctx.fillStyle = definition.accent;
  ctx.globalAlpha = 0.82;
  roundRect(ctx, 49, 87, 30, 10, 5);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = definition.skin;
  ellipse(ctx, 64, 57, 35, 39);
  ctx.fillStyle = shade(definition.skin, -22);
  ellipse(ctx, 64, 82, 16, 11);

  drawHairOrHeadwear(ctx, definition);
  drawFace(ctx, definition, variant);
}

function drawHairOrHeadwear(ctx: CanvasRenderingContext2D, definition: PortraitDefinition): void {
  ctx.fillStyle = definition.hair;
  if (definition.shape === "kerchief") {
    ellipse(ctx, 64, 34, 37, 19);
    ctx.fillStyle = definition.accent;
    roundRect(ctx, 33, 34, 62, 12, 6);
    ctx.fill();
    ctx.fillStyle = definition.shirt;
    ellipse(ctx, 91, 41, 9, 7);
    return;
  }
  if (definition.shape === "cap") {
    ellipse(ctx, 63, 30, 34, 17);
    ctx.fillStyle = definition.accent;
    roundRect(ctx, 31, 31, 66, 10, 5);
    ctx.fill();
    ctx.fillStyle = definition.shirt;
    roundRect(ctx, 54, 18, 22, 15, 6);
    ctx.fill();
    return;
  }
  ellipse(ctx, 64, 31, 36, 18);
  ctx.fillStyle = definition.shirt;
  roundRect(ctx, 27, 35, 74, 13, 7);
  ctx.fill();
  ctx.fillStyle = definition.accent;
  roundRect(ctx, 46, 29, 36, 8, 4);
  ctx.fill();
}

function drawFace(ctx: CanvasRenderingContext2D, definition: PortraitDefinition, variant: PortraitVariant): void {
  ctx.fillStyle = definition.hair;
  ellipse(ctx, 51, 56, 4, 4);
  ellipse(ctx, 77, 56, 4, 4);
  ctx.strokeStyle = shade(definition.hair, 18);
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(46, 48);
  ctx.lineTo(56, 47);
  ctx.moveTo(72, 47);
  ctx.lineTo(82, 49);
  ctx.stroke();

  ctx.strokeStyle = shade(definition.skin, -34);
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (variant === "warm") {
    ctx.arc(64, 68, 12, 0.16 * Math.PI, 0.84 * Math.PI);
  } else {
    ctx.moveTo(55, 70);
    ctx.quadraticCurveTo(64, 73, 73, 70);
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(255,240,189,0.26)";
  ellipse(ctx, 48, 63, 6, 4);
  ellipse(ctx, 80, 63, 6, 4);
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function shade(color: string, amount: number): string {
  const value = Number.parseInt(color.slice(1), 16);
  const r = clamp(((value >> 16) & 255) + amount);
  const g = clamp(((value >> 8) & 255) + amount);
  const b = clamp((value & 255) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}
