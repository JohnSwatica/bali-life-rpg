export const AUDIO_FEEL_TUNING = {
  /** Raises or lowers the first note of the pickup confirmation. */
  pickupPrimaryGain: 0.05,
  /** Raises or lowers the bright accent at the end of a pickup. */
  pickupAccentGain: 0.04,
  /** Raises or lowers every note in the payout arpeggio. */
  payoutGain: 0.055,
  /** Raises or lowers the short menu-click tone. */
  uiClickGain: 0.025,
  /** Raises or lowers the first note of a toast notification. */
  toastPrimaryGain: 0.027,
  /** Raises or lowers the softer second toast note. */
  toastSecondaryGain: 0.018,
  /** Raises or lowers every note in the sleep cadence. */
  sleepGain: 0.035,
  /** Raises or lowers the first near-miss warning note. */
  nearMissPrimaryGain: 0.03,
  /** Raises or lowers the second near-miss warning note. */
  nearMissSecondaryGain: 0.018,
  /** Raises or lowers the continuous ambient bed. */
  ambientMasterGain: 0.018,
  /** Raises or lowers the high shimmer above the ambient bed. */
  ambientShimmerGain: 0.006,
  /** Raises or lowers the procedural rain-noise layer. */
  rainBedGain: 0.78,
  /** Raises or lowers the filtered cafe chatter texture. */
  cafeChatterGain: 0.28,
  /** Raises or lowers the faint cafe espresso-machine whine. */
  espressoTextureGain: 0.012,
  /** Raises or lowers the first night cricket tone. */
  cricketGain: 0.055,
  /** Raises or lowers the quieter answering cricket tone. */
  cricketEchoGain: 0.025,
  /** Raises or lowers the bass body of a thunder sting. */
  thunderLowGain: 0.04,
  /** Raises or lowers the short upper crack of a thunder sting. */
  thunderCrackGain: 0.018
} as const;

export const PAYOUT_FEEL_TUNING = {
  /** Controls how long the rupiah count-up takes to reach the final payout. */
  countUpDurationMs: 600,
  /** Controls how many discrete reference steps describe the count-up curve. */
  countUpStepCount: 8,
  /** Controls the full lifetime of the payout celebration. */
  totalDurationMs: 1180,
  /** Controls the standard-run amount text scale punch. */
  standardScalePunch: 1.1,
  /** Controls the clean-run amount text scale punch. */
  cleanScalePunch: 1.16,
  /** Controls the great-run amount text scale punch. */
  greatScalePunch: 1.24,
  /** Controls how quickly the amount text punches outward and back. */
  amountPunchDurationMs: 140,
  /** Controls how quickly a changed rating punches outward and back. */
  ratingPunchDurationMs: 150,
  /** Controls when the rating punch begins after the count-up starts. */
  ratingPunchDelayMs: 260,
  /** Controls the pulse speed of the rent-covered message. */
  rentPulseDurationMs: 180,
  /** Controls how many extra rent-covered message pulses play. */
  rentPulseRepeatCount: 2,
  /** Controls the automatic fade at the end of the celebration. */
  fadeOutDurationMs: 180,
  /** Controls the shortened fade when the player dismisses the celebration. */
  dismissFadeDurationMs: 120
} as const;

