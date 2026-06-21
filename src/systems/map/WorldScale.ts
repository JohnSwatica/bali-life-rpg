export const BASE_WORLD_WIDTH = 2400;
export const BASE_WORLD_HEIGHT = 1700;
export const WORLD_SCALE = 1.6;

export interface WorldPoint {
  x: number;
  y: number;
}

export function scaleDistance(value: number): number {
  return Math.round(value * WORLD_SCALE);
}

export function scalePoint<T extends WorldPoint>(point: T): T {
  return {
    ...point,
    x: scaleDistance(point.x),
    y: scaleDistance(point.y)
  };
}

export function scaleRect<T extends WorldPoint & { width: number; height: number }>(rect: T): T {
  return {
    ...scalePoint(rect),
    width: scaleDistance(rect.width),
    height: scaleDistance(rect.height)
  };
}
