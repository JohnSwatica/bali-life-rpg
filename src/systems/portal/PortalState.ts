import type { PortalMode, PortalState } from "../../types";

export function createDefaultPortalState(): PortalState {
  return {
    current: "single",
    multiplayerStatus: "locked"
  };
}

export function switchPortalMode(portal: PortalState, mode: PortalMode): string {
  if (mode === "multiplayer" && portal.multiplayerStatus === "locked") {
    portal.current = "single";
    return "Multiplayer is visible but locked in this vertical slice.";
  }
  portal.current = mode;
  return mode === "single" ? "Single Player active." : "Multiplayer mode active.";
}
