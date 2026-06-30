import type { NpcDefinition, NpcIdleTag } from "../../types";

export interface NpcIdleVisual {
  tag: NpcIdleTag;
  cue: string;
  angleDegrees: number;
  scaleY: number;
  labelYOffset: number;
  labelAlpha: number;
}

interface NpcIdleDefinition {
  cue: string;
  cycleMs: number;
  angleAmplitude: number;
  bobAmplitude: number;
}

const IDLE_DEFINITIONS: Record<NpcIdleTag, NpcIdleDefinition> = {
  tidy_counter: {
    cue: "tidies",
    cycleMs: 1350,
    angleAmplitude: 1.6,
    bobAmplitude: 1.5
  },
  knead_oven: {
    cue: "checks oven",
    cycleMs: 1100,
    angleAmplitude: 1,
    bobAmplitude: 2
  },
  laptop_sip: {
    cue: "types",
    cycleMs: 1800,
    angleAmplitude: 0.8,
    bobAmplitude: 1
  },
  tinker_board: {
    cue: "tinkers",
    cycleMs: 1450,
    angleAmplitude: 1.3,
    bobAmplitude: 1.4
  },
  generic_idle: {
    cue: "looks around",
    cycleMs: 1600,
    angleAmplitude: 0.6,
    bobAmplitude: 0.8
  }
};

export function getNpcIdleTag(npc: Pick<NpcDefinition, "idleTag">): NpcIdleTag {
  return npc.idleTag ?? "generic_idle";
}

export function getNpcIdleCue(npc: Pick<NpcDefinition, "idleTag">): string {
  return IDLE_DEFINITIONS[getNpcIdleTag(npc)].cue;
}

export function getNpcIdleVisual(npc: Pick<NpcDefinition, "idleTag">, elapsedMs: number): NpcIdleVisual {
  const tag = getNpcIdleTag(npc);
  const definition = IDLE_DEFINITIONS[tag];
  const cycle = ((elapsedMs % definition.cycleMs) + definition.cycleMs) % definition.cycleMs;
  const phase = (cycle / definition.cycleMs) * Math.PI * 2;
  const wave = Math.sin(phase);
  const lift = Math.max(0, wave);

  return {
    tag,
    cue: definition.cue,
    angleDegrees: wave * definition.angleAmplitude,
    scaleY: 1 + lift * 0.025,
    labelYOffset: -lift * definition.bobAmplitude,
    labelAlpha: 0.68 + lift * 0.2
  };
}
