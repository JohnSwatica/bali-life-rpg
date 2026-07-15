import { describe, expect, it, vi } from "vitest";

vi.mock("phaser", () => ({
  default: {}
}));

import { createInitialWorldState } from "../systems/WorldState";
import { completeMadeRoomOfferScene } from "../systems/story/Act1MadeRoomOffer";
import {
  ACT0_SIGNUP_LEADERBOARD_ROWS,
  getPhoneFeedModel,
  getPhoneVisibleTabs,
  PHONE_VISIBLE_TABS,
  PhoneShell
} from "../ui/phone/PhoneShell";
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

  it("exposes only Feed, Map, Goals, and Profile in the tab strip", () => {
    expect(PHONE_VISIBLE_TABS).toEqual(["Feed", "Map", "Goals", "Profile"]);
    expect(PHONE_VISIBLE_TABS).not.toContain("Contacts");
    expect(PHONE_VISIBLE_TABS).not.toContain("Threads");
    expect(PHONE_VISIBLE_TABS).not.toContain("Calendar");
    expect(PHONE_VISIBLE_TABS).not.toContain("Events");
    expect(PHONE_VISIBLE_TABS).not.toContain("Venues");
    expect(PHONE_VISIBLE_TABS).not.toContain("Community");
  });

  it("re-opens Calendar only after Act 2 entry without reviving Community", () => {
    const world = createInitialWorldState();
    expect(getPhoneVisibleTabs(world)).toEqual(["Feed", "Map", "Goals", "Profile"]);

    world.life.actProgress.currentAct = 2;
    expect(getPhoneVisibleTabs(world)).toEqual(["Feed", "Map", "Goals", "Calendar", "Profile"]);
    expect(getPhoneVisibleTabs(world)).not.toContain("Community");
  });

  it("orders story and goal messages before paying jobs, then ambient content", () => {
    const world = createInitialWorldState();
    world.opportunities.messages.push(
      { id: "ambient:1", at: 300, from: "Ari", body: "Beach later?", read: false },
      { id: "story:act1:test", at: 100, from: "Made", body: "Come talk.", read: false }
    );
    world.opportunities.live.push(
      {
        id: "ambient-live",
        templateId: "beach_tide_tip",
        status: "live",
        spawnedAt: 20,
        expiresAt: 90,
        locationVenueId: "berawa_beach"
      },
      {
        id: "paying-live",
        templateId: "no_questions_package",
        status: "live",
        spawnedAt: 30,
        expiresAt: 120,
        locationVenueId: "bali_family_rental_scooter"
      }
    );

    const model = getPhoneFeedModel(world);
    expect(model.priorityMessages.map((message) => message.id)).toEqual(["story:act1:test"]);
    expect(model.payingOpportunities.map((opportunity) => opportunity.id)).toEqual(["paying-live"]);
    expect(model.otherOpportunities.map((opportunity) => opportunity.id)).toEqual(["ambient-live"]);
    expect(model.otherMessages.map((message) => message.id)).toEqual(["ambient:1"]);
  });

  it("surfaces unread story pings ahead of newer read history", () => {
    const world = createInitialWorldState();
    world.opportunities.messages.push(
      { id: "story:read-history", at: 900, from: "NusaDrop", body: "Old update", read: true },
      { id: "story:busy-night", at: 100, from: "Ibu Sari", body: "Busy night.", read: false }
    );

    expect(getPhoneFeedModel(world).priorityMessages.map((message) => message.id)).toEqual([
      "story:busy-night",
      "story:read-history"
    ]);
  });

  it("renders Made's tracked room goal in the Goals tab", () => {
    const world = createInitialWorldState();
    world.life.actProgress.currentAct = 1;
    world.life.actProgress.firstDayComplete = true;
    world.life.hustle.completedDeliveryCount = 3;
    completeMadeRoomOfferScene(world, 900);
    const renderedText: string[] = [];
    const fakeScene = {
      add: {
        text: (_x: number, _y: number, value: string) => {
          renderedText.push(value);
          return {};
        }
      }
    };
    const shell = new PhoneShell({
      scene: fakeScene,
      getWorld: () => world
    } as unknown as ConstructorParameters<typeof PhoneShell>[0]);
    const shellInternals = shell as unknown as {
      activeTab: string;
      renderActiveTab(container: { add: (child: unknown) => void }, x: number, y: number, panelWidth: number, contentHeight: number): void;
    };

    shellInternals.activeTab = "Goals";
    shellInternals.renderActiveTab({ add: () => undefined }, 0, 0, 420, 320);

    expect(renderedText).toContain("Goals");
    expect(renderedText.join("\n")).toContain("Made's room");
    expect(renderedText.join("\n")).toContain("recommendation letter ✗");
    expect(renderedText.join("\n")).not.toContain("No active quests. Talk to Ibu Sari or Kadek.");
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
