import type { Meter } from "../types";

export type GameplayStationId = "cafe" | "beach" | "beach_club" | "warung" | "coworking" | "home";

export interface StationTimeOfDayModifier {
  label: string;
  startsAt: number;
  endsAt: number;
  meterMultiplier?: number;
  moneyMultiplier?: number;
  meterDeltas?: Partial<Record<Meter, number>>;
}

export interface GameplayStationLoop {
  id: GameplayStationId;
  title: string;
  venueIds: string[];
  fantasy: string;
  primaryMechanic: string;
  rewardShape: string;
  riskTradeoff: string;
  bestTimeOfDay: string;
}

export const gameplayStationLoops: GameplayStationLoop[] = [
  {
    id: "cafe",
    title: "Cafe focus table",
    venueIds: ["satu_satu_coffee", "milk_madu_berawa", "nude_cafe_berawa", "baked_berawa"],
    fantasy: "A laptop, a coffee, and the social gravity of being seen working in Berawa.",
    primaryMechanic: "Choose between paid deep work, a proper brunch reset, or quick coffee recovery.",
    rewardShape: "Focus and small social gains, with energy and money as the limiter.",
    riskTradeoff: "Too much cafe time burns energy and can blur into expensive procrastination.",
    bestTimeOfDay: "Morning and early afternoon are strongest for focus."
  },
  {
    id: "beach",
    title: "Beach reset",
    venueIds: ["berawa_beach"],
    fantasy: "Saltwater, surf wax, and remembering why the move sounded romantic.",
    primaryMechanic: "Spend time and energy for wellbeing, recovery, or surf reputation.",
    rewardShape: "Wellbeing, light social, and explorer reputation.",
    riskTradeoff: "Great reset, poor productivity if the whole day slips into the tide.",
    bestTimeOfDay: "Morning surf and sunset walks are strongest."
  },
  {
    id: "beach_club",
    title: "Beach club night",
    venueIds: ["finns_beach_club"],
    fantasy: "Fast social access, loud music, and the bill arriving before wisdom does.",
    primaryMechanic: "Buy into social acceleration or take a smaller, safer exit.",
    rewardShape: "Large social gains, small wellbeing lift, and possible venue-regular reputation.",
    riskTradeoff: "Money, focus, energy, and next morning are the real price.",
    bestTimeOfDay: "Sunset and night are where the club pays off."
  },
  {
    id: "warung",
    title: "Warung meal",
    venueIds: ["ulekan_berawa"],
    fantasy: "Cheap rice, sambal, and a local rhythm that makes the day feel grounded.",
    primaryMechanic: "Pick nourishment, budget prep, or neighborly chat.",
    rewardShape: "Efficient energy and wellbeing restoration, with small relationship warmth.",
    riskTradeoff: "Low risk, but time spent here is recovery rather than ambition.",
    bestTimeOfDay: "Lunch and early dinner are best."
  },
  {
    id: "coworking",
    title: "Coworking sprint",
    venueIds: ["tropical_nomad_coworking_space", "outpost_canggu_coworking"],
    fantasy: "Air-con, accountable strangers, and the promise of becoming a serious person today.",
    primaryMechanic: "Pay for structured focus, network, or handle admin.",
    rewardShape: "Money, focus, and social accountability with a venue fee.",
    riskTradeoff: "Stronger output than cafes, but energy drains faster and it costs to enter.",
    bestTimeOfDay: "Late morning to afternoon is the productive window."
  },
  {
    id: "home",
    title: "Cheap kos room",
    venueIds: ["cheap_kos"],
    fantasy: "The tiny room that turns Bali from a trip into a life you can manage.",
    primaryMechanic: "Sleep, prepare, or plan without leaving the core field loop.",
    rewardShape: "Recovery, focus setup, and light item prep.",
    riskTradeoff: "Safe, but it can consume the day if used as avoidance.",
    bestTimeOfDay: "Night is for sleep; morning is for planning."
  }
];

export function getGameplayStationLoop(stationId: GameplayStationId): GameplayStationLoop {
  return gameplayStationLoops.find((station) => station.id === stationId) ?? gameplayStationLoops[0];
}

export function getGameplayStationLoopForVenue(venueId: string): GameplayStationLoop | undefined {
  return gameplayStationLoops.find((station) => station.venueIds.includes(venueId));
}
