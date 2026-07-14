import type { CutsceneScript } from "./CutsceneSequencer";

export function buildAct1MoveOutMontage(): CutsceneScript {
  return {
    id: "act1_move_out_montage",
    after: "world",
    timeoutMs: 8200,
    steps: [
      { id: "letterbox_in", kind: "letterbox_in", durationMs: 420 },
      {
        id: "pack_kos",
        kind: "act_card",
        durationMs: 1900,
        title: "PACKING THE KOS",
        subtitle: "One bag. One tired mattress. Nothing here was wasted."
      },
      {
        id: "look_back",
        kind: "act_card",
        durationMs: 1700,
        title: "ONE LOOK BACK",
        subtitle: "The room kept the rain out. Ibu Sari did the rest."
      },
      {
        id: "shared_room",
        kind: "act_card",
        durationMs: 2100,
        title: "A SHARED ROOM",
        subtitle: "Two mattresses. A fan. A window with light. Modest, but forward."
      },
      { id: "letterbox_out", kind: "letterbox_out", durationMs: 420 }
    ]
  };
}
