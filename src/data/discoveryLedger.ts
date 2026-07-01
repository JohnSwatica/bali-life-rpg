import type { DiscoveryLedgerEntry } from "../types";

export const discoveryLedgerEntries: DiscoveryLedgerEntry[] = [
  {
    id: "elena_notebook_1",
    kind: "elena_fragment",
    title: "A Water-Damaged Notebook",
    body: "Tucked under the scooter seat, the pages are swollen and soft at the edges, but some of the ink survived. Recipe ratios. A sketch of a floor plan labeled 'RUMAH' in block letters. And, on the last legible page, one line underlined twice: 'Tell them it's temporary. It has to be temporary.'",
    unlock: { type: "pickup_collected", pickupId: "elena-notebook-seat" }
  },
  {
    id: "elena_sim_1",
    kind: "elena_fragment",
    title: "An Old SIM Card",
    body: "No phone to put it in -- not that it would still connect. Whoever it belonged to hasn't paid for service in a long time. Ibu Sari saw you turning it over in your hand and went very quiet before finding something urgent to do at the back of the shop.",
    unlock: { type: "pickup_collected", pickupId: "elena-sim-seat" }
  },
  {
    id: "codex_housing_ladder",
    kind: "codex_note",
    title: "Kos, Kontrakan, Villa: The Ladder",
    body: "A kos is a single rented room, sometimes with a shared bathroom down the hall -- cheapest, and where almost everyone starts. A kontrakan is a whole house leased by the year, usually split between roommates who can afford to commit. A villa is leased or owned outright, the top of the ladder, and the one foreigners can never actually hold title to without a local partner -- more on that later. Every rung up costs more up front and buys you more privacy, more space, and more say over your own door.",
    unlock: { type: "act0_step_complete", step: "meet_ibu_sari" }
  },
  {
    id: "elena_notebook_2",
    kind: "elena_fragment",
    title: "Notebook Page -- 'Rumah'",
    body: "Further into the notebook, one page survived better than the rest: a rough floor plan, tables sketched in, a name at the top underlined so many times the pen tore the paper -- RUMAH. Someone asked you today, not quite joking, if you're 'the new one driving Rumah's old bike.' When you asked what Rumah was, they went quiet and changed the subject.",
    unlock: { type: "delivery_count", count: 3 }
  }
];
