import { describe, expect, it } from "vitest";
import { getPortraitDataUrl, getPortraitDefinition, portraitVariantForTier } from "../systems/dialogue/PortraitArt";

describe("dialogue portrait art", () => {
  it("registers the first three authored NPC portrait busts and falls back for unknown NPCs", () => {
    expect(getPortraitDefinition("ibu_sari")).toMatchObject({ alt: "Ibu Sari portrait" });
    expect(getPortraitDefinition("kadek")).toMatchObject({ alt: "Kadek portrait" });
    expect(getPortraitDefinition("rio")).toMatchObject({ alt: "Leo portrait" });
    expect(getPortraitDefinition("made")).toMatchObject({ alt: "Made portrait" });
    expect(getPortraitDefinition("ari")).toBeNull();
    expect(getPortraitDefinition("unknown")).toBeNull();
  });

  it("maps relationship affinity tiers to neutral or warm portrait variants", () => {
    expect(portraitVariantForTier("stranger")).toBe("neutral");
    expect(portraitVariantForTier("acquaintance")).toBe("neutral");
    expect(portraitVariantForTier("friendly")).toBe("warm");
    expect(portraitVariantForTier("regular")).toBe("warm");
    expect(portraitVariantForTier("trusted")).toBe("warm");
  });

  it("does not require a DOM canvas in headless tests", () => {
    expect(getPortraitDataUrl("ibu_sari", "neutral")).toBeNull();
  });
});
