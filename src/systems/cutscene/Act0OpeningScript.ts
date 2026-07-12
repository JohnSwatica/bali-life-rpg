import type { CutscenePoint, CutsceneScript } from "./CutsceneSequencer";

export const ACT0_OPENING_CUTSCENE_ID = "act0_v4_bus_arrival";
export const ACT0_OPENING_DURATION_MS = 48_200;

export function buildAct0OpeningCutscene(input: {
  player: CutscenePoint;
  busStart: CutscenePoint;
  busExit: CutscenePoint;
  ibuStart: CutscenePoint;
  ibuEnd: CutscenePoint;
  station: CutscenePoint;
}): CutsceneScript {
  return {
    id: ACT0_OPENING_CUTSCENE_ID,
    after: "world",
    timeoutMs: 55_000,
    steps: [
      { id: "letterbox_in", kind: "letterbox_in", durationMs: 800 },
      {
        id: "bus_pulls_away",
        kind: "scripted_walk",
        actorId: "arrival_bus",
        durationMs: 4_200,
        waypoints: [input.busStart, input.busExit]
      },
      {
        id: "kos_scam_message",
        kind: "act_card",
        durationMs: 7_200,
        title: "PHONE — RESERVATION CANCELLED",
        subtitle: "Deposit received. Room unavailable.\nThe listing and contact disappear."
      },
      { id: "station_pan", kind: "camera_pan", durationMs: 3_200, target: input.station },
      {
        id: "stranded_card",
        kind: "act_card",
        durationMs: 5_800,
        title: "CANGGU STATION — BEFORE DAWN",
        subtitle: "One backpack. Rp 70. No room.\nThe bus is already gone."
      },
      {
        id: "ibu_crosses_street",
        kind: "scripted_walk",
        actorId: "ibu_sari_cutscene",
        durationMs: 5_400,
        waypoints: [input.ibuStart, input.ibuEnd]
      },
      {
        id: "ibu_anchor_line",
        kind: "act_card",
        durationMs: 7_200,
        title: "IBU SARI",
        subtitle: "‘A scam? Sit. Breathe first.\nBerawa is hard when nobody knows your name.’"
      },
      {
        id: "ibu_offer_line",
        kind: "act_card",
        durationMs: 7_800,
        title: "IBU SARI",
        subtitle: "‘My husband’s old scooter still starts — loudly.\nGet this catering box to Milk & Madu in 15 minutes, and it is yours on credit.’"
      },
      { id: "camera_return", kind: "camera_return", durationMs: 4_800 },
      { id: "letterbox_out", kind: "letterbox_out", durationMs: 1_800 }
    ]
  };
}
