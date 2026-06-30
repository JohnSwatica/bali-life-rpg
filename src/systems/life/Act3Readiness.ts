import { areAct2GoalsComplete } from "./Act2Goals";
import { getRelationship } from "../relationships/RelationshipMemory";
import type { WorldState } from "../../types";

export interface Act3ReadinessGoalState {
  id: "social_rhythm" | "mentor_trust" | "crew_candidate" | "seed_capital" | "business_lead";
  title: string;
  description: string;
  progress: string;
  complete: boolean;
}

export interface Act3ReadinessNextStep {
  title: string;
  detail: string;
  urgency: "normal" | "ceo";
}

const SEED_CAPITAL_TARGET = 1200;
const DELIVERY_EARNINGS_TARGET = 1000;
const BUSINESS_LEAD_TEMPLATE_IDS = new Set([
  "focus_table_client_referral",
  "brunch_builders_paid_intro",
  "sari_warung_seed_errand"
]);

export function getAct3ReadinessGoalStates(world: WorldState): Act3ReadinessGoalState[] {
  if (world.life.actProgress.currentAct < 2) {
    return [];
  }

  const player = world.players[world.localPlayerId];
  const completedBeatCount = getCompletedRelationshipBeatCount(world);
  const ibuSariAffinity = getRelationship(world, "npc", "ibu_sari")?.affinity ?? 0;
  const hasBusinessLead = world.opportunities.completedTemplateIds.some((templateId) => BUSINESS_LEAD_TEMPLATE_IDS.has(templateId));

  return [
    {
      id: "social_rhythm",
      title: "Crew rhythm",
      description: "Finish the Act 2 crew, rhythm, and bond foundation.",
      progress: areAct2GoalsComplete(world) ? "Act 2 social base complete" : "Act 2 social goals still open",
      complete: areAct2GoalsComplete(world)
    },
    {
      id: "mentor_trust",
      title: "Ibu Sari mentor trust",
      description: "Earn enough local trust that Ibu Sari can plausibly mentor a future warung/cafe.",
      progress: `Ibu Sari affinity ${Math.min(8, ibuSariAffinity)}/8`,
      complete: ibuSariAffinity >= 8 || world.life.relationshipArcProgress.ibu_sari_neighborhood_net?.completedBeatIds.length > 0
    },
    {
      id: "crew_candidate",
      title: "First crew candidate",
      description: "Have at least one relationship beat complete so a friend can become future staff/support.",
      progress: `${Math.min(1, completedBeatCount)}/1 relationship beat`,
      complete: completedBeatCount > 0
    },
    {
      id: "seed_capital",
      title: "Seed capital signal",
      description: "Show that the hustle can fund something bigger than rent.",
      progress: `Rp ${Math.max(player.money, world.life.hustle.deliveryEarnings)}/${SEED_CAPITAL_TARGET} cash or Rp ${Math.min(DELIVERY_EARNINGS_TARGET, world.life.hustle.deliveryEarnings)}/${DELIVERY_EARNINGS_TARGET} delivery earnings`,
      complete: player.money >= SEED_CAPITAL_TARGET || world.life.hustle.deliveryEarnings >= DELIVERY_EARNINGS_TARGET
    },
    {
      id: "business_lead",
      title: "Business lead",
      description: "Complete a trusted social or Ibu Sari opportunity that points toward operating your own spot.",
      progress: hasBusinessLead ? "Trusted business lead completed" : "Complete a focus, brunch, or warung-seed opportunity",
      complete: hasBusinessLead
    }
  ];
}

export function getAct3ReadinessNextStep(world: WorldState): Act3ReadinessNextStep | null {
  const goals = getAct3ReadinessGoalStates(world);
  if (goals.length === 0) {
    return null;
  }

  const nextGoal = goals.find((goal) => !goal.complete);
  if (!nextGoal) {
    return {
      title: "CEO unlock needed",
      detail: "Act 3 hooks are ready. Opening the business-management sim is a product-scope decision, not an automatic code path.",
      urgency: "ceo"
    };
  }

  return {
    title: nextGoal.title,
    detail: nextGoal.description,
    urgency: "normal"
  };
}

export function isAct3Ready(world: WorldState): boolean {
  const goals = getAct3ReadinessGoalStates(world);
  return goals.length > 0 && goals.every((goal) => goal.complete);
}

function getCompletedRelationshipBeatCount(world: WorldState): number {
  return Object.values(world.life.relationshipArcProgress).reduce((total, progress) => total + progress.completedBeatIds.length, 0);
}
