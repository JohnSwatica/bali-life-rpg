import { describe, expect, it } from "vitest";
import { getPhoneCameraScale, getPhonePanelLayout } from "../ui/phone/PhoneLayout";

describe("phone shell layout", () => {
  const verifiedViewports = [
    [1280, 800],
    [1440, 900],
    [1728, 1117],
    [2560, 1440],
    [1024, 768],
    [390, 844]
  ] as const;

  it("keeps phone panel text inside the viewport-safe inset at verified sizes", () => {
    for (const [width, height] of verifiedViewports) {
      const layout = getPhonePanelLayout(width, height);

      expect(layout.x, `${width}x${height} panel left`).toBeGreaterThanOrEqual(12);
      expect(layout.y, `${width}x${height} panel top`).toBeGreaterThanOrEqual(12);
      expect(layout.x + layout.panelWidth, `${width}x${height} panel right`).toBeLessThanOrEqual(width);
      expect(layout.y + layout.panelHeight, `${width}x${height} panel bottom`).toBeLessThanOrEqual(height);
      expect(layout.bodyX, `${width}x${height} body left`).toBeGreaterThanOrEqual(layout.x + 24);
      expect(layout.bodyX + layout.bodyWidth, `${width}x${height} body right`).toBeLessThanOrEqual(
        layout.x + layout.panelWidth - 24
      );
      expect(layout.bodyWidth, `${width}x${height} body width`).toBeGreaterThanOrEqual(232);
    }
  });

  it("counter-scales camera zoom so the Phaser phone behaves like screen UI", () => {
    expect(getPhoneCameraScale(1)).toBeCloseTo(1);
    expect(getPhoneCameraScale(1.86)).toBeCloseTo(1 / 1.86);
    expect(getPhoneCameraScale(0)).toBe(1000);
  });
});
