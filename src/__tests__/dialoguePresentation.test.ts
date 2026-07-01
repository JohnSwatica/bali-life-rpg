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
        "Rated 4.9, delivered in record time. You keeping up, new guy?",
        "showing off by Berawa Beach"
      )
    ).toBe("Rated 4.9, delivered in record time (showing off by Berawa Beach)");

    expect(
      getAmbientNpcLine(
        world,
        "pak_bagus",
        "Berawa 2.0 isn't just buildings -- it's a promise to this street. You'll see.",
        "holding court near FINNS Recreation Club"
      )
    ).toBe(
      "Berawa 2.0 isn't just buildings -- it's a promise to this street (holding court near FINNS Recreation Club)"
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

  it("seeds Kadek's early Elena reaction after the notebook pickup", () => {
    const world = createInitialWorldState();
    world.collectedPickups["elena-notebook-seat"] = 1;
    world.life.hustle.driverRating = 4.2;
    world.life.hustle.completedDeliveryCount = 2;

    expect(getAmbientNpcLine(world, "kadek", "Fallback line.", "checking the oven")).toBe(
      "\"Hey, that's--\" He stops himself and goes back to the oven."
    );

    world.life.hustle.completedDeliveryCount = 10;

    expect(getAmbientNpcLine(world, "kadek", "Fallback line.", "checking the oven")).toContain("checking the oven");
  });

  it("seeds Kadek's Act 1 Rumah bike reveal after five deliveries", () => {
    const world = createInitialWorldState();
    world.life.hustle.driverRating = 4.2;

    world.life.hustle.completedDeliveryCount = 4;
    expect(getAmbientNpcLine(world, "kadek", "Fallback line.", "checking the oven")).toContain("checking the oven");

    world.life.hustle.completedDeliveryCount = 5;
    expect(getAmbientNpcLine(world, "kadek", "Fallback line.", "checking the oven")).toBe(
      "\"That's Rumah's old bike.\" He says it plainly this time, then goes quiet."
    );

    world.life.hustle.completedDeliveryCount = 9;
    expect(getAmbientNpcLine(world, "kadek", "Fallback line.", "checking the oven")).toBe(
      "\"That's Rumah's old bike.\" He says it plainly this time, then goes quiet."
    );

    world.life.hustle.completedDeliveryCount = 10;
    expect(getAmbientNpcLine(world, "kadek", "Fallback line.", "checking the oven")).toContain("checking the oven");
  });
});
