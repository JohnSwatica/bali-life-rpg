import type {
  ActiveMinigameChoice,
  ActiveMinigameState,
  ActivityMinigameKind,
  Meter,
  OpportunityType
} from "../../types";

export interface ActivityMinigameDefinition {
  kind: ActivityMinigameKind;
  title: string;
  prompt: string;
  actionLabel: string;
  targetStart?: number;
  targetEnd?: number;
  choices?: ActiveMinigameChoice[];
}

const DEFAULT_PERFORMANCE_SCORE = 0.68;
const MIN_REWARD_MULTIPLIER = 0.72;
const MAX_REWARD_MULTIPLIER = 1.28;

const ACTIVITY_MINIGAMES: Record<string, ActivityMinigameDefinition | undefined> = {
  remote_work_session: {
    kind: "timing",
    title: "Focus Sprint",
    prompt: "Tap when the marker passes through the green window to ship clean work.",
    actionLabel: "Ship",
    targetStart: 0.42,
    targetEnd: 0.58
  },
  cafe_deep_work: {
    kind: "timing",
    title: "Cafe Focus",
    prompt: "Tap in the green window when the cafe noise drops and the work clicks.",
    actionLabel: "Ship",
    targetStart: 0.44,
    targetEnd: 0.6
  },
  cafe_brunch_table: {
    kind: "choice",
    title: "Order Like You Mean It",
    prompt: "Pick the move that turns a cafe stop into an actual reset.",
    actionLabel: "Choose",
    choices: [
      { id: "plate", label: "Order food and water", score: 1, feedback: "That was the responsible version of brunch." },
      { id: "pastry", label: "Pastry and more coffee", score: 0.58, feedback: "Better than nothing, not quite a reset." },
      { id: "scroll", label: "Scroll through the meal", score: 0.25, feedback: "Fed, but barely present." }
    ]
  },
  surf_beach_time: {
    kind: "balance",
    title: "Find the Line",
    prompt: "Tap while the balance marker is centered to keep your board steady.",
    actionLabel: "Balance",
    targetStart: 0.38,
    targetEnd: 0.62
  },
  beach_surf_session: {
    kind: "balance",
    title: "Find the Line",
    prompt: "Tap while the balance marker is centered to stay with the wave.",
    actionLabel: "Balance",
    targetStart: 0.38,
    targetEnd: 0.62
  },
  beach_cleanup_chat: {
    kind: "choice",
    title: "Help Without Performing",
    prompt: "Choose the move that makes helping feel natural.",
    actionLabel: "Choose",
    choices: [
      { id: "quiet_help", label: "Start picking up first", score: 1, feedback: "Useful before impressive. People notice." },
      { id: "organize", label: "Give everyone assignments", score: 0.52, feedback: "Helpful idea, strong entrance." },
      { id: "photo", label: "Take a proof photo", score: 0.22, feedback: "The moment became about you." }
    ]
  },
  beach_club_sunset_table: {
    kind: "choice",
    title: "Enter the Table",
    prompt: "Choose how to join without making the moment feel transactional.",
    actionLabel: "Choose",
    choices: [
      { id: "ask", label: "Ask what brought them here", score: 1, feedback: "Curiosity opens the table." },
      { id: "round", label: "Offer a small round", score: 0.76, feedback: "Generous, slightly expensive, still welcome." },
      { id: "flex", label: "Lead with a humblebrag", score: 0.2, feedback: "The table smiled politely and moved on." }
    ]
  },
  beach_club_big_night: {
    kind: "choice",
    title: "Keep the Night Worth It",
    prompt: "Pick the move that earns the social spike without losing yourself completely.",
    actionLabel: "Choose",
    choices: [
      { id: "introduce", label: "Introduce two people", score: 1, feedback: "Connector energy. That one sticks." },
      { id: "dance", label: "Commit to the dance floor", score: 0.78, feedback: "Memorable, a little costly." },
      { id: "tab", label: "Open an ambitious tab", score: 0.35, feedback: "Fun for the table, brutal for the wallet." }
    ]
  },
  warung_local_chat: {
    kind: "choice",
    title: "Warung Table Manners",
    prompt: "Pick the move that feels respectful and easy.",
    actionLabel: "Choose",
    choices: [
      { id: "ask_food", label: "Ask what they recommend", score: 1, feedback: "Simple, respectful, and useful." },
      { id: "compare", label: "Compare it to home", score: 0.5, feedback: "Not terrible, but you centered yourself." },
      { id: "rush", label: "Eat while checking maps", score: 0.2, feedback: "You missed the human part." }
    ]
  },
  coworking_focus_sprint: {
    kind: "timing",
    title: "Deep Work Block",
    prompt: "Tap in the focus window to turn the room's pressure into real output.",
    actionLabel: "Ship",
    targetStart: 0.45,
    targetEnd: 0.58
  },
  coworking_accountability_chat: {
    kind: "choice",
    title: "Accountability Read",
    prompt: "Choose the move that makes the work talk useful instead of performative.",
    actionLabel: "Choose",
    choices: [
      { id: "specific", label: "Share one specific blocker", score: 1, feedback: "Concrete enough to be useful." },
      { id: "network", label: "Ask for introductions first", score: 0.48, feedback: "A little early for that ask." },
      { id: "vague", label: "Say you are building stuff", score: 0.25, feedback: "True, but hard to help." }
    ]
  },
  home_plan_tomorrow: {
    kind: "choice",
    title: "Tiny Room Plan",
    prompt: "Pick the plan that makes tomorrow easier without overplanning it.",
    actionLabel: "Choose",
    choices: [
      { id: "three_tasks", label: "Pick three concrete stops", score: 1, feedback: "Small enough to follow, clear enough to matter." },
      { id: "perfect_day", label: "Design the perfect day", score: 0.45, feedback: "Beautiful plan. Possibly fictional." },
      { id: "avoid", label: "Rearrange the room again", score: 0.2, feedback: "Cozy, but the work is still waiting." }
    ]
  },
  relax_hangout: {
    kind: "choice",
    title: "Read the Table",
    prompt: "Pick the response that keeps the hangout easy and warm.",
    actionLabel: "Choose",
    choices: [
      { id: "listen", label: "Ask a follow-up", score: 1, feedback: "That landed. People remember listeners." },
      { id: "pitch", label: "Pitch your project", score: 0.45, feedback: "A little intense for a chill table." },
      { id: "drift", label: "Check your phone", score: 0.2, feedback: "You were there, but barely present." }
    ]
  },
  night_out: {
    kind: "choice",
    title: "Keep the Vibe",
    prompt: "Choose how you enter the conversation without making it weird.",
    actionLabel: "Choose",
    choices: [
      { id: "round", label: "Buy a small round", score: 0.78, feedback: "Generous, memorable, a bit expensive." },
      { id: "story", label: "Invite a story", score: 1, feedback: "Perfect. The group opens up." },
      { id: "flex", label: "Name-drop loudly", score: 0.18, feedback: "That cooled the room fast." }
    ]
  },
  ride_checkpoint_traffic_gap: {
    kind: "timing",
    title: "Threading the Junction",
    prompt: "A truck is easing out of a side lane. Tap when the gap opens to slide through clean.",
    actionLabel: "Go",
    targetStart: 0.46,
    targetEnd: 0.6
  },
  ride_checkpoint_corner_lean: {
    kind: "timing",
    title: "The Tight Corner",
    prompt: "The lane narrows into a blind corner. Tap as the turn lines up to lean it through smooth.",
    actionLabel: "Lean",
    targetStart: 0.4,
    targetEnd: 0.56
  }
};

