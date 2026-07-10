import Phaser from "phaser";
import { METER_PRESENTATION } from "../../systems/guidance/MeterVisibility";
import { shouldUseTouchControls } from "../../systems/input/TouchInputPolicy";
import type { Meter } from "../../types";
import { getPhoneCameraScale } from "../phone/PhoneLayout";

const TOUCH_JOYSTICK_RADIUS = 56;
const MINIMAP_MAX_WIDTH = 168;
const MINIMAP_MIN_WIDTH = 104;
const MINIMAP_PADDING = 7;
const MINIMAP_MARGIN = 16;

export interface DomMinimapLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  scale: number;
}

interface DomMinimapSurface {
  ctx: CanvasRenderingContext2D;
  layout: DomMinimapLayout;
}

type HudActionName = "phone" | "inventory" | "community" | "save" | "bike" | "action";

interface HudMeterReadout {
  money: number;
  energy: number;
  wellbeing: number;
  focus: number;
  social: number;
  visibleMeters: Meter[];
}

interface HudControllerCallbacks {
  action: () => void;
  inventory: () => void;
  community: () => void;
  bike: () => void;
  phone: () => void;
  save: () => void;
}

declare global {
  interface Window {
    __BALI_LIFE_HUD_ACTIONS__?: Partial<Record<HudActionName, number>>;
  }
}

