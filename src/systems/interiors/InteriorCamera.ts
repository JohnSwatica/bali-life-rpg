import type { InteriorDefinition } from "../../types";

const INTERIOR_CAMERA_MAX_ZOOM = 2.8;
const INTERIOR_CAMERA_VIEWPORT_FILL = 0.92;

export interface InteriorCameraBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateInteriorCameraZoom(
  viewportWidth: number,
  viewportHeight: number,
  interior: Pick<InteriorDefinition, "width" | "height">
): number {
  if (viewportWidth <= 0 || viewportHeight <= 0 || interior.width <= 0 || interior.height <= 0) {
    return 1;
  }
  return Math.min(
    INTERIOR_CAMERA_MAX_ZOOM,
    INTERIOR_CAMERA_VIEWPORT_FILL * Math.min(viewportWidth / interior.width, viewportHeight / interior.height)
  );
}

export function calculateInteriorCameraBounds(
  viewportWidth: number,
  viewportHeight: number,
  zoom: number,
  interior: Pick<InteriorDefinition, "origin" | "width" | "height">
): InteriorCameraBounds {
  const safeZoom = zoom > 0 ? zoom : 1;
  const visibleWidth = viewportWidth / safeZoom;
  const visibleHeight = viewportHeight / safeZoom;
  const width = Math.max(interior.width, visibleWidth);
  const height = Math.max(interior.height, visibleHeight);

  return {
    x: interior.origin.x - Math.max(0, visibleWidth - interior.width) / 2,
    y: interior.origin.y - Math.max(0, visibleHeight - interior.height) / 2,
    width,
    height
  };
}