const OPPORTUNITY_MINIGAMES: Partial<Record<OpportunityType, ActivityMinigameDefinition>> = {
  gig: {
    kind: "timing",
    title: "Rush Window",
    prompt: "Tap in the green window to handle the rush without spilling the rhythm.",
    actionLabel: "Serve",
    targetStart: 0.4,
    targetEnd: 0.6
  },
  social: {
    kind: "choice",
    title: "Social Read",
    prompt: "Pick the move that makes the invite feel natural.",
    actionLabel: "Choose",
    choices: [
      { id: "curious", label: "Ask what they are into", score: 1, feedback: "Easy connection. Good instincts." },
      { id: "perform", label: "Tell your best story", score: 0.62, feedback: "Fun, but you took up space." },
      { id: "ghost", label: "Say maybe and drift", score: 0.16, feedback: "The moment thinned out." }
    ]
  },
  help_out: {
    kind: "timing",
    title: "Quick Help",
    prompt: "Tap in the window to help smoothly before the situation jams up.",
    actionLabel: "Help",
    targetStart: 0.43,
    targetEnd: 0.6
  }
};

export function getActivityMinigameDefinition(activityId: string): ActivityMinigameDefinition | null {
  return ACTIVITY_MINIGAMES[activityId] ?? null;
}

