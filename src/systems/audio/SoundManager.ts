import { AUDIO_FEEL_TUNING } from "../../tuning/FeelTuning";
import type { TimePhase } from "../../types";
import type { WeatherKind } from "../weather/WorldWeather";

export const AUDIO_MUTED_STORAGE_KEY = "bali-life-rpg.audio-muted";

export const SOUND_CUES = ["pickup", "payout", "uiClick", "toast", "sleep", "ambientLoop", "nearMiss", "thunder", "breakdown"] as const;
export type SoundCue = (typeof SOUND_CUES)[number];

export const AMBIENT_BEDS = ["morningStreet", "cafeInterior", "rain", "nightQuiet"] as const;
export type AmbientBed = (typeof AMBIENT_BEDS)[number];
export type AmbientScene = "street" | "cafeInterior" | "interior";

export function selectAmbientBed(input: {
  phase: TimePhase;
  weather: WeatherKind;
  scene: AmbientScene;
}): AmbientBed {
  if (input.weather === "rain" || input.weather === "storm") {
    return "rain";
  }
  if (input.scene === "cafeInterior") {
    return "cafeInterior";
  }
  if (input.phase === "night") {
    return "nightQuiet";
  }
  return "morningStreet";
}

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
  private ambientBed: AmbientBed = "morningStreet";
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

  get currentAmbientBed(): AmbientBed {
    return this.ambientBed;
  }

  setAmbientBed(bed: AmbientBed): boolean {
    if (this.ambientBed === bed) {
      return false;
    }
    this.ambientBed = bed;
    this.stopAmbientLoop();
    if (!this.muted && this.unlocked) {
      const context = this.getContext();
      if (context && context.state !== "suspended") {
        this.startAmbientLoop(context);
      }
    }
    return true;
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
      this.playTone(context, 660, 0.08, AUDIO_FEEL_TUNING.pickupPrimaryGain, "triangle");
      this.playTone(context, 990, 0.12, AUDIO_FEEL_TUNING.pickupAccentGain, "sine", 0.045);
      return;
    }
    if (cue === "payout") {
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        this.playTone(context, frequency, 0.13, AUDIO_FEEL_TUNING.payoutGain, "triangle", index * 0.075);
      });
      return;
    }
    if (cue === "uiClick") {
      this.playTone(context, 420, 0.035, AUDIO_FEEL_TUNING.uiClickGain, "square");
      return;
    }
    if (cue === "toast") {
      this.playTone(context, 740, 0.065, AUDIO_FEEL_TUNING.toastPrimaryGain, "sine");
      this.playTone(context, 555, 0.09, AUDIO_FEEL_TUNING.toastSecondaryGain, "sine", 0.035);
      return;
    }
    if (cue === "sleep") {
      [392, 329.63, 261.63].forEach((frequency, index) => {
        this.playTone(context, frequency, 0.42, AUDIO_FEEL_TUNING.sleepGain, "sine", index * 0.08);
      });
      return;
    }
    if (cue === "nearMiss") {
      this.playTone(context, 880, 0.045, AUDIO_FEEL_TUNING.nearMissPrimaryGain, "sine");
      this.playTone(context, 620, 0.07, AUDIO_FEEL_TUNING.nearMissSecondaryGain, "triangle", 0.03);
      return;
    }
    if (cue === "thunder") {
      this.playTone(context, 58, 0.72, AUDIO_FEEL_TUNING.thunderLowGain, "sawtooth");
      this.playTone(context, 91, 0.42, AUDIO_FEEL_TUNING.thunderCrackGain, "square", 0.025);
      return;
    }
    if (cue === "breakdown") {
      this.playTone(context, 132, 0.32, AUDIO_FEEL_TUNING.thunderCrackGain, "sawtooth");
      this.playTone(context, 74, 0.58, AUDIO_FEEL_TUNING.thunderLowGain, "square", 0.08);
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
    master.gain.setValueAtTime(AUDIO_FEEL_TUNING.ambientMasterGain, context.currentTime);
    master.connect(context.destination);
    const nodes: Array<AudioNode & { stop?: (when?: number) => void }> = [master];

    if (this.ambientBed === "rain") {
      const rain = context.createBufferSource();
      rain.buffer = this.createNoiseBuffer(context);
      rain.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2600, context.currentTime);
      const rainGain = context.createGain();
      rainGain.gain.setValueAtTime(AUDIO_FEEL_TUNING.rainBedGain, context.currentTime);
      rain.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(master);
      rain.start();
      nodes.push(rain, filter, rainGain, ...this.createAmbientOscillator(context, 72, "sine", master));
    } else if (this.ambientBed === "cafeInterior") {
      const chatter = context.createBufferSource();
      chatter.buffer = this.createNoiseBuffer(context);
      chatter.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(780, context.currentTime);
      filter.Q.setValueAtTime(0.7, context.currentTime);
      const chatterGain = context.createGain();
      chatterGain.gain.setValueAtTime(AUDIO_FEEL_TUNING.cafeChatterGain, context.currentTime);
      chatter.connect(filter);
      filter.connect(chatterGain);
      chatterGain.connect(master);
      chatter.start();
      nodes.push(
        chatter,
        filter,
        chatterGain,
        ...this.createAmbientOscillator(context, 147, "sine", master),
        ...this.createAmbientOscillator(context, 1160, "triangle", master, AUDIO_FEEL_TUNING.espressoTextureGain)
      );
    } else if (this.ambientBed === "nightQuiet") {
      nodes.push(
        ...this.createAmbientOscillator(context, 110, "sine", master),
        ...this.createAmbientOscillator(context, 3180, "sine", master, AUDIO_FEEL_TUNING.cricketGain),
        ...this.createAmbientOscillator(context, 3670, "triangle", master, AUDIO_FEEL_TUNING.cricketEchoGain)
      );
    } else {
      nodes.push(
        ...this.createAmbientOscillator(context, 196, "sine", master),
        ...this.createAmbientOscillator(
          context,
          392,
          "triangle",
          master,
          AUDIO_FEEL_TUNING.ambientShimmerGain
        )
      );
    }

    this.ambientNodes = nodes;
  }

  private createAmbientOscillator(
    context: AudioContext,
    frequency: number,
    type: OscillatorType,
    destination: AudioNode,
    gainValue?: number
  ): Array<AudioNode & { stop?: (when?: number) => void }> {
    const oscillator = context.createOscillator();
    const nodes: Array<AudioNode & { stop?: (when?: number) => void }> = [oscillator];
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    if (gainValue == null) {
      oscillator.connect(destination);
    } else {
      const gain = context.createGain();
      gain.gain.setValueAtTime(gainValue, context.currentTime);
      oscillator.connect(gain);
      gain.connect(destination);
      nodes.push(gain);
    }
    oscillator.start();
    return nodes;
  }

  private createNoiseBuffer(context: AudioContext): AudioBuffer {
    const length = Math.max(1, Math.floor(context.sampleRate * 2));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private stopAmbientLoop(): void {
    for (const node of this.ambientNodes) {
      node.stop?.();
      node.disconnect();
    }
    this.ambientNodes = [];
  }
}
