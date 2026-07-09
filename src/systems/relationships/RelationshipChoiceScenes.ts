import type { MemoryType } from "../../types";

export type RelationshipChoiceActionId = "accept_no_questions" | "decline_no_questions" | "start_rio_race" | "decline_rio_race";

export interface RelationshipChoiceOption {
  id: string;
  label: string;
  resultLine: string;
  energyDelta?: number;
  focusDelta?: number;
  affinityBonus?: number;
  axis?: { kind: "rooted" | "relational"; delta: number };
  memory?: { type: MemoryType; detail: string };
  actionId?: RelationshipChoiceActionId;
}

export interface RelationshipChoiceScene {
  id: string;
  npcId: string;
  npcOpeningLine: string;
  prompt: string;
  trigger?: "quest_turnin" | "manual";
  options: [RelationshipChoiceOption, RelationshipChoiceOption];
}

export const RELATIONSHIP_CHOICE_SCENES: Record<string, RelationshipChoiceScene> = {
  kadek_bakery_turnin: {
    id: "kadek_bakery_turnin",
    npcId: "kadek",
    npcOpeningLine:
      'Kadek checks the box, checks the seal, sets it on the counter without looking up. "Good. Didn\'t get crushed." He reaches for his ledger like the conversation is already over.',
    prompt: "He's already moving on to the next thing. Do you --",
    options: [
      {
        id: "ask_baking",
        label: "Ask what he's actually baking this early",
        resultLine:
          'He pauses -- actually pauses -- like nobody\'s asked him that this week. "Sourdough starter. Four years old. Old man down the lane gave it to me." A short laugh. "You\'re the first driver who\'s asked in a while."',
        energyDelta: -3,
        affinityBonus: 3,
        axis: { kind: "relational", delta: 4 },
        memory: { type: "helped", detail: "Asked Kadek about his sourdough starter instead of rushing off" }
      },
      {
        id: "take_payout",
        label: "Take the payout and get back on the road",
        resultLine:
          'He nods once, already turning back to his ledger. "Efficient. I respect that." The counter goes quiet again.',
        energyDelta: 2,
        focusDelta: 1,
        axis: { kind: "relational", delta: -3 },
        memory: { type: "visited", detail: "Kept it strictly business with Kadek" }
      }
    ]
  },
  rio_no_questions_package: {
    id: "rio_no_questions_package",
    npcId: "rio",
    trigger: "manual",
    npcOpeningLine:
      'Rio leans on the counter next to the package like it\'s nothing. "No name, no manifest, Rp 180 cash at the door. I ran three of those my first month." He spins his keys once and catches them. "Leaderboard doesn\'t ask where the points come from."',
    prompt: "The package sits between you. Rio is watching you, not it. Do you --",
    options: [
      {
        id: "take_package",
        label: "Take it. Money is money.",
        resultLine:
          'Rio grins and slides it across without touching the tape. "Fast learner. Address is on the side. Don\'t open it, don\'t stop, don\'t wave at anybody." He\'s already back on his phone. "Clock\'s running, new guy."',
        actionId: "accept_no_questions",
        affinityBonus: 2,
        axis: { kind: "relational", delta: 2 },
        memory: { type: "visited", detail: "Took the no-questions package while Rio watched" }
      },
      {
        id: "push_it_back",
        label: "Push it back across the counter.",
        resultLine:
          'Rio shrugs and pockets his keys. "Slow lane\'s that way." But he holds the door open for you on the way out, which he has never done for anyone.',
        actionId: "decline_no_questions",
        affinityBonus: 1,
        axis: { kind: "relational", delta: 1 },
        memory: { type: "visited", detail: "Turned down the no-questions package to Rio's face" }
      }
    ]
  },
  rio_streak_duel_challenge: {
    id: "rio_streak_duel_challenge",
    npcId: "rio",
    trigger: "manual",
    npcOpeningLine:
      'Rio is already sitting on his scooter, helmet strap loose, grin worse. "Three runs, rating above gutter level. Fine. One lap: rental, station, Bungalow, club gate, beach, back here."',
    prompt: '"Bail and I win. Finish behind me and I still win. Beat me clean and I shut up for, I don\'t know, ten minutes."',
    options: [
      {
        id: "race_him",
        label: "Race him. Rp 25 on the line.",
        resultLine: "Rio kicks his stand up. \"Try not to make this embarrassing for both of us.\"",
        actionId: "start_rio_race"
      },
      {
        id: "not_today",
        label: "Not today.",
        resultLine: "Rio laughs through his nose. \"Good. I was worried you were about to become interesting.\"",
        actionId: "decline_rio_race"
      }
    ]
  }
};

export function getRelationshipChoiceSceneForNpc(npcId: string): RelationshipChoiceScene | undefined {
  return Object.values(RELATIONSHIP_CHOICE_SCENES).find(
    (scene) => scene.npcId === npcId && (scene.trigger ?? "quest_turnin") === "quest_turnin"
  );
}

export function getRelationshipChoiceScene(sceneId: string): RelationshipChoiceScene | undefined {
  return RELATIONSHIP_CHOICE_SCENES[sceneId];
}