export const RIDE_FEEL_TUNING = {
  /** Controls the authored top-speed input before tier and condition modifiers. */
  baseBikeSpeed: 345,
  /** Controls how quickly the scooter accelerates toward its desired velocity. */
  accelerationSeconds: 0.62,
  /** Controls how long an unpowered scooter takes to coast to a stop. */
  coastToStopSeconds: 0.48,
  /** Preserves the borrowed scooter's traversal time after acceleration was introduced. */
  borrowedTopSpeedModifier: 1.08,
  /** Controls the daily rental's top-speed advantage. */
  rentalTopSpeedModifier: 1.12,
  /** Controls the proper bike's top-speed advantage. */
  properBikeTopSpeedModifier: 1.18,
  /** Starts scaling top-speed condition penalties below this condition. */
  topSpeedConditionThreshold: 70,
  /** Controls the borrowed scooter's maximum low-condition speed penalty. */
  borrowedLowConditionSpeedPenalty: 0.09,
  /** Controls upgraded scooters' maximum low-condition speed penalty. */
  upgradedLowConditionSpeedPenalty: 0.05,
  /** Prevents drift from appearing below this fraction of top speed. */
  lowSpeedDriftCutoff: 0.22,
  /** Amplifies visible drift on rain-slick surfaces. */
  slickDriftMultiplier: 1.25,
  /** Controls dry-surface speed loss during a hard turn. */
  drySteeringLoss: 0.32,
  /** Controls slick-surface speed loss during a hard turn. */
  slickSteeringLoss: 0.48,
  /** Controls the maximum lean contributed by horizontal velocity. */
  velocityLeanDegrees: 8.5,
  /** Controls the extra lean contributed by dry drift. */
  dryDriftLeanDegrees: 2.6,
  /** Controls the extra lean contributed by slick drift. */
  slickDriftLeanDegrees: 4.2,
  /** Caps the final scooter lean in either direction. */
  maxLeanDegrees: 12,
  /** Caps the reported speed ratio used by downstream presentation. */
  maximumSpeedRatio: 1.1,
  /** Keeps the riding pose active while coasting above this unscaled speed. */
  minimumAnimatedRideSpeed: 8,
  /** Starts camera look-ahead above this fraction of top speed. */
  cameraLeadMinimumSpeedRatio: 0.18,
  /** Caps horizontal camera look-ahead in unscaled world units. */
  cameraLeadMaxX: 42,
  /** Caps vertical camera look-ahead in unscaled world units. */
  cameraLeadMaxY: 34,
  /** Controls how quickly the camera settles toward its look-ahead target. */
  cameraLeadLerp: 0.12,
  /** Controls the proper bike's grip advantage. */
  properBikeGrip: 1.06,
  /** Controls the daily rental's neutral grip baseline. */
  rentalGrip: 1,
  /** Controls the borrowed scooter's loose grip baseline. */
  borrowedGrip: 0.93,
  /** Controls the maximum grip loss caused by poor condition. */
  conditionGripPenalty: 0.16,
  /** Starts scaling grip condition penalties below this condition. */
  gripConditionThreshold: 55,
  /** Controls the extra grip loss on a slick surface. */
  slickGripPenalty: 0.2,
  /** Controls the lowest grip the model can produce. */
  minimumGrip: 0.62,
  /** Controls the highest grip the model can produce. */
  maximumGrip: 1.08,
  /** Controls how close traffic or pedestrians must be for a near miss. */
  nearMissRadius: 66,
  /** Prevents direct impacts from being counted as near misses. */
  nearMissInnerRadius: 38,
  /** Limits how frequently dense traffic can emit near-miss feedback. */
  nearMissCooldownMs: 900,
  /** Requires this fraction of top speed before near-miss feedback can fire. */
  nearMissMinimumSpeedRatio: 0.72
} as const;

/** Authored delivery-ride pressure. Edit here to tune a street without touching base bike handling. */
export const DELIVERY_RIDE_FEEL_TUNING = {
  streets: {
    jl_pantai_berawa: {
      tutorialDensity: 0.55,
      act1Density: 1,
      baseHazardCount: 10
    }
  },
  contactRadius: 30,
  nearMissRadius: 58,
  awarenessRadius: 112,
  contactCooldownMs: 900,
  stumbleSpeedMultiplier: 0.38,
  nightVisibilityMultiplier: 0.78,
  score: {
    failForwardFloor: 0.28,
    avoidanceWeight: 0.42,
    nearMissWeight: 0.16,
    timeWeight: 0.14,
    contactPenalty: 0.16,
    targetSecondsPerHazard: 3.5
  }
} as const;

/** Central tuning for the movement-based Warung Rush service round. */
export const WARUNG_RUSH_FEEL_TUNING = {
  roundDurationMs: 75000,
  patienceMs: 18000,
  orderIntervalMs: 6200,
  maxSimultaneousOrders: 4,
  playsPerDifficultyStep: 2
} as const;

export const CARGO_FEEL_TUNING = {
  /** Keeps the full condition bonus at or above this cargo integrity. */
  fullBonusIntegrity: 70,
  /** Controls integrity lost when another scooter clips the player. */
  trafficHitDamage: 18,
  /** Controls integrity lost on a fast hard collision. */
  hardCollisionDamage: 24,
  /** Limits how frequently one collision sequence can damage cargo. */
  hardCollisionCooldownMs: 1200,
  /** Requires this unscaled speed before a wall impact damages cargo. */
  hardCollisionSpeed: 280
} as const;

export const RACE_FEEL_TUNING = {
  /** Controls how close the player must pass to claim a race checkpoint. */
  checkpointRadius: 120,
  /** Sets Leo's nominal lap-completion time. */
  ghostTargetMs: 42000,
  /** Caps Leo's progress gain per second so catch-up never teleports. */
  ghostMaxStepPerSecond: 0.044,
  /** Caps how far Leo may run ahead of the player's checkpoint progress. */
  ghostLeadCap: 0.22,
  /** Caps how far Leo may fall behind the player's checkpoint progress. */
  ghostTrailCap: 0.18,
  /** Ends the setpiece as a loss after this much elapsed race time. */
  maxRaceMs: 70000
} as const;
