import { describe, expect, it } from "vitest";
import {
  AMBIENT_BEDS,
  AUDIO_MUTED_STORAGE_KEY,
  selectAmbientBed,
  SOUND_CUES,
  SoundManager
} from "../systems/audio/SoundManager";
import { installMemoryLocalStorage } from "./testUtils";

describe("sound manager", () => {
  installMemoryLocalStorage();

  it("exposes the procedural cue keys used by the game", () => {
    expect(SOUND_CUES).toEqual(["pickup", "payout", "uiClick", "toast", "sleep", "ambientLoop", "nearMiss", "thunder", "breakdown"]);
    expect(AMBIENT_BEDS).toEqual(["morningStreet", "cafeInterior", "rain", "nightQuiet"]);
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

  it("selects beds by weather, scene, and time phase", () => {
    expect(selectAmbientBed({ phase: "day", weather: "clear", scene: "street" })).toBe("morningStreet");
    expect(selectAmbientBed({ phase: "day", weather: "clear", scene: "cafeInterior" })).toBe("cafeInterior");
    expect(selectAmbientBed({ phase: "night", weather: "clear", scene: "street" })).toBe("nightQuiet");
    expect(selectAmbientBed({ phase: "night", weather: "storm", scene: "cafeInterior" })).toBe("rain");
  });

  it("changes the requested bed idempotently without bypassing mute", () => {
    const manager = new SoundManager({ storage: localStorage, audioContextFactory: () => null });
    manager.setMuted(true);
    expect(manager.setAmbientBed("rain")).toBe(true);
    expect(manager.setAmbientBed("rain")).toBe(false);
    expect(manager.currentAmbientBed).toBe("rain");
    expect(manager.isMuted).toBe(true);
  });
});
