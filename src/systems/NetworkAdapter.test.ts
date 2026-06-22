import { describe, expect, it } from "vitest";
import { createInitialWorldState } from "./WorldState";
import { LocalNetworkAdapter, type WorldPatch } from "./NetworkAdapter";

describe("LocalNetworkAdapter", () => {
  it("emits an initial world patch on connect", async () => {
    const world = createInitialWorldState();
    const adapter = new LocalNetworkAdapter();
    const patches: WorldPatch[] = [];
    adapter.subscribeToWorldPatches((patch) => patches.push(patch));

    await adapter.connect(world);

    expect(patches).toHaveLength(1);
    expect(patches[0]).toMatchObject({
      world: { neighborhoodId: "berawa-finns-club" }
    });
    expect(Number.isFinite(patches[0].serverTick)).toBe(true);
  });

  it("only echoes local player movement patches while connected and subscribed", async () => {
    const world = createInitialWorldState();
    const player = world.players[world.localPlayerId];
    const adapter = new LocalNetworkAdapter();
    const patches: WorldPatch[] = [];
    const unsubscribe = adapter.subscribeToWorldPatches((patch) => patches.push(patch));

    adapter.pushLocalPlayer(player);
    expect(patches).toEqual([]);

    await adapter.connect(world);
    player.x = 123;
    player.y = 456;
    player.direction = "left";
    player.onBike = true;
    player.bikeStuck = true;
    player.activeGroupId = "surf_morning_regulars";
    player.groupTravelMode = "bike";

    adapter.pushLocalPlayer(player);

    expect(patches.at(-1)?.players?.[player.id]).toEqual({
      x: 123,
      y: 456,
      direction: "left",
      onBike: true,
      bikeStuck: true,
      activeGroupId: "surf_morning_regulars",
      groupTravelMode: "bike"
    });

    unsubscribe();
    adapter.pushLocalPlayer(player);
    expect(patches).toHaveLength(2);

    adapter.disconnect();
  });
});
