import { describe, expect, it } from "vitest";
import { AUDIO_MUTED_STORAGE_KEY, SOUND_CUES, SoundManager } from "../systems/audio/SoundManager";
import { installMemoryLocalStorage } from "./testUtils";

describe("sound manager", () => {
  installMemoryLocalStorage();

  it("exposes the procedural cue keys used by the game", () => {
    expect(SOUND_CUES).toEqual(["pickup", "payout", "uiClick", "toast", "sleep", "ambientLoop", "nearMiss"]);
  });

  it("persists mute state outside the versioned save", () => {
    const manager = new SoundManager({ storage: localStorage, audioContextFactory: () => null });

    expect(manager.isMuted).toBe(false);
    manager.setMuted(true);
    expect(localStorage.getItem(AUDIO_MUTED_STORAGE_KEY)).toBe("true");

    const rehydrated = new SoundManager({ storage: localStorage, audioContextFactory: () => null });
    expect(rehydrated.isMuted).toBe(true);

    rehydrated.setMuted(false);
    expect(localStorage.getItem(AUDIO_MUTED_STORAGE_KEY)).toBe("false");
  });

  it("does not throw when cues are played before audio unlocks", () => {
    const manager = new SoundManager({ storage: localStorage, audioContextFactory: () => null });

    for (const cue of SOUND_CUES) {
      expect(() => manager.play(cue)).not.toThrow();
    }
  });
});
