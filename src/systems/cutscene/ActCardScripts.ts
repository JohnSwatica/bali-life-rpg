import type { CutsceneScript } from "./CutsceneSequencer";

export function buildAct1IntroCutscene(rentAmount: number, rentDueDay: number): CutsceneScript {
  return {
    id: "act1_intro_card",
    after: "morning_hand",
    timeoutMs: 4200,
    steps: [
      { id: "letterbox_in", kind: "letterbox_in", durationMs: 420 },
      {
        id: "act1_card",
        kind: "act_card",
        durationMs: 2200,
        title: "ACT 1 -- THE HUSTLE",
        subtitle: `Rent: Rp ${rentAmount} by Day ${rentDueDay}`
      },
      { id: "letterbox_out", kind: "letterbox_out", durationMs: 420 }
    ]
  };
}

export function buildAct2IntroCutscene(target: { x: number; y: number }): CutsceneScript {
  return {
    id: "act2_intro_card",
    after: "world",
    timeoutMs: 5600,
    steps: [
      { id: "letterbox_in", kind: "letterbox_in", durationMs: 420 },
      { id: "beach_pan", kind: "camera_pan", durationMs: 900, target },
      {
        id: "act2_card",
        kind: "act_card",
        durationMs: 2200,
        title: "ACT 2 -- FINDING YOUR PEOPLE",
        subtitle: "The beach, crews, and regulars start to open."
      },
      { id: "camera_return", kind: "camera_return", durationMs: 620 },
      { id: "letterbox_out", kind: "letterbox_out", durationMs: 420 }
    ]
  };
}
