import { describe, expect, it } from "vitest";
import { buildAct1IntroCutscene, buildAct2IntroCutscene } from "../systems/cutscene/ActCardScripts";
import { getCutsceneDuration, getCutsceneStepState, skipCutscene, type CutsceneScript } from "../systems/cutscene/CutsceneSequencer";

function sampleScript(): CutsceneScript {
  return {
    id: "sample",
    timeoutMs: 1200,
    steps: [
      { id: "a", kind: "letterbox_in", durationMs: 300 },
      { id: "b", kind: "act_card", durationMs: 500 },
      { id: "c", kind: "letterbox_out", durationMs: 300 }
    ]
  };
}

describe("cutscene sequencer", () => {
  it("walks timed steps in authored order", () => {
    const script = sampleScript();

    expect(getCutsceneStepState(script, 0)).toMatchObject({ stepIndex: 0, step: { id: "a" }, stepProgress: 0 });
    expect(getCutsceneStepState(script, 350)).toMatchObject({ stepIndex: 1, step: { id: "b" } });
    expect(getCutsceneStepState(script, 850)).toMatchObject({ stepIndex: 2, step: { id: "c" } });
    expect(getCutsceneStepState(script, getCutsceneDuration(script))).toMatchObject({ complete: true, step: null });
  });

  it("skips to the end state from any step", () => {
    const script = sampleScript();

    expect(getCutsceneStepState(script, 350).complete).toBe(false);
    expect(skipCutscene(script)).toMatchObject({
      complete: true,
      step: null,
      stepIndex: script.steps.length
    });
  });

  it("hard-times out even if authored duration is longer", () => {
    const script: CutsceneScript = {
      id: "slow",
      timeoutMs: 700,
      steps: [{ id: "long_card", kind: "act_card", durationMs: 3000 }]
    };

    expect(getCutsceneStepState(script, 699)).toMatchObject({ complete: false, timedOut: false });
    expect(getCutsceneStepState(script, 700)).toMatchObject({ complete: true, timedOut: true });
  });

  it("keeps the Act 1 card before the morning hand handoff", () => {
    const script = buildAct1IntroCutscene(450, 4);

    expect(script.after).toBe("morning_hand");
    expect(script.steps.map((step) => step.id)).toEqual(["letterbox_in", "act1_card", "letterbox_out"]);
    expect(script.steps.find((step) => step.id === "act1_card")).toMatchObject({
      title: "ACT 1 -- THE HUSTLE",
      subtitle: "Rent: Rp 450 by Day 4"
    });
  });

  it("authors the Act 2 card with a camera pan and return", () => {
    const script = buildAct2IntroCutscene({ x: 1808, y: 2200 });

    expect(script.steps.map((step) => step.kind)).toEqual([
      "letterbox_in",
      "camera_pan",
      "act_card",
      "camera_return",
      "letterbox_out"
    ]);
    expect(script.steps[1]).toMatchObject({ target: { x: 1808, y: 2200 } });
  });
});
