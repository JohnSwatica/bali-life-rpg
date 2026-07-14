import type { MemoryType } from "../../types";

export type RelationshipChoiceActionId =
  | "accept_act0_humbly"
  | "negotiate_act0_fee"
  | "accept_no_questions"
  | "decline_no_questions"
  | "complete_act1_leo_encounter"
  | "keep_act1_luxury_tip"
  | "return_act1_luxury_tip"
  | "start_rio_race"
  | "decline_rio_race";

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
  speakerName?: string;
  npcOpeningLine: string;
  prompt: string;
  trigger?: "quest_turnin" | "manual";
  skipOptionIndex?: 0 | 1;
  options: [RelationshipChoiceOption, RelationshipChoiceOption];
}

export const RELATIONSHIP_CHOICE_SCENES: Record<string, RelationshipChoiceScene> = {
  ibu_sari_act0_scooter_deal: {
    id: "ibu_sari_act0_scooter_deal",
    npcId: "ibu_sari",
    trigger: "manual",
    skipOptionIndex: 0,
    npcOpeningLine:
      'Ibu Sari rests one hand on the catering box. Behind her, the old scooter coughs smoke into the blue dawn. "Fifteen minutes. Milk & Madu. Then we talk about what you owe me."',
    prompt: "The road, the room, and the clock all start here. How do you take the deal?",
    options: [
      {
        id: "accept_humbly",
        label: "Take the keys. ‘I won’t forget this.’",
        resultLine:
          'Her shoulders loosen. "Good. Gratitude remembers the road home. Now go — the box does not care about speeches."',
        actionId: "accept_act0_humbly",
        affinityBonus: 3,
        axis: { kind: "relational", delta: 3 },
        memory: { type: "helped", detail: "Accepted Ibu Sari’s scooter deal with gratitude" }
      },
      {
        id: "negotiate_fee",
        label: "Ask for a delivery fee too.",
        resultLine:
          'One eyebrow rises. "Stranded five minutes and already negotiating." She names a small fee. "Fine. Earn it — and do not make me regret the keys."',
        actionId: "negotiate_act0_fee",
        affinityBonus: -1,
        axis: { kind: "relational", delta: -2 },
        memory: { type: "visited", detail: "Negotiated a fee before accepting Ibu Sari’s scooter deal" }
      }
    ]
  },
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
      'Leo leans on the counter next to the package like it\'s nothing. "No name, no manifest, Rp 180 cash at the door. I ran three of those when NusaDrop stopped surfacing decent work." He spins his keys once and catches them. "The leaderboard only cares that you arrived."',
    prompt: "The package sits between you. Leo is watching you, not it. Do you --",
    options: [
      {
        id: "take_package",
        label: "Take it. Money is money.",
        resultLine:
          'Leo grins and slides it across without touching the tape. "Fast learner. Address is on the side. Don\'t open it, don\'t stop, don\'t wave at anybody." He is already back on his phone. "Clock\'s running."',
        actionId: "accept_no_questions",
        affinityBonus: 2,
        axis: { kind: "relational", delta: 2 },
        memory: { type: "visited", detail: "Took the no-questions package while Leo watched" }
      },
      {
        id: "push_it_back",
        label: "Push it back across the counter.",
        resultLine:
          'Leo shrugs and pockets his keys. "The slow lane is that way." But he holds the door open for you on the way out, which he has never done for anyone.',
        actionId: "decline_no_questions",
        affinityBonus: 1,
        axis: { kind: "relational", delta: 1 },
        memory: { type: "visited", detail: "Turned down the no-questions package to Leo's face" }
      }
    ]
  },
  rio_act1_rate_cut_encounter: {
    id: "rio_act1_rate_cut_encounter",
    npcId: "rio",
    trigger: "manual",
    npcOpeningLine:
      'Leo glances from the NusaDrop update to your borrowed scooter. "Fifteen percent off every base fare. Efficient, if you own the platform." He taps your scratched side panel. "Less efficient if this is your business plan."',
    prompt: 'His grin is sharp, but he shifts his own scooter so you have room at the pickup rail. "Still taking the next run?"',
    options: [
      {
        id: "take_the_run",
        label: "Take the run. ‘You watching?’",
        resultLine: '"I watch the leaderboard. Try appearing on it first."',
        actionId: "complete_act1_leo_encounter"
      },
      {
        id: "call_out_the_cut",
        label: "‘They cut your pay too.’",
        resultLine: 'His smile thins. "Correct. I simply intend to be faster than the cut."',
        actionId: "complete_act1_leo_encounter"
      }
    ]
  },
  rio_streak_duel_challenge: {
    id: "rio_streak_duel_challenge",
    npcId: "rio",
    trigger: "manual",
    npcOpeningLine:
      'Leo is already sitting on his scooter, helmet strap loose, grin worse. "Three runs, rating above baseline. Fine. One lap: rental, station, Bungalow, club gate, beach, back here. NusaDrop leaderboard settles it."',
    prompt: '"Bail and I take the leaderboard. Finish behind me and I still win. Beat me clean and I shut up for, I do not know, ten minutes."',
    options: [
      {
        id: "race_him",
        label: "Race him. Rp 25 on the line.",
        resultLine: "Leo kicks his stand up. \"Try not to make this embarrassing for both of us.\"",
        actionId: "start_rio_race"
      },
      {
        id: "not_today",
        label: "Not today.",
        resultLine: "Leo laughs through his nose. \"Good. I was worried you were about to become interesting.\"",
        actionId: "decline_rio_race"
      }
    ]
  },
  act1_luxury_tip_dilemma: {
    id: "act1_luxury_tip_dilemma",
    npcId: "villa_guest",
    speakerName: "Villa Guest",
    trigger: "manual",
    skipOptionIndex: 1,
    npcOpeningLine:
      'The guest is already looking past you when their phone chimes. "There. Fifty. Sorry — call starting." Your wallet receipt opens: TIP TRANSFER · Rp 500.',
    prompt: "They think they sent Rp 50. The gate is closing. What do you do?",
    options: [
      {
        id: "keep_tip",
        label: "Keep the Rp 500.",
        resultLine:
          'Rp 500 posts to your wallet. You lock the phone. "The app rounds in silence. So can you."',
        actionId: "keep_act1_luxury_tip"
      },
      {
        id: "return_tip",
        label: "Return Rp 450. Keep the intended Rp 50.",
        resultLine:
          'You stop the gate and show them the receipt. The guest actually looks at you. "Oh. Thank you. Next time, ask for me at the gate." Rp 50 posts to your wallet.',
        actionId: "return_act1_luxury_tip"
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

export function getRelationshipChoiceSkipOption(
  scene: RelationshipChoiceScene
): RelationshipChoiceOption | undefined {
  return scene.skipOptionIndex == null ? undefined : scene.options[scene.skipOptionIndex];
}
