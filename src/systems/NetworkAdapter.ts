import type { GameIntent, PlayerEntityState, WorldState } from "../types";

export interface WorldPatch {
  serverTick: number;
  players?: Record<string, Partial<PlayerEntityState>>;
  world?: Partial<WorldState>;
}

export interface NetworkAdapter {
  connect(world: WorldState): Promise<void>;
  disconnect(): void;
  pushLocalPlayer(player: PlayerEntityState): void;
  pushIntent(intent: GameIntent): void;
  subscribeToWorldPatches(onPatch: (patch: WorldPatch) => void): () => void;
}

export class LocalNetworkAdapter implements NetworkAdapter {
  private patchHandler?: (patch: WorldPatch) => void;
  private connected = false;

  async connect(world: WorldState): Promise<void> {
    this.connected = true;
    this.patchHandler?.({
      serverTick: Date.now(),
      world: { neighborhoodId: world.neighborhoodId }
    });
  }

  disconnect(): void {
    this.connected = false;
  }

  pushLocalPlayer(player: PlayerEntityState): void {
    if (!this.connected) {
      return;
    }

    // Later this becomes a client input packet, not a trusted position write.
    this.patchHandler?.({
      serverTick: Date.now(),
      players: {
        [player.id]: {
          x: player.x,
          y: player.y,
          direction: player.direction,
          onBike: player.onBike,
          bikeStuck: player.bikeStuck,
          activeGroupId: player.activeGroupId,
          groupTravelMode: player.groupTravelMode
        }
      }
    });
  }

  pushIntent(_intent: GameIntent): void {
    // Placeholder: future multiplayer sends client intents for server-authoritative handling.
  }

  subscribeToWorldPatches(onPatch: (patch: WorldPatch) => void): () => void {
    this.patchHandler = onPatch;
    return () => {
      this.patchHandler = undefined;
    };
  }
}
