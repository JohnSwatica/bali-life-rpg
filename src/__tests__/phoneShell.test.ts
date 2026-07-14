import { describe, expect, it, vi } from "vitest";

vi.mock("phaser", () => ({
  default: {}
}));

import { createInitialWorldState } from "../systems/WorldState";
import { ACT0_SIGNUP_LEADERBOARD_ROWS, PhoneShell } from "../ui/phone/PhoneShell";
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

  it("renders an empty Threads tab without throwing", () => {
    const renderedText: string[] = [];
    const fakeScene = {
      add: {
        text: (_x: number, _y: number, text: string) => {
          renderedText.push(text);
          return {};
        }
      }
    };
    const shell = new PhoneShell({
      scene: fakeScene,
      getWorld: () => createInitialWorldState()
    } as unknown as ConstructorParameters<typeof PhoneShell>[0]);
    const shellInternals = shell as unknown as {
      activeTab: string;
      renderActiveTab(container: { add: (child: unknown) => void }, x: number, y: number, panelWidth: number, contentHeight: number): void;
    };

    shellInternals.activeTab = "Threads";

    expect(() => shellInternals.renderActiveTab({ add: () => undefined }, 0, 0, 420, 320)).not.toThrow();
    expect(renderedText).toContain("Threads");
    expect(renderedText).toContain("Nothing here yet. Keep exploring Berawa.");
  });

  it("ships every Act 0 signup leaderboard row with real, labeled content", () => {
    expect(ACT0_SIGNUP_LEADERBOARD_ROWS).toHaveLength(3);
    for (const row of ACT0_SIGNUP_LEADERBOARD_ROWS) {
      expect(row.rank.trim()).not.toBe("");
      expect(row.driver.trim()).not.toBe("");
      expect(row.rating.trim()).not.toBe("");
      expect(row.deliveries.trim()).not.toBe("");
    }
  });
});
