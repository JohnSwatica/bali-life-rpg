import type { MemoryType } from "../../types";

export interface RelationshipChoiceOption {
  id: string;
  label: string;
  resultLine: string;
  energyDelta?: number;
  focusDelta?: number;
  affinityBonus?: number;
  axis?: { kind: "rooted" | "relational"; delta: number };
  memory?: { type: MemoryType; detail: string };
}

export interface RelationshipChoiceScene {
  id: string;
  npcId: string;
  npcOpeningLine: string;
  prompt: string;
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
  }
};

export function getRelationshipChoiceSceneForNpc(npcId: string): RelationshipChoiceScene | undefined {
  return Object.values(RELATIONSHIP_CHOICE_SCENES).find((scene) => scene.npcId === npcId);
}