export class HudController {
  private touchContainer!: Phaser.GameObjects.Container;
  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickKnob!: Phaser.GameObjects.Arc;
  private joystickPointerId?: number;
  private joystickOrigin = new Phaser.Math.Vector2();
  private movementVector = new Phaser.Math.Vector2();
  private buttonOverlay?: HTMLDivElement;
  private meterOverlay?: HTMLDivElement;
  private minimapFrame?: HTMLDivElement;
  private minimapCanvas?: HTMLCanvasElement;
  private minimapLayout?: DomMinimapLayout;
  private minimapDpr = 1;
  private phoneButton?: HTMLButtonElement;
  private actionButton?: HTMLButtonElement;
  private overlayOpen = false;
  private readonly touchInputActive: boolean;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly depth: number,
    private readonly callbacks: HudControllerCallbacks
  ) {
    this.touchInputActive = shouldUseTouchControls(
      scene.sys.game.device.input.touch,
      Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV),
      typeof window === "undefined" ? "" : window.location.search
    );
  }

  get joystickVector(): Phaser.Math.Vector2 {
    return this.movementVector;
  }

  get touchControlsVisible(): boolean {
    return this.touchContainer?.visible ?? false;
  }

  get isTouchInputActive(): boolean {
    return this.touchInputActive;
  }

  createTouchControls(): void {
    const camera = this.scene.cameras.main;
    this.touchContainer = this.scene.add
      .container(camera.worldView.x, camera.worldView.y)
      .setScrollFactor(1)
      .setDepth(this.depth + 2)
      .setScale(getPhoneCameraScale(camera.zoom || 1));
    this.joystickBase = this.scene.add
      .circle(0, 0, TOUCH_JOYSTICK_RADIUS, 0x101820, 0.42)
      .setStrokeStyle(2, 0xf4d58d, 0.55);
    this.joystickKnob = this.scene.add.circle(0, 0, 22, 0xf4d58d, 0.75).setStrokeStyle(2, 0x101820, 0.45);
    this.touchContainer.add([this.joystickBase, this.joystickKnob]);
    this.createDomOverlay();
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroy());
  }

  handlePointerDown(pointer: Phaser.Input.Pointer, mode: string): void {
    if (!this.touchInputActive || this.overlayOpen || (mode !== "world" && mode !== "interior")) {
      return;
    }

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const inJoystickArea = pointer.x < Math.min(260, width * 0.42) && pointer.y > height - 245;
    if (!inJoystickArea) {
      return;
    }

    this.joystickPointerId = pointer.id;
    this.joystickOrigin.set(pointer.x, pointer.y);
    this.joystickBase.setPosition(pointer.x, pointer.y);
    this.joystickKnob.setPosition(pointer.x, pointer.y);
    this.movementVector.set(0, 0);
  }

  handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.joystickPointerId !== pointer.id) {
      return;
    }

    const dx = pointer.x - this.joystickOrigin.x;
    const dy = pointer.y - this.joystickOrigin.y;
    const distance = Math.min(TOUCH_JOYSTICK_RADIUS, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const knobX = this.joystickOrigin.x + Math.cos(angle) * distance;
    const knobY = this.joystickOrigin.y + Math.sin(angle) * distance;
    this.joystickKnob.setPosition(knobX, knobY);
    this.movementVector.set(Math.cos(angle) * (distance / TOUCH_JOYSTICK_RADIUS), Math.sin(angle) * (distance / TOUCH_JOYSTICK_RADIUS));
  }

  handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.joystickPointerId !== pointer.id) {
      return;
    }
    this.joystickPointerId = undefined;
    this.movementVector.set(0, 0);
    this.layoutTouchControls();
  }

  layoutTouchControls(): void {
    if (!this.touchContainer) {
      return;
    }
    const { width, height } = this.scene.scale;
    this.syncTouchControlsToCamera();
    this.touchContainer.setVisible(this.touchInputActive && !this.overlayOpen);

    const baseX = 96;
    const controlHeight = Math.min(height, this.getConfiguredGameHeight());
    const baseY = controlHeight - 96;
    if (this.joystickPointerId === undefined) {
      this.joystickBase.setPosition(baseX, baseY);
      this.joystickKnob.setPosition(baseX, baseY);
      this.joystickOrigin.set(baseX, baseY);
    }

    this.layoutDomOverlay();
  }

  syncTouchControlsToCamera(): void {
    if (!this.touchContainer) {
      return;
    }
    const camera = this.scene.cameras.main;
    this.touchContainer
      .setPosition(camera.worldView.x, camera.worldView.y)
      .setScale(getPhoneCameraScale(camera.zoom || 1));
  }

  cancelTouchInput(): void {
    this.joystickPointerId = undefined;
    this.movementVector.set(0, 0);
    this.layoutTouchControls();
  }

  setActionButtonMode(mode: "action" | "concede"): void {
    if (!this.actionButton) {
      return;
    }
    const label = mode === "concede" ? "QUIT" : "ACT";
    if (this.actionButton.textContent !== label) {
      this.actionButton.textContent = label;
      this.actionButton.setAttribute("aria-label", mode === "concede" ? "Concede race" : "Action");
    }
  }

  getMinimapSurface(worldWidth: number, worldHeight: number): DomMinimapSurface | null {
    if (!this.minimapCanvas || !this.minimapLayout) {
      return null;
    }
    const ctx = this.minimapCanvas.getContext("2d");
    if (!ctx) {
      return null;
    }

    const innerWidth = this.minimapLayout.width - MINIMAP_PADDING * 2;
    const innerHeight = this.minimapLayout.height - MINIMAP_PADDING * 2;
    const scale = Math.min(innerWidth / worldWidth, innerHeight / worldHeight);
    const drawWidth = worldWidth * scale;
    const drawHeight = worldHeight * scale;
    const layout = {
      ...this.minimapLayout,
      x: 0,
      y: 0,
      offsetX: MINIMAP_PADDING + (innerWidth - drawWidth) / 2,
      offsetY: MINIMAP_PADDING + (innerHeight - drawHeight) / 2,
      scale
    };

    ctx.setTransform(this.minimapDpr, 0, 0, this.minimapDpr, 0, 0);
    ctx.clearRect(0, 0, layout.width, layout.height);
    return { ctx, layout };
  }

  destroy(): void {
    this.buttonOverlay?.remove();
    this.meterOverlay?.remove();
    this.minimapFrame?.remove();
    this.buttonOverlay = undefined;
    this.meterOverlay = undefined;
    this.minimapFrame = undefined;
    this.minimapCanvas = undefined;
    this.minimapLayout = undefined;
  }

  updateMeterReadout(readout: HudMeterReadout): void {
    if (!this.meterOverlay) {
      return;
    }
    const rows = readout.visibleMeters.map((meter) => ({
      label: METER_PRESENTATION[meter].shortLabel,
      value: readout[meter],
      color: METER_PRESENTATION[meter].color,
      title: `${METER_PRESENTATION[meter].label} ${readout[meter]}`
    }));
    this.meterOverlay.replaceChildren(
      ...rows.map(({ label, value, color, title }) => {
        const row = document.createElement("div");
        row.className = "bali-life-meter-row";
        row.title = title;
        const name = document.createElement("span");
        name.textContent = label;
        const track = document.createElement("div");
        track.className = "bali-life-meter-bar-track";
        const fill = document.createElement("div");
        fill.className = "bali-life-meter-bar-fill";
        fill.style.width = `${Math.max(0, Math.min(100, value))}%`;
        fill.style.backgroundColor = color;
        track.append(fill);
        row.append(name, track);
        return row;
      })
    );
  }

  updatePhoneBadge(count: number, buzzing = false): void {
    if (!this.phoneButton) {
      return;
    }
    if (count > 0) {
      this.phoneButton.dataset.badge = count > 9 ? "9+" : `${count}`;
      this.phoneButton.classList.toggle("is-buzzing", buzzing);
    } else {
      delete this.phoneButton.dataset.badge;
      this.phoneButton.classList.remove("is-buzzing");
    }
  }

  setMinimapHidden(hidden: boolean): void {
    this.minimapFrame?.classList.toggle("is-hidden", hidden);
  }

  setActionButtonsMuted(muted: boolean): void {
    this.buttonOverlay?.classList.toggle("is-muted", muted);
  }

  setOverlayOpen(open: boolean): void {
    if (open !== this.overlayOpen) {
      this.overlayOpen = open;
      if (open) {
        this.joystickPointerId = undefined;
        this.movementVector.set(0, 0);
      }
      this.touchContainer?.setVisible(this.touchInputActive && !open);
    }
    this.setMinimapHidden(open);
    this.setActionButtonsMuted(open);
    if (typeof document !== "undefined") {
      document.body.classList.toggle("bali-life-overlay-open", open);
    }
  }

  private createDomOverlay(): void {
    if (typeof document === "undefined") {
      return;
    }

    document.getElementById("bali-life-hud-buttons")?.remove();
    document.getElementById("bali-life-hud-meters")?.remove();
    document.getElementById("bali-life-minimap")?.remove();

    this.meterOverlay = document.createElement("div");
    this.meterOverlay.id = "bali-life-hud-meters";
    this.meterOverlay.className = "bali-life-hud-meters";
    this.meterOverlay.dataset.uiSurface = "hud-meters";
    this.meterOverlay.setAttribute("aria-label", "Player meters");

    this.buttonOverlay = document.createElement("div");
    this.buttonOverlay.id = "bali-life-hud-buttons";
    this.buttonOverlay.className = "bali-life-hud-buttons";
    if (!this.touchInputActive) {
      this.buttonOverlay.classList.add("is-desktop-hidden");
    }
    this.buttonOverlay.dataset.uiSurface = "hud-buttons";
    this.buttonOverlay.setAttribute("aria-label", "Game actions");

    const buttons: Array<{ action: HudActionName; label: string; callback: () => void }> = [
      { action: "phone", label: "PHONE", callback: this.callbacks.phone },
      { action: "save", label: "SAVE", callback: this.callbacks.save },
      { action: "community", label: "SOC", callback: this.callbacks.community },
      { action: "bike", label: "BIKE", callback: this.callbacks.bike },
      { action: "inventory", label: "BAG", callback: this.callbacks.inventory },
      { action: "action", label: "ACT", callback: this.callbacks.action }
    ];

    for (const config of buttons) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bali-life-hud-button";
      button.dataset.hudAction = config.action;
      button.textContent = config.label;
      button.setAttribute("aria-label", config.label);
      button.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        config.callback();
        button.dataset.clickCount = `${Number(button.dataset.clickCount ?? 0) + 1}`;
        this.recordDomButtonClick(config.action);
      });
      if (config.action === "phone") {
        this.phoneButton = button;
      }
      if (config.action === "action") {
        this.actionButton = button;
      }
      this.buttonOverlay.appendChild(button);
    }

    this.minimapFrame = document.createElement("div");
    this.minimapFrame.id = "bali-life-minimap";
    this.minimapFrame.className = "bali-life-minimap";
    this.minimapFrame.dataset.uiSurface = "minimap";
    this.minimapFrame.setAttribute("aria-label", "Minimap");
    this.minimapCanvas = document.createElement("canvas");
    this.minimapCanvas.className = "bali-life-minimap-canvas";
    this.minimapFrame.appendChild(this.minimapCanvas);

    document.body.appendChild(this.minimapFrame);
    document.body.appendChild(this.meterOverlay);
    document.body.appendChild(this.buttonOverlay);
    this.layoutDomOverlay();
  }

  private getConfiguredGameHeight(): number {
    const configuredHeight = this.scene.sys.game.config.height;
    return typeof configuredHeight === "number" ? configuredHeight : this.scene.scale.height;
  }

  private layoutDomOverlay(): void {
    if (!this.minimapFrame || !this.minimapCanvas) {
      return;
    }

    const viewport = this.getViewportSize();
    const availableWidth = Math.max(MINIMAP_MIN_WIDTH, viewport.width - MINIMAP_MARGIN * 2);
    const baseWidth = Phaser.Math.Clamp(
      Math.round(viewport.width * (viewport.width < 720 ? 0.26 : 0.23)),
      MINIMAP_MIN_WIDTH,
      Math.min(MINIMAP_MAX_WIDTH, availableWidth)
    );
    const baseHeight = Math.round(baseWidth * (viewport.height < 760 ? 0.72 : 0.708));
    const minimapWidth = Math.min(baseWidth, Math.max(80, viewport.width - MINIMAP_MARGIN * 2));
    const minimapHeight = Math.min(baseHeight, Math.max(64, viewport.height - MINIMAP_MARGIN * 2));
    const x = Phaser.Math.Clamp(viewport.width - minimapWidth - 14, 0, Math.max(0, viewport.width - minimapWidth));
    const y = Phaser.Math.Clamp(14, 0, Math.max(0, viewport.height - minimapHeight));
    this.minimapDpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));

    this.minimapFrame.style.left = `${x}px`;
    this.minimapFrame.style.top = `${y}px`;
    this.minimapFrame.style.width = `${minimapWidth}px`;
    this.minimapFrame.style.height = `${minimapHeight}px`;
    this.minimapCanvas.style.width = `${minimapWidth}px`;
    this.minimapCanvas.style.height = `${minimapHeight}px`;
    this.minimapCanvas.width = Math.round(minimapWidth * this.minimapDpr);
    this.minimapCanvas.height = Math.round(minimapHeight * this.minimapDpr);
    this.minimapLayout = {
      x: 0,
      y: 0,
      width: minimapWidth,
      height: minimapHeight,
      offsetX: MINIMAP_PADDING,
      offsetY: MINIMAP_PADDING,
      scale: 1
    };

    if (this.meterOverlay) {
      this.meterOverlay.style.top = `${14 + minimapHeight + 8}px`;
      this.meterOverlay.style.right = "14px";
    }
  }

  private getViewportSize(): { width: number; height: number } {
    if (typeof window === "undefined") {
      return { width: this.scene.scale.width, height: this.scene.scale.height };
    }
    return {
      width: Math.max(1, window.innerWidth || this.scene.scale.width),
      height: Math.max(1, window.innerHeight || this.scene.scale.height)
    };
  }

  private recordDomButtonClick(action: HudActionName): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.__BALI_LIFE_HUD_ACTIONS__ = window.__BALI_LIFE_HUD_ACTIONS__ ?? {};
      window.__BALI_LIFE_HUD_ACTIONS__[action] = (window.__BALI_LIFE_HUD_ACTIONS__[action] ?? 0) + 1;
      window.dispatchEvent(new CustomEvent("bali-life:hud-action", { detail: { action } }));
    } catch {
      // Some automation contexts disallow adding globals to window. The per-button data-click-count
      // attribute remains the source of truth for bounds/click verification.
    }
  }
}
