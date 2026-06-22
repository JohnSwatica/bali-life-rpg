import { describe, expect, it } from "vitest";
import { activityDefinitions } from "../../data/community";
import { pickupDefinitions } from "../../data/map";
import { shopDefinitions } from "../../data/shops";
import { InteractionController, type InteractionOffender, type InteractionTarget } from "./InteractionController";

describe("InteractionController priority", () => {
  it("prioritizes NPCs over an overlapping shop target", () => {
    const shop = shopDefinitions.canggu_station;
    const controller = makeController({
      player: { x: shop.x, y: shop.y },
      npcs: {
        ibu_sari: { x: shop.x + 28, y: shop.y + 12 }
      }
    });

    expect(controller.getNearestInteraction()).toMatchObject({
      type: "npc",
      id: "ibu_sari"
    });
  });

  it("prioritizes flagged offenders over shops and ignores unflagged offenders", () => {
    const shop = shopDefinitions.canggu_station;
    const flagged = makeOffender("reckless-rider", shop.x, shop.y, 1);
    const clean = makeOffender("clean-rider", shop.x, shop.y, 0);

    expect(
      makeController({
        player: { x: shop.x, y: shop.y },
        offenders: [flagged]
      }).getNearestInteraction()
    ).toMatchObject({
      type: "offender",
      id: "reckless-rider"
    });

    expect(
      makeController({
        player: { x: shop.x, y: shop.y },
        offenders: [clean]
      }).getNearestInteraction()
    ).toMatchObject({
      type: "shop",
      id: "canggu_station"
    });
  });

  it("prioritizes shop entry over the lower-priority non-shop venue visit target", () => {
    const controller = makeController({
      // This point is inside both Bali Family Rental Scooter's shop radius and Ruko Cafe's venue radius.
      player: { x: 2192, y: 1832 }
    });

    expect(controller.getNearestInteraction()).toMatchObject({
      type: "shop",
      id: "bali_family_rental_scooter"
    });
  });

  it("returns standalone activity and pickup targets when no higher-priority target is nearby", () => {
    const activity = activityDefinitions.find((candidate) => candidate.id === "scooter_safety_reset");
    expect(activity).toBeDefined();
    expect(makeController({ player: { x: activity!.x, y: activity!.y } }).getNearestInteraction()).toMatchObject({
      type: "activity",
      id: "scooter_safety_reset"
    });

    const pickup = pickupDefinitions.find((candidate) => candidate.id === "coconut-west");
    expect(pickup).toBeDefined();
    expect(makeController({ player: { x: pickup!.x, y: pickup!.y } }).getNearestInteraction()).toMatchObject({
      type: "pickup",
      id: "coconut-west"
    });
  });

  it("uses distance within the same priority and stable definition order for exact ties", () => {
    const closerNpc = makeController({
      player: { x: 100, y: 100 },
      npcs: {
        ibu_sari: { x: 140, y: 100 },
        kadek: { x: 110, y: 100 }
      }
    });
    expect(closerNpc.getNearestInteraction()).toMatchObject({ type: "npc", id: "kadek" });

    const tiedNpc = makeController({
      player: { x: 100, y: 100 },
      npcs: {
        ibu_sari: { x: 120, y: 100 },
        kadek: { x: 120, y: 100 }
      }
    });
    expect(tiedNpc.getNearestInteraction()).toMatchObject({ type: "npc", id: "ibu_sari" });
  });

  it("dispatches each target type to the matching handler", () => {
    const controller = makeController({ player: { x: 0, y: 0 } });
    const calls: string[] = [];
    const handlers = {
      npc: (id: string) => calls.push(`npc:${id}`),
      shop: (id: string) => calls.push(`shop:${id}`),
      venue: (id: string) => calls.push(`venue:${id}`),
      pickup: (id: string) => calls.push(`pickup:${id}`),
      activity: (id: string) => calls.push(`activity:${id}`),
      offender: (id: string) => calls.push(`offender:${id}`)
    };

    for (const target of [
      { type: "npc", id: "ibu_sari", label: "", distance: 0 },
      { type: "shop", id: "canggu_station", label: "", distance: 0 },
      { type: "venue", id: "ruko_cafe", label: "", distance: 0 },
      { type: "pickup", id: "coconut-west", label: "", distance: 0 },
      { type: "activity", id: "scooter_safety_reset", label: "", distance: 0 },
      { type: "offender", id: "reckless-rider", label: "", distance: 0 }
    ] satisfies InteractionTarget[]) {
      controller.resolveTarget(target, handlers);
    }

    expect(calls).toEqual([
      "npc:ibu_sari",
      "shop:canggu_station",
      "venue:ruko_cafe",
      "pickup:coconut-west",
      "activity:scooter_safety_reset",
      "offender:reckless-rider"
    ]);
  });
});

function makeController(options: {
  player: { x: number; y: number };
  npcs?: Record<string, { x: number; y: number }>;
  offenders?: InteractionOffender[];
}): InteractionController {
  return new InteractionController({
    getPlayerPosition: () => options.player,
    getNpcSprite: (npcId) => options.npcs?.[npcId] as Phaser.Physics.Arcade.Sprite | undefined,
    isPickupAvailable: () => true,
    getWantedOffenders: () => options.offenders ?? [],
    getOffenderReward: () => 50
  });
}

function makeOffender(id: string, x: number, y: number, wantedLevel: number): InteractionOffender {
  return {
    id,
    name: id,
    sprite: { x, y } as Phaser.GameObjects.Sprite,
    cash: 100,
    wantedLevel
  };
}
