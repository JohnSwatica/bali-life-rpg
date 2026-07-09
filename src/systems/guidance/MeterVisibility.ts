import type { Meter, WorldState } from "../../types";

export interface MeterPresentation {
  label: string;
  shortLabel: string;
  color: string;
}

export const METER_ORDER: Meter[] = ["energy", "wellbeing", "focus", "social"];

export const METER_PRESENTATION: Record<Meter, MeterPresentation> = {
  energy: { label: "Energy", shortLabel: "E", color: "#f4b860" },
  wellbeing: { label: "Wellbeing", shortLabel: "W", color: "#62c48f" },
  focus: { label: "Focus", shortLabel: "F", color: "#6ab7ff" },
  social: { label: "Social", shortLabel: "S", color: "#e58fb1" }
};

export function areAdvancedMetersVisible(world: WorldState): boolean {
  return world.life.actProgress.currentAct >= 2 || world.life.hustle.moveOutReady;
}

export function getVisibleMeters(world: WorldState): Meter[] {
  return areAdvancedMetersVisible(world) ? [...METER_ORDER] : ["energy"];
}

export function isMeterVisible(world: WorldState, meter: Meter): boolean {
  return getVisibleMeters(world).includes(meter);
}

export function formatVisibleMeterValues(world: WorldState): string {
  return getVisibleMeters(world)
    .map((meter) => `${METER_PRESENTATION[meter].label} ${world.meters[meter]}`)
    .join("  ");
}

export function formatVisibleMeterDeltas(world: WorldState, deltas: Partial<Record<Meter, number>>): string {
  return getVisibleMeters(world)
    .flatMap((meter) => {
      const delta = deltas[meter];
      if (typeof delta !== "number" || delta === 0) {
        return [];
      }
      return `${meter} ${delta >= 0 ? "+" : ""}${delta}`;
    })
    .join(", ");
}

export function hiddenMeterRestCopy(world: WorldState, fallback: string): string {
  if (areAdvancedMetersVisible(world)) {
    return fallback;
  }
  return "You're running on fumes -- take a proper break before stacking more hustle.";
}
