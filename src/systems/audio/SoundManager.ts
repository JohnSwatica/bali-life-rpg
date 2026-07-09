export const AUDIO_MUTED_STORAGE_KEY = "bali-life-rpg.audio-muted";

export const SOUND_CUES = ["pickup", "payout", "uiClick", "toast", "sleep", "ambientLoop"] as const;
export type SoundCue = (typeof SOUND_CUES)[number];

type AudioContextConstructor = new () => AudioContext;

interface SoundManagerOptions {
  storage?: Pick<Storage, "getItem" | "setItem">;
  audioContextFactory?: () => AudioContext | null;
}

function getDefaultStorage(): Pick<Storage, "getItem" | "setItem"> | undefined {
  if (typeof localStorage === "undefined") {
    return undefined;
  }
  return localStorage;
}

function createDefaultAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }
  const audioWindow = window as Window & { webkitAudioContext?: AudioContextConstructor };
  const Context = window.AudioContext ?? audioWindow.webkitAudioContext;
  if (!Context) {
    return null;
  }
  return new Context();
}

export class SoundManager {
  private readonly storage?: Pick<Storage, "getItem" | "setItem">;
  private readonly audioContextFactory: () => AudioContext | null;
  private context: AudioContext | null = null;
  private muted: boolean;
  private unlocked = false;
  private ambientNodes: Array<AudioNode & { stop?: (when?: number) => void }> = [];

  constructor(options: SoundManagerOptions = {}) {
    this.storage = options.storage ?? getDefaultStorage();
    this.audioContextFactory = options.audioContextFactory ?? createDefaultAudioContext;
    this.muted = this.storage?.getItem(AUDIO_MUTED_STORAGE_KEY) === "true";
  }

  get isMuted(): boolean {
    return this.muted;
  }

  get isUnlocked(): boolean {
    return this.unlocked;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.storage?.setItem(AUDIO_MUTED_STORAGE_KEY, muted ? "true" : "false");
    if (muted) {
      this.stopAmbientLoop();
      return;
    }
    if (this.unlocked) {
      this.play("ambientLoop");
    }
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  unlock(): void {
    const context = this.getContext();
    if (!context) {
      return;
    }
    this.unlocked = true;
    const resume = context.state === "suspended" ? context.resume().catch(() => undefined) : Promise.resolve();
    void resume.then(() => {
      if (!this.muted) {
        this.play("ambientLoop");
      }
    });
  }

  play(cue: SoundCue): void {
    if (this.muted || !this.unlocked) {
      return;
    }
    const context = this.getContext();
    if (!context || context.state === "suspended") {
      return;
    }

    if (cue === "ambientLoop") {
      this.startAmbientLoop(context);
      return;
    }

    if (cue === "pickup") {
      this.playTone(context, 660, 0.08, 0.05, "triangle");
      this.playTone(context, 990, 0.12, 0.04, "sine", 0.045);
      return;
    }
    if (cue === "payout") {
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        this.playTone(context, frequency, 0.13, 0.055, "triangle", index * 0.075);
      });
      return;
    }
    if (cue === "uiClick") {
      this.playTone(context, 420, 0.035, 0.025, "square");
      return;
    }
    if (cue === "toast") {
      this.playTone(context, 740, 0.065, 0.027, "sine");
      this.playTone(context, 555, 0.09, 0.018, "sine", 0.035);
      return;
    }
    if (cue === "sleep") {
      [392, 329.63, 261.63].forEach((frequency, index) => {
        this.playTone(context, frequency, 0.42, 0.035, "sine", index * 0.08);
      });
    }
  }

  destroy(): void {
    this.stopAmbientLoop();
    void this.context?.close().catch(() => undefined);
    this.context = null;
  }

  private getContext(): AudioContext | null {
    if (!this.context) {
      this.context = this.audioContextFactory();
    }
    return this.context;
  }

  private playTone(
    context: AudioContext,
    frequency: number,
    durationSeconds: number,
    peakGain: number,
    type: OscillatorType,
    delaySeconds = 0
  ): void {
    const startAt = context.currentTime + delaySeconds;
    const endAt = startAt + durationSeconds;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peakGain), startAt + Math.min(0.025, durationSeconds * 0.35));
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  }

  private startAmbientLoop(context: AudioContext): void {
    if (this.ambientNodes.length > 0) {
      return;
    }

    const master = context.createGain();
    master.gain.setValueAtTime(0.018, context.currentTime);
    master.connect(context.destination);

    const low = context.createOscillator();
    low.type = "sine";
    low.frequency.setValueAtTime(196, context.currentTime);
    low.connect(master);
    low.start();

    const shimmer = context.createOscillator();
    shimmer.type = "triangle";
    shimmer.frequency.setValueAtTime(392, context.currentTime);
    const shimmerGain = context.createGain();
    shimmerGain.gain.setValueAtTime(0.006, context.currentTime);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(master);
    shimmer.start();

    this.ambientNodes = [low, shimmer, shimmerGain, master];
  }

  private stopAmbientLoop(): void {
    for (const node of this.ambientNodes) {
      node.stop?.();
      node.disconnect();
    }
    this.ambientNodes = [];
  }
}
