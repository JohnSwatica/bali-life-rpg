import { createTitleMenuState, transitionTitleMenu, type TitleMenuAction, type TitleMenuState } from "./TitleMenuState";

type TitleScreenMode = "title" | "pause";

interface TitleScreenOptions {
  hasSave: boolean;
  buildStamp: string;
  mode: TitleScreenMode;
  onContinue: () => void;
  onNewGame: () => void;
  onFeedback: () => void;
  onClose?: () => void;
}

export class TitleScreen {
  private readonly root: HTMLElement;
  private state: TitleMenuState;

  constructor(private readonly options: TitleScreenOptions) {
    this.state = createTitleMenuState(options.hasSave);
    this.root = document.createElement("section");
    this.root.className = "bali-life-title-screen";
    this.root.dataset.uiSurface = options.mode === "title" ? "title-screen" : "pause-menu";
    this.root.setAttribute("role", "dialog");
    this.root.setAttribute("aria-modal", "true");
    this.root.setAttribute("aria-label", options.mode === "title" ? "Bali Life RPG title screen" : "Paused");
    document.body.appendChild(this.root);
    this.render();
  }

  destroy(): void {
    this.root.remove();
  }

  private render(): void {
    this.root.replaceChildren();
    const card = document.createElement("div");
    card.className = "bali-life-title-card";
    this.root.appendChild(card);

    if (this.options.mode === "title") {
      const eyebrow = document.createElement("p");
      eyebrow.className = "bali-life-title-eyebrow";
      eyebrow.textContent = "EARLY TEST BUILD";
      card.appendChild(eyebrow);
      const title = document.createElement("h1");
      title.className = "bali-life-title-name";
      title.textContent = "Bali Life RPG";
      card.appendChild(title);
      const copy = document.createElement("p");
      copy.className = "bali-life-title-copy";
      copy.textContent = "A small life on Jl. Pantai Berawa. Your reactions help shape what comes next.";
      card.appendChild(copy);
    } else {
      const title = document.createElement("h1");
      title.className = "bali-life-title-name is-pause";
      title.textContent = "Paused";
      card.appendChild(title);
    }

    if (this.state.step === "confirm-new-game") {
      const heading = document.createElement("h2");
      heading.className = "bali-life-title-confirm-title";
      heading.textContent = "Start over?";
      card.appendChild(heading);
      const copy = document.createElement("p");
      copy.className = "bali-life-title-copy";
      copy.textContent = "This replaces the local save on this device. There is no cloud recovery.";
      card.appendChild(copy);
      card.append(this.button("Start fresh", "primary", () => this.dispatch("confirm-new-game")), this.button("Keep my save", "secondary", () => this.dispatch("cancel")));
    } else {
      if (this.options.mode === "title" && this.state.hasSave) {
        card.appendChild(this.button("Continue", "primary", () => this.dispatch("continue")));
      }
      card.appendChild(this.button(this.options.mode === "title" ? "New Game" : "Resume", "primary", () => {
        if (this.options.mode === "pause") {
          this.options.onClose?.();
          return;
        }
        this.dispatch("new-game");
      }));
      if (this.options.mode === "pause") {
        card.appendChild(this.button("Reset save", "quiet", () => this.dispatch("new-game")));
      }
      if (this.options.mode === "title") {
        card.appendChild(this.button("Send feedback", "secondary", () => this.options.onFeedback()));
      }
    }

    const stamp = document.createElement("p");
    stamp.className = "bali-life-title-stamp";
    stamp.textContent = `Build ${this.options.buildStamp}`;
    card.appendChild(stamp);
  }

  private button(label: string, tone: "primary" | "secondary" | "quiet", onClick: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `bali-life-title-button is-${tone}`;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  private dispatch(action: TitleMenuAction): void {
    const result = transitionTitleMenu(this.state, action);
    this.state = result.state;
    if (result.effect === "continue") {
      this.options.onContinue();
      return;
    }
    if (result.effect === "start-new-game") {
      this.options.onNewGame();
      return;
    }
    this.render();
  }
}
