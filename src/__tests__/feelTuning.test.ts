import { describe, expect, it } from "vitest";
import {
  AUDIO_FEEL_TUNING,
  CARGO_FEEL_TUNING,
  PAYOUT_FEEL_TUNING,
  RACE_FEEL_TUNING,
  RIDE_FEEL_TUNING
} from "../tuning/FeelTuning";

describe("consolidated feel tuning", () => {
  it("preserves the shipped audio and payout values", () => {
    expect(AUDIO_FEEL_TUNING).toMatchObject({
      payoutGain: 0.055,
      uiClickGain: 0.025,
      ambientMasterGain: 0.018,
      ambientShimmerGain: 0.006
    });
    expect(PAYOUT_FEEL_TUNING).toMatchObject({
      countUpDurationMs: 600,
      countUpStepCount: 8,
      totalDurationMs: 1180,
      standardScalePunch: 1.1,
      cleanScalePunch: 1.16,
      greatScalePunch: 1.24
    });
  });

  it("preserves the shipped ride, cargo, and Rio race values", () => {
    expect(RIDE_FEEL_TUNING).toMatchObject({
      accelerationSeconds: 0.62,
      coastToStopSeconds: 0.48,
      borrowedTopSpeedModifier: 1.08,
      nearMissCooldownMs: 900,
      nearMissMinimumSpeedRatio: 0.72
    });
    expect(CARGO_FEEL_TUNING).toMatchObject({
      fullBonusIntegrity: 70,
      trafficHitDamage: 18,
      hardCollisionDamage: 24,
      hardCollisionCooldownMs: 1200,
      hardCollisionSpeed: 280
    });
    expect(RACE_FEEL_TUNING).toEqual({
      checkpointRadius: 120,
      ghostTargetMs: 42000,
      ghostMaxStepPerSecond: 0.044,
      ghostLeadCap: 0.22,
      ghostTrailCap: 0.18,
      maxRaceMs: 70000
    });
  });
});
