import type { QuestDefinition } from "../types";

export const questDefinitions: Record<string, QuestDefinition> = {
  canggu_station_restock: {
    id: "canggu_station_restock",
    title: "Canggu Station Restock",
    giverNpcId: "ibu_sari",
    shortDescription: "Ibu Sari needs two young coconuts for the Berawa grocery shelf.",
    activeText: "Gather 2 Young Coconuts from the Berawa Beach palms and return to Canggu Station.",
    turnInText: "Deliver 2 Young Coconuts to Ibu Sari near Canggu Station.",
    rewardMoney: 90,
    rewardItems: [{ itemId: "kopi_bali", quantity: 1 }]
  },
  berawa_bakery_run: {
    id: "berawa_bakery_run",
    title: "Berawa Bakery Run",
    giverNpcId: "kadek",
    shortDescription: "Kadek needs a croissant from BAKED. before heading toward FINNS.",
    activeText: "Buy 1 Butter Croissant from BAKED. Berawa and bring it back to Kadek.",
    turnInText: "Return to Kadek near FINNS with 1 Butter Croissant.",
    rewardMoney: 75,
    rewardItems: [{ itemId: "surf_sticker", quantity: 2 }]
  }
};
