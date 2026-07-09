import type { PaddyFieldPatch, PaddyFieldVisualState } from "../../data/worldDressing";

export interface PaddyFieldStateContext {
  currentAct?: number;
  flags?: Record<string, boolean | undefined>;
}

export function paddyFieldState(
  patch: PaddyFieldPatch,
  context: PaddyFieldStateContext = {}
): PaddyFieldVisualState {
  if (patch.startsYellowing) {
    return "yellowing";
  }
  if (patch.yellowingFlag && context.flags?.[patch.yellowingFlag]) {
    return "yellowing";
  }
  if (patch.yellowingFromAct != null && (context.currentAct ?? 0) >= patch.yellowingFromAct) {
    return "yellowing";
  }
  return "green";
}
