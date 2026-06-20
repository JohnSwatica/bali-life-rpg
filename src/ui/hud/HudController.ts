import Phaser from "phaser";

const TOUCH_BUTTON_SIZE = 64;
const TOUCH_JOYSTICK_RADIUS = 56;

interface HudControllerCallbacks {
  action: () => void;
  inventory: () => void;
  community: () => void;
  bike: () => void;
  phone: () => void;
  save: () => void;
}

export class HudController {
  private touchContainer!: Phaser.GameObjects.Container;
  private touchHitZones = new Map<string, Phaser.GameObjects.Zone>();
  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickKnob!: Phaser.GameObjects.Arc;
  private joystickPointerId?: number;
  private joystickOrigin = new Phaser.Math.Vector2();
  private movementVector = new Phaser.Math.Vector2();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly depth: number,
    private readonly callbacks: HudControllerCallbacks
  ) {}

  get joystickVector(): Phaser.Math.Vector2 {
    return this.movementVector;
  }

  get touchControlsVisible(): boolean {
    return this.touchContainer?.visible ?? false;
  }

  createTouchControls(): void {
    this.touchContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(this.depth + 2);
    this.joystickBase = this.scene.add
      .circle(0, 0, TOUCH_JOYSTICK_RADIUS, 0x101820, 0.42)
      .setStrokeStyle(2, 0xf4d58d, 0.55);
    this.joystickKnob = this.scene.add.circle(0, 0, 22, 0xf4d58d, 0.75).setStrokeStyle(2, 0x101820, 0.45);
    this.touchContainer.add([this.joystickBase, this.joystickKnob]);

    const actionButton = this.makeTouchButton("ACT");
    const bagButton = this.makeTouchButton("BAG");
    const communityButton = this.makeTouchButton("SOC");
    const bikeButton = this.makeTouchButton("BIKE");
    const phoneButton = this.makeTouchButton("PHONE");
    const saveButton = this.makeTouchButton("SAVE");
    actionButton.setName("action-button");
    bagButton.setName("bag-button");
    communityButton.setName("community-button");
    bikeButton.setName("bike-button");
    phoneButton.setName("phone-button");
    saveButton.setName("save-button");
    this.touchContainer.add([actionButton, bagButton, communityButton, bikeButton, phoneButton, saveButton]);

    this.registerTouchHitZone("action-button", this.callbacks.action);
    this.registerTouchHitZone("bag-button", this.callbacks.inventory);
    this.registerTouchHitZone("community-button", this.callbacks.community);
    this.registerTouchHitZone("bike-button", this.callbacks.bike);
    this.registerTouchHitZone("phone-button", this.callbacks.phone);
    this.registerTouchHitZone("save-button", this.callbacks.save);
  }

  handlePointerDown(pointer: Phaser.Input.Pointer, mode: string): void {
    if (mode !== "world") {
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
    const showTouch = width < 900 || this.scene.sys.game.device.input.touch;
    this.touchContainer.setVisible(showTouch);
    for (const zone of this.touchHitZones.values()) {
      zone.setVisible(showTouch);
      if (zone.input) {
        zone.input.enabled = showTouch;
      }
    }

    const baseX = 96;
    const baseY = height - 96;
    if (this.joystickPointerId === undefined) {
      this.joystickBase.setPosition(baseX, baseY);
      this.joystickKnob.setPosition(baseX, baseY);
      this.joystickOrigin.set(baseX, baseY);
    }

    this.positionButton("action-button", width - 86, height - 92);
    this.positionButton("bag-button", width - 166, height - 88);
    this.positionButton("community-button", width - 166, height - 168);
    this.positionButton("bike-button", width - 86, height - 172);
    this.positionButton("phone-button", width - 166, height - 248);
    this.positionButton("save-button", width - 86, height - 252);
  }

  private makeTouchButton(label: string): Phaser.GameObjects.Container {
    const button = this.scene.add.container(0, 0);
    const bg = this.scene.add.circle(0, 0, TOUCH_BUTTON_SIZE / 2, 0x101820, 0.62).setStrokeStyle(2, 0xf4d58d, 0.65);
    const text = this.scene.add
      .text(0, 0, label, {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: label.length > 3 ? "12px" : "15px",
        color: "#fff8df",
        fontStyle: "700"
      })
      .setOrigin(0.5);
    button.add([bg, text]);
    button.setSize(TOUCH_BUTTON_SIZE, TOUCH_BUTTON_SIZE);
    return button;
  }

  private registerTouchHitZone(name: string, onClick: () => void): void {
    const zone = this.scene.add.zone(0, 0, TOUCH_BUTTON_SIZE, TOUCH_BUTTON_SIZE).setName(`${name}-hit-zone`).setScrollFactor(0).setDepth(this.depth + 4);
    zone.setInteractive(new Phaser.Geom.Rectangle(0, 0, TOUCH_BUTTON_SIZE, TOUCH_BUTTON_SIZE), Phaser.Geom.Rectangle.Contains);
    if (zone.input) {
      zone.input.cursor = "pointer";
    }
    zone.on("pointerdown", (pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event?: Phaser.Types.Input.EventData) => {
      event?.stopPropagation();
      pointer.event?.stopPropagation();
      onClick();
    });
    this.touchHitZones.set(name, zone);
  }

  private positionButton(name: string, x: number, y: number): void {
    const button = this.touchContainer.getByName(name) as Phaser.GameObjects.Container | null;
    button?.setPosition(x, y);
    this.touchHitZones.get(name)?.setPosition(x, y);
  }
}
