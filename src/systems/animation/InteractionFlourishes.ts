export type InteractionFlourishKind = "talk" | "pickup" | "delivery" | "activity";

export interface InteractionFlourishSpec {
  kind: InteractionFlourishKind;
  durationMs: number;
  ringColor: number;
  textColor: string;
  startScale: number;
  endScale: number;
}

const INTERACTION_FLOURISHES: Record<InteractionFlourishKind, InteractionFlourishSpec> = {
  talk: {
    kind: "talk",
    durationMs: 360,
    ringColor: 0xe6fff4,
    textColor: "#e6fff4",
    startScale: 0.86,
    endScale: 1.08
  },
  pickup: {
    kind: "pickup",
    durationMs: 420,
    ringColor: 0xfff0bd,
    textColor: "#fff0bd",
    startScale: 0.62,
    endScale: 1.42
  },
  delivery: {
    kind: "delivery",
    durationMs: 560,
    ringColor: 0x8ee6ff,
    textColor: "#8ee6ff",
    startScale: 0.72,
    endScale: 1.7
  },
  activity: {
    kind: "activity",
    durationMs: 520,
    ringColor: 0xf4d58d,
    textColor: "#f4d58d",
    startScale: 0.7,
    endScale: 1.52
  }
};

export function getInteractionFlourishSpec(kind: InteractionFlourishKind): InteractionFlourishSpec {
  return INTERACTION_FLOURISHES[kind];
}
