import type { CutsceneScript } from "./CutsceneSequencer";

export function buildAct1IntroCutscene(rentAmount: number, rentDueDay: number, showRateCut = false): CutsceneScript {
  const rateCutSteps = showRateCut
    ? [
        {
          id: "nusadrop_rate_cut",
          kind: "act_card" as const,
          durationMs: 2600,
          title: "NUSADROP UPDATE",
          subtitle: "Base delivery pay -15%\nSurge Zones introduced"
        }
      ]
    : [];
  return {
    id: "act1_intro_card",
    after: "morning_hand",
    timeoutMs: showRateCut ? 7000 : 4200,
    steps: [
      { id: "letterbox_in", kind: "letterbox_in", durationMs: 420 },
      {
        id: "act1_card",
        kind: "act_card",
        durationMs: 2200,
        title: "ACT 1 -- THE HUSTLE",
        subtitle: `Rent: Rp ${rentAmount} by Day ${rentDueDay}`
      },
      ...rateCutSteps,
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
        subtitle: "The beach, crews, and regulars start to open.\nThere's more to a life here than energy and rupiah."
      },
      { id: "camera_return", kind: "camera_return", durationMs: 620 },
      { id: "letterbox_out", kind: "letterbox_out", durationMs: 420 }
    ]
  };
}
