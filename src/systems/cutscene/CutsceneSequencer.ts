export type CutsceneStepKind =
  | "letterbox_in"
  | "letterbox_out"
  | "act_card"
  | "scripted_walk"
  | "camera_pan"
  | "camera_hold"
  | "camera_return";

export interface CutscenePoint {
  x: number;
  y: number;
}

export interface CutsceneStep {
  id: string;
  kind: CutsceneStepKind;
  durationMs: number;
  title?: string;
  subtitle?: string;
  target?: CutscenePoint;
  waypoints?: CutscenePoint[];
  actorId?: string;
}

export interface CutsceneScript {
  id: string;
  steps: CutsceneStep[];
  timeoutMs: number;
  after?: "morning_hand" | "world";
}

export interface CutsceneStepState {
  step: CutsceneStep | null;
  stepIndex: number;
  stepElapsedMs: number;
  stepProgress: number;
  elapsedMs: number;
  complete: boolean;
  timedOut: boolean;
}

export function getCutsceneDuration(script: CutsceneScript): number {
  return script.steps.reduce((total, step) => total + Math.max(0, step.durationMs), 0);
}

export function shouldPauseQueuedFeedback(cutsceneActive: boolean, storyPhoneMomentOpen = false): boolean {
  return cutsceneActive || storyPhoneMomentOpen;
}

export function getCutsceneLetterboxProgress(state: CutsceneStepState): number {
  const step = state.step;
  if (step?.kind === "letterbox_in") {
    return state.stepProgress;
  }
  if (step?.kind === "letterbox_out") {
    return 1 - state.stepProgress;
  }
  return state.complete ? 0 : 1;
}

export function getStoryHudTopOffset(state: CutsceneStepState | null, viewportHeight: number, baseOffset = 12): number {
  if (!state) {
    return baseOffset;
  }
  const maxBarHeight = Math.min(98, Math.max(62, viewportHeight * 0.13));
  return Math.max(baseOffset, Math.ceil(maxBarHeight * getCutsceneLetterboxProgress(state)) + baseOffset);
}

export function getCutsceneStepState(script: CutsceneScript, elapsedMs: number): CutsceneStepState {
  const duration = getCutsceneDuration(script);
  const clampedElapsed = Math.max(0, elapsedMs);
  const timedOut = clampedElapsed >= script.timeoutMs;
  if (script.steps.length === 0 || clampedElapsed >= duration || timedOut) {
    return {
      step: null,
      stepIndex: script.steps.length,
      stepElapsedMs: 0,
      stepProgress: 1,
      elapsedMs: Math.min(clampedElapsed, duration),
      complete: true,
      timedOut
    };
  }

  let cursor = 0;
  for (let index = 0; index < script.steps.length; index += 1) {
    const step = script.steps[index];
    const durationMs = Math.max(1, step.durationMs);
    if (clampedElapsed < cursor + durationMs) {
      const stepElapsedMs = clampedElapsed - cursor;
      return {
        step,
        stepIndex: index,
        stepElapsedMs,
        stepProgress: Math.max(0, Math.min(1, stepElapsedMs / durationMs)),
        elapsedMs: clampedElapsed,
        complete: false,
        timedOut: false
      };
    }
    cursor += durationMs;
  }

  return {
    step: null,
    stepIndex: script.steps.length,
    stepElapsedMs: 0,
    stepProgress: 1,
    elapsedMs: duration,
    complete: true,
    timedOut: false
  };
}

export function skipCutscene(script: CutsceneScript): CutsceneStepState {
  return getCutsceneStepState(script, getCutsceneDuration(script));
}
