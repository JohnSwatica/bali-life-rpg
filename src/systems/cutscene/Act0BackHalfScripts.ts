import type { CutsceneScript } from "./CutsceneSequencer";
import type { Act0DepositResolution } from "../story/Act0BackHalf";

export const ACT0_CAFE_SCENE_ID = "act0_milk_madu_scene";
export const ACT0_LANDLORD_ULTIMATUM_ID = "act0_landlord_ultimatum";
export const ACT0_KOS_RESOLVE_ID = "act0_kos_deposit_resolve";
export const ACT0_COLLAPSE_ID = "act0_kos_collapse";

export function buildAct0CafeScene(): CutsceneScript {
  return {
    id: ACT0_CAFE_SCENE_ID,
    after: "world",
    timeoutMs: 42_000,
    steps: [
      { id: "letterbox_in", kind: "letterbox_in", durationMs: 700 },
      { id: "room_breathes", kind: "camera_hold", durationMs: 3_000 },
      {
        id: "plate_and_coffee",
        kind: "act_card",
        durationMs: 5_600,
        title: "MILK & MADU · HIGH NOON",
        subtitle: "A plate lands. Then coffee. Around you, laptop nomads keep building lives that already look finished."
      },
      {
        id: "vance_parking_one",
        kind: "act_card",
        durationMs: 5_400,
        title: "JULIAN VANCE · AT THE COUNTER",
        subtitle: "‘The scooter noise outside is incompatible with a premium corridor.’"
      },
      {
        id: "vance_parking_two",
        kind: "act_card",
        durationMs: 5_200,
        title: "BARISTA",
        subtitle: "‘Drivers bring the food, Pak.’\n\nJulian checks his watch instead of answering."
      },
      {
        id: "vance_parking_three",
        kind: "act_card",
        durationMs: 5_200,
        title: "JULIAN VANCE",
        subtitle: "‘Then give them a service entrance. People are trying to work.’"
      },
      { id: "phone_buzz", kind: "camera_hold", durationMs: 2_400 },
      { id: "letterbox_out", kind: "letterbox_out", durationMs: 900 }
    ]
  };
}

export function buildAct0LandlordUltimatumScene(target: number, wallet: number): CutsceneScript {
  return {
    id: ACT0_LANDLORD_ULTIMATUM_ID,
    after: "world",
    timeoutMs: 24_000,
    steps: [
      { id: "letterbox_in", kind: "letterbox_in", durationMs: 500 },
      {
        id: "landlord_alert",
        kind: "act_card",
        durationMs: 6_200,
        title: "KOS LANDLORD · FINAL NOTICE",
        subtitle: `No employment contract. Deposit doubled to Rp ${target}. Due by MIDNIGHT or the room locks.`
      },
      {
        id: "deposit_gap",
        kind: "act_card",
        durationMs: 5_200,
        title: `WALLET Rp ${wallet} · TARGET Rp ${target}`,
        subtitle: "The target stays on-screen. This is pressure, not a game-over."
      },
      { id: "letterbox_out", kind: "letterbox_out", durationMs: 700 }
    ]
  };
}

export function buildAct0KosResolveScene(result: Act0DepositResolution): CutsceneScript {
  const paidInFull = result.branch === "paid_in_full";
  return {
    id: ACT0_KOS_RESOLVE_ID,
    after: "world",
    timeoutMs: 28_000,
    steps: [
      { id: "letterbox_in", kind: "letterbox_in", durationMs: 600 },
      {
        id: "landlord_count",
        kind: "act_card",
        durationMs: 5_400,
        title: "THE LANDLORD COUNTS TWICE",
        subtitle: paidInFull
          ? `Rp ${result.paidByPlayer}. Exact. The key stays in your hand.`
          : `You put down Rp ${result.paidByPlayer}. The gap is Rp ${result.coveredByIbu}. The key starts to leave your hand.`
      },
      {
        id: paidInFull ? "paid_line" : "ibu_vouches",
        kind: "act_card",
        durationMs: 6_000,
        title: paidInFull ? "LANDLORD" : "IBU SARI",
        subtitle: paidInFull
          ? "‘Midnight tomorrow, we discuss the weekly rent. Tonight, sleep.’"
          : "‘Write the difference under my name. They finished every road you gave them.’\n\nThe landlord keeps the key on the hook."
      },
      { id: "letterbox_out", kind: "letterbox_out", durationMs: 700 }
    ]
  };
}

export function buildAct0CollapseScene(): CutsceneScript {
  return {
    id: ACT0_COLLAPSE_ID,
    after: "world",
    timeoutMs: 22_000,
    steps: [
      { id: "letterbox_in", kind: "letterbox_in", durationMs: 500 },
      { id: "bleak_room", kind: "camera_hold", durationMs: 3_400 },
      {
        id: "collapse",
        kind: "act_card",
        durationMs: 5_800,
        title: "ONE BULB · ONE MATTRESS",
        subtitle: "The app bought you one night indoors. You collapse before the rain finishes ticking from the roof."
      },
      { id: "letterbox_out", kind: "letterbox_out", durationMs: 800 }
    ]
  };
}
