import { describe, expect, it } from "vitest";
import { getAmbientNpcLine, getNpcDialogueSurface } from "../systems/dialogue/DialoguePresentation";
import { createInitialWorldState } from "../systems/WorldState";

describe("in-world dialogue presentation", () => {
  it("keeps quest, relationship, and Act 0 beats in full panels", () => {
    expect(getNpcDialogueSurface({ act0Critical: true })).toEqual({ surface: "panel", reason: "act0" });
    expect(getNpcDialogueSurface({ questCritical: true })).toEqual({ surface: "panel", reason: "quest" });
    expect(getNpcDialogueSurface({ relationshipBeat: true })).toEqual({ surface: "panel", reason: "relationship" });
  });

  it("routes minor NPC touches to ambient bubbles", () => {
    expect(getNpcDialogueSurface({})).toEqual({ surface: "ambient", reason: "minor" });
  });

  it("shortens low-stakes dialogue into a field-sized ambient line", () => {
    const world = createInitialWorldState();
    const line = getAmbientNpcLine(
      world,
      "ari",
      "The tide left coconuts, wax marks, and stories. Berawa provides. A second sentence should not block movement.",
      "checking the beach"
    );

    expect(line.length).toBeLessThanOrEqual(112);
    expect(line).toContain("The tide left coconuts");
    expect(line).toContain("checking the beach");
  });

  it("does not truncate a decimal number as if it were a sentence end", () => {
    const world = createInitialWorldState();

    expect(
      getAmbientNpcLine(
        world,
        "rio",
        "Rated 4.9. NusaDrop's optimal path says I should already be gone. You keeping up?",
        "showing off by Berawa Beach"
      )
    ).toBe("Rated 4.9 (showing off by Berawa Beach)");

    expect(
      getAmbientNpcLine(
        world,
        "pak_bagus",
        "Enclave Berawa is not a gated escape. It is a better system for this street.",
        "holding court near FINNS Recreation Club"
      )
    ).toBe(
      "Enclave Berawa is not a gated escape (holding court near FINNS Recreation Club)"
    );
  });

  it("surfaces scooter and rating reactions as ambient lines", () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    player.hasBike = true;
    player.bikeCondition = 24;
    expect(getAmbientNpcLine(world, "made", "Fallback line.")).toMatch(/bike is rattling/);

    player.bikeCondition = 80;
    world.life.hustle.driverRating = 3.1;
    expect(getAmbientNpcLine(world, "ibu_sari", "Fallback line.")).toMatch(/Ratings recover/);
  });

  it("keeps Kadek's ambient line free of retired mystery beats", () => {
    const world = createInitialWorldState();
    world.life.hustle.driverRating = 4.2;
    world.life.hustle.completedDeliveryCount = 5;
    expect(getAmbientNpcLine(world, "kadek", "Fallback line.", "checking the oven")).toContain("checking the oven");
  });
});
