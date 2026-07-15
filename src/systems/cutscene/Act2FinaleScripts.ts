import type { CutscenePoint, CutsceneScript } from "./CutsceneSequencer";

export const ACT2_SEAT_ARRIVAL_CUTSCENE_ID = "act2_sunday_sunset_seat";

export function buildAct2SeatArrivalCutscene(target: CutscenePoint): CutsceneScript {
  return {
    id: ACT2_SEAT_ARRIVAL_CUTSCENE_ID,
    after: "world",
    timeoutMs: 20_000,
    steps: [
      { id: "letterbox_in", kind: "letterbox_in", durationMs: 550 },
      { id: "find_both_circles", kind: "camera_pan", durationMs: 1_250, target },
      { id: "poster_hold", kind: "camera_hold", durationMs: 3_800 },
      {
        id: "the_seat",
        kind: "act_card",
        durationMs: 3_600,
        title: "SUNDAY · BERAWA BEACH",
        subtitle: "Two circles. One open place. Nobody asks what you can deliver."
      },
      { id: "letterbox_out", kind: "letterbox_out", durationMs: 750 }
    ]
  };
}
