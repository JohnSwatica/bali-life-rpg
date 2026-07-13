export function canPlayerBeOnBike(mode: string, hasBike: boolean, activeInteriorId: string | null | undefined): boolean {
  return hasBike && mode !== "interior" && !activeInteriorId;
}

export function canPlayerMountBike(mode: string, hasBike: boolean, activeInteriorId: string | null | undefined): boolean {
  return mode === "world" && canPlayerBeOnBike(mode, hasBike, activeInteriorId);
}

export function resolveRequestedBikeState(
  requestedOnBike: boolean,
  mode: string,
  hasBike: boolean,
  activeInteriorId: string | null | undefined
): boolean {
  return requestedOnBike && canPlayerMountBike(mode, hasBike, activeInteriorId);
}