export function getOpportunityMinigameDefinition(type: OpportunityType): ActivityMinigameDefinition | null {
  return OPPORTUNITY_MINIGAMES[type] ?? null;
}

export function createActiveMinigame(definition: ActivityMinigameDefinition | null): ActiveMinigameState | undefined {
  if (!definition) {
    return undefined;
  }
  return {
    kind: definition.kind,
    title: definition.title,
    prompt: definition.prompt,
    actionLabel: definition.actionLabel,
    attempts: 0,
    bestScore: 0,
    markerPhase: 0,
    targetStart: definition.targetStart ?? 0.42,
    targetEnd: definition.targetEnd ?? 0.58,
    choices: definition.choices
  };
}

export function scoreTimingAttempt(markerPhase: number, targetStart: number, targetEnd: number): number {
  const phase = clamp01(markerPhase);
  const start = clamp01(Math.min(targetStart, targetEnd));
  const end = clamp01(Math.max(targetStart, targetEnd));
  if (phase >= start && phase <= end) {
    return 1;
  }
  const targetCenter = (start + end) / 2;
  const halfWindow = Math.max(0.01, (end - start) / 2);
  const distance = Math.abs(phase - targetCenter);
  return clamp01(1 - (distance - halfWindow) / Math.max(0.01, 0.42 - halfWindow));
}

export function scoreChoice(choices: ActiveMinigameChoice[] | undefined, choiceId: string): ActiveMinigameChoice | null {
  return choices?.find((choice) => choice.id === choiceId) ?? null;
}

export function resolvePerformanceScore(minigame: ActiveMinigameState | undefined): number | undefined {
  if (!minigame) {
    return undefined;
  }
  if (minigame.attempts <= 0 && !minigame.selectedChoiceId) {
    return DEFAULT_PERFORMANCE_SCORE;
  }
  return clamp01(minigame.bestScore);
}

export function rewardMultiplier(performanceScore: number | undefined): number {
  if (performanceScore == null) {
    return 1;
  }
  const score = clamp01(performanceScore);
  return MIN_REWARD_MULTIPLIER + (MAX_REWARD_MULTIPLIER - MIN_REWARD_MULTIPLIER) * score;
}

export function scaleMoneyDeltaForPerformance(delta: number, performanceScore: number | undefined): number {
  if (delta <= 0 || performanceScore == null) {
    return delta;
  }
  return Math.round(delta * rewardMultiplier(performanceScore));
}

export function scaleMeterDeltasForPerformance(
  deltas: Partial<Record<Meter, number>>,
  performanceScore: number | undefined
): Partial<Record<Meter, number>> {
  if (performanceScore == null) {
    return { ...deltas };
  }
  const multiplier = rewardMultiplier(performanceScore);
  const scaled: Partial<Record<Meter, number>> = {};
  for (const [meter, delta] of Object.entries(deltas) as Array<[Meter, number]>) {
    scaled[meter] = delta > 0 ? Math.round(delta * multiplier) : delta;
  }
  return scaled;
}

export function formatPerformanceSummary(performanceScore: number | undefined): string {
  if (performanceScore == null) {
    return "";
  }
  return ` | performance ${Math.round(clamp01(performanceScore) * 100)}%`;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}
