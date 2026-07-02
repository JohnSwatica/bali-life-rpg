import Phaser from "phaser";

export type GameKeyName = "W" | "A" | "S" | "D" | "E" | "I" | "C" | "B" | "P" | "F2" | "BACKTICK" | "ESC" | "SAVE" | "RESET";

export type GameKeyMap = Record<GameKeyName, Phaser.Input.Keyboard.Key>;

interface InputCallbacks {
  action: () => void;
  inventory: () => void;
  community: () => void;
  bike: () => void;
  phone: () => void;
  godmode: () => void;
  escape: () => void;
  save: () => void;
  reset: () => void;
}

export interface InputBindings {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  keys: GameKeyMap;
}

export class InputController {
  constructor(private readonly scene: Phaser.Scene) {}

  createKeyboard(callbacks: InputCallbacks): InputBindings | null {
    if (!this.scene.input.keyboard) {
      return null;
    }

    const cursors = this.scene.input.keyboard.createCursorKeys();
    const keys = this.scene.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      I: Phaser.Input.Keyboard.KeyCodes.I,
      C: Phaser.Input.Keyboard.KeyCodes.C,
      B: Phaser.Input.Keyboard.KeyCodes.B,
      P: Phaser.Input.Keyboard.KeyCodes.P,
      F2: Phaser.Input.Keyboard.KeyCodes.F2,
      BACKTICK: Phaser.Input.Keyboard.KeyCodes.BACKTICK,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
      SAVE: Phaser.Input.Keyboard.KeyCodes.F5,
      RESET: Phaser.Input.Keyboard.KeyCodes.F9
    }) as GameKeyMap;

    keys.E.on("down", () => callbacks.action());
    keys.I.on("down", () => callbacks.inventory());
    keys.C.on("down", () => callbacks.community());
    keys.B.on("down", () => callbacks.bike());
    keys.P.on("down", () => callbacks.phone());
    keys.F2.on("down", () => callbacks.godmode());
    keys.BACKTICK.on("down", () => callbacks.godmode());
    keys.ESC.on("down", () => callbacks.escape());
    keys.SAVE.on("down", (event: KeyboardEvent) => {
      event.preventDefault();
      callbacks.save();
    });
    keys.RESET.on("down", () => callbacks.reset());

    return { cursors, keys };
  }

  getMovementVector(
    mode: string,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    keys: GameKeyMap,
    joystickVector: Phaser.Math.Vector2
  ): Phaser.Math.Vector2 {
    const movement = new Phaser.Math.Vector2(0, 0);
    if (mode !== "world" && mode !== "interior") {
      return movement;
    }
    if (cursors.left.isDown || keys.A.isDown) movement.x -= 1;
    if (cursors.right.isDown || keys.D.isDown) movement.x += 1;
    if (cursors.up.isDown || keys.W.isDown) movement.y -= 1;
    if (cursors.down.isDown || keys.S.isDown) movement.y += 1;
    movement.add(joystickVector);
    return movement;
  }
}
