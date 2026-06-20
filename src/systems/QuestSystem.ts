import { questDefinitions } from "../data/quests";
import type { PlayerEntityState, QuestDefinition } from "../types";

export function isQuestActive(player: PlayerEntityState, questId: string): boolean {
  return player.activeQuestIds.includes(questId);
}

export function isQuestComplete(player: PlayerEntityState, questId: string): boolean {
  return player.completedQuestIds.includes(questId);
}

export function startQuest(player: PlayerEntityState, questId: string): QuestDefinition | undefined {
  if (isQuestActive(player, questId) || isQuestComplete(player, questId)) {
    return questDefinitions[questId];
  }
  player.activeQuestIds.push(questId);
  return questDefinitions[questId];
}

export function completeQuest(player: PlayerEntityState, questId: string): QuestDefinition | undefined {
  const quest = questDefinitions[questId];
  if (!quest || isQuestComplete(player, questId)) {
    return quest;
  }
  player.activeQuestIds = player.activeQuestIds.filter((id) => id !== questId);
  player.completedQuestIds.push(questId);
  player.money += quest.rewardMoney;
  for (const reward of quest.rewardItems) {
    const existing = player.inventory.find((entry) => entry.itemId === reward.itemId);
    if (existing) {
      existing.quantity += reward.quantity;
    } else {
      player.inventory.push({ ...reward });
    }
  }
  return quest;
}

export function getQuestTrackerLines(player: PlayerEntityState): string[] {
  const active = player.activeQuestIds
    .map((questId) => questDefinitions[questId])
    .filter((quest): quest is QuestDefinition => Boolean(quest));

  if (active.length === 0) {
    return ["Talk to Ibu Sari by Canggu Station or Kadek near FINNS."];
  }

  return active.map((quest) => `${quest.title}: ${quest.activeText}`);
}
