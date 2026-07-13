import type { DiscoveryLedgerEntry } from "../types";

export const discoveryLedgerEntries: DiscoveryLedgerEntry[] = [
  {
    id: "codex_housing_ladder",
    kind: "codex_note",
    title: "Kos, Kontrakan, Villa: The Ladder",
    body: "A kos is a single rented room, sometimes with a shared bathroom down the hall -- cheapest, and where almost everyone starts. A kontrakan is a whole house leased by the year, usually split between roommates who can afford to commit. A villa is leased or owned outright, the top of the ladder, and the one foreigners can never actually hold title to without a local partner -- more on that later. Every rung up costs more up front and buys you more privacy, more space, and more say over your own door.",
    unlock: { type: "act0_step_complete", step: "meet_ibu_sari" }
  },
  {
    id: "nusadrop_commission_squeeze",
    kind: "investigation",
    title: "NusaDrop Commission Squeeze",
    body: "After three runs, the numbers start to feel less like bad luck. Each completed delivery leaves a little more of the fare with NusaDrop and a little less for the driver doing the waiting, fuel, and weather. The board calls it efficiency. The street calls it a squeeze.",
    unlock: { type: "delivery_count", count: 3 }
  },
  {
    id: "nusadrop_hidden_rating_metric",
    kind: "investigation",
    title: "A Rating That Does More Than Rate",
    body: "A 4.5-star run changes more than the number beside your name. Better jobs surface faster, and some disappear before ordinary drivers even see them. NusaDrop is measuring something behind the visible rating -- the question is who that hidden score is really built to serve.",
    unlock: { type: "driver_rating", minimumRating: 4.5 }
  }
];
