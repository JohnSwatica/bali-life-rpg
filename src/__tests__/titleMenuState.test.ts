import { describe, expect, it } from "vitest";
import {
  createTitleMenuState,
  shouldAdvanceGameplayBehindMenu,
  transitionTitleMenu
} from "../ui/title/TitleMenuState";

describe("title menu state", () => {
  it("shows Continue only through a saved-game menu state", () => {
    const noSave = createTitleMenuState(false);
    const saved = createTitleMenuState(true);

    expect(transitionTitleMenu(noSave, "continue").effect).toBe("none");
    expect(transitionTitleMenu(saved, "continue").effect).toBe("continue");
  });

  it("starts an empty-save new game immediately but confirms before replacing a save", () => {
    const noSave = createTitleMenuState(false);
    const saved = createTitleMenuState(true);

    expect(transitionTitleMenu(noSave, "new-game")).toMatchObject({ effect: "start-new-game", state: { step: "menu" } });

    const requested = transitionTitleMenu(saved, "new-game");
    expect(requested).toMatchObject({ effect: "none", state: { step: "confirm-new-game" } });
    expect(transitionTitleMenu(requested.state, "cancel")).toMatchObject({ effect: "none", state: { step: "menu" } });
    expect(transitionTitleMenu(requested.state, "confirm-new-game").effect).toBe("start-new-game");
  });

  it("freezes persisted activities and races behind title and pause menus", () => {
    expect(shouldAdvanceGameplayBehindMenu("title")).toBe(false);
    expect(shouldAdvanceGameplayBehindMenu("pause")).toBe(false);
    expect(shouldAdvanceGameplayBehindMenu("world")).toBe(true);
    expect(shouldAdvanceGameplayBehindMenu("committedActivity")).toBe(true);
  });
});
