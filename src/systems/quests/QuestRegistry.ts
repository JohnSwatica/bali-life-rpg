import { questDefinitions } from "../../data/quests";
import { getQuantity, removeItem } from "../Inventory";
import { completeQuest, isQuestActive, isQuestComplete, startQuest } from "../QuestSystem";
import type { GameIntent, InventoryEntry, PlayerEntityState, QuestDefinition, ReputationTag } from "../../types";

type QuestObjective =
  | { type: "collect"; itemId: string; quantity: number }
  | { type: "deliver"; itemId: string; quantity: number }
  | { type: "visit"; venueId: string }
  | { type: "buy"; itemId: string; quantity: number }
  | { type: "talk"; npcId: string };

interface QuestScript {
  questId: string;
  giverNpcId: string;
  objective: QuestObjective;
  startLine: string;
  progressLine: string;
  completedLine: string;
  turnInLine: (quest: QuestDefinition) => string;
  reputationTag: ReputationTag;
  reputationDelta: number;
}

export interface QuestInteractionResult {
  handled: boolean;
  dialogue: string;
  shouldSave: boolean;
  intents: GameIntent[];
}

const questScripts: QuestScript[] = [
  {
    questId: "canggu_station_restock",
    giverNpcId: "ibu_sari",
    objective: { type: "deliver", itemId: "coconut", quantity: 2 },
    startLine:
      "Perfect timing. The FINNS-side grocery rush is about to start, and the young coconuts are running low. Bring me two from the Berawa beach palms and I will pay properly.",
    progressLine:
      "The palms by Berawa Beach drop coconuts after the breeze picks up. Bring me two and we can restock before the traffic wave.",
    turnInLine: (quest) =>
      `These are exactly right. Here is Rp ${quest.rewardMoney}, plus coffee for the road. The Berawa grocery crowd thanks you.`,
    completedLine: "You helped Canggu Station breathe today. Come by when you need groceries or coffee.",
    reputationTag: "helpful",
    reputationDelta: 6
  },
  {
    questId: "berawa_bakery_run",
    giverNpcId: "kadek",
    objective: { type: "deliver", itemId: "butter_croissant", quantity: 1 },
    startLine:
      "I promised to bring a croissant before the FINNS-side meetup. Could you buy one from BAKED. Berawa?",
    progressLine: "BAKED. Berawa is just off the main Berawa stretch. Bring me one Butter Croissant.",
    turnInLine: (quest) =>
      `Perfect. Still flaky, still warm. Take Rp ${quest.rewardMoney} and a couple of stickers for the run.`,
    completedLine: "The FINNS-side meetup survived. You move through Berawa like you know the shortcuts.",
    reputationTag: "reliable",
    reputationDelta: 5
  }
];

export function resolveNpcQuestInteraction(player: PlayerEntityState, npcId: string): QuestInteractionResult | null {
  const script = questScripts.find((candidate) => candidate.giverNpcId === npcId);
  if (!script) {
    return null;
  }

  const quest = questDefinitions[script.questId];
  if (!quest) {
    return null;
  }

  if (!isQuestActive(player, script.questId) && !isQuestComplete(player, script.questId)) {
    startQuest(player, script.questId);
    return {
      handled: true,
      dialogue: script.startLine,
      shouldSave: true,
      intents: []
    };
  }

  if (isQuestActive(player, script.questId)) {
    if (!isObjectiveSatisfied(player, script.objective)) {
      return {
        handled: true,
        dialogue: script.progressLine,
        shouldSave: false,
        intents: []
      };
    }

    consumeObjective(player, script.objective);
    const completed = completeQuest(player, script.questId);
    return {
      handled: true,
      dialogue: script.turnInLine(completed ?? quest),
      shouldSave: true,
      intents: [
        {
          kind: "RecordMemory",
          subjectType: "npc",
          subjectId: npcId,
          memory: "completed_quest",
          detail: completed?.title ?? quest.title
        },
        {
          kind: "AwardReputationTag",
          tag: script.reputationTag,
          reason: `Completed ${completed?.title ?? quest.id}`
        },
        {
          kind: "AdjustReputation",
          delta: script.reputationDelta,
          reason: `Completed ${completed?.title ?? quest.id}`
        }
      ]
    };
  }

  return {
    handled: true,
    dialogue: script.completedLine,
    shouldSave: false,
    intents: []
  };
}

export function getQuestObjectives(questId: string): QuestObjective[] {
  const script = questScripts.find((candidate) => candidate.questId === questId);
  return script ? [script.objective] : [];
}

function isObjectiveSatisfied(player: PlayerEntityState, objective: QuestObjective): boolean {
  if (objective.type === "collect" || objective.type === "deliver" || objective.type === "buy") {
    return getQuantity(player, objective.itemId) >= objective.quantity;
  }
  if (objective.type === "talk") {
    return true;
  }
  if (objective.type === "visit") {
    return true;
  }
  return false;
}

function consumeObjective(player: PlayerEntityState, objective: QuestObjective): InventoryEntry[] {
  if (objective.type !== "deliver") {
    return [];
  }
  const consumed: InventoryEntry[] = [{ itemId: objective.itemId, quantity: objective.quantity }];
  removeItem(player, objective.itemId, objective.quantity);
  return consumed;
}
