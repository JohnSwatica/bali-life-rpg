import type { InteriorDefinition } from "../../types";

const INTERIOR_CAMERA_MAX_ZOOM = 2.8;
const INTERIOR_CAMERA_VIEWPORT_FILL = 0.92;

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
