import { describe, expect, it } from "vitest";
import { shouldUseTouchControls } from "../systems/input/TouchInputPolicy";

describe("touch input policy", () => {
  it("always honors a device-reported touch screen", () => {
    expect(shouldUseTouchControls(true, false, "")).toBe(true);
    expect(shouldUseTouchControls(true, true, "?touch=0")).toBe(true);
  });

  it("allows pointer-based touch emulation only in development", () => {
    expect(shouldUseTouchControls(false, true, "?touch=1")).toBe(true);
    expect(shouldUseTouchControls(false, false, "?touch=1")).toBe(false);
    expect(shouldUseTouchControls(false, true, "?touch=0")).toBe(false);
  });
});
