export type TitleMenuStep = "menu" | "confirm-new-game";
export type TitleMenuAction = "continue" | "new-game" | "confirm-new-game" | "cancel";
export type TitleMenuEffect = "none" | "continue" | "start-new-game";

export interface TitleMenuState {
  hasSave: boolean;
  step: TitleMenuStep;
}

export function createTitleMenuState(hasSave: boolean): TitleMenuState {
  return { hasSave, step: "menu" };
}

export function shouldAdvanceGameplayBehindMenu(mode: string): boolean {
  return mode !== "title" && mode !== "pause";
}

export function transitionTitleMenu(state: TitleMenuState, action: TitleMenuAction): { state: TitleMenuState; effect: TitleMenuEffect } {
  if (action === "continue" && state.hasSave && state.step === "menu") {
    return { state, effect: "continue" };
  }
  if (action === "new-game" && state.step === "menu") {
    return state.hasSave
      ? { state: { ...state, step: "confirm-new-game" }, effect: "none" }
      : { state, effect: "start-new-game" };
  }
  if (action === "confirm-new-game" && state.step === "confirm-new-game") {
    return { state, effect: "start-new-game" };
  }
  if (action === "cancel" && state.step === "confirm-new-game") {
    return { state: { ...state, step: "menu" }, effect: "none" };
  }
  return { state, effect: "none" };
}
