import type { RelationshipArcDefinition } from "../types";

export const relationshipArcDefinitions: RelationshipArcDefinition[] = [
  {
    id: "ari_beach_regular",
    npcId: "ari",
    title: "Ari: Beach Regular",
    beats: [
      {
        id: "ari_remembers_your_name",
        title: "Name in the sand",
        description: "Ari starts greeting you like someone who belongs near the tide chart, not just another visitor.",
        minAffinity: 4,
        payoff: {
          kind: "recurring_hangout",
          text: "Ari points out the best time for easy beach hangs before the sunset crowd."
        }
      },
      {
        id: "ari_run_crew_invite",
        title: "Run crew invite",
        description: "After seeing you show up for the morning rhythm, Ari invites you into the run crew.",
        minAffinity: 8,
        requiresEventIds: ["berawa_beach_run_morning"],
        payoff: {
          kind: "club_invite",
          groupId: "berawa_run_crew",
          text: "Berawa Run Crew invite unlocked and joined."
        }
      },
      {
        id: "ari_roommate_whisper",
        title: "Quiet-room whisper",
        description: "Ari mentions that people who keep showing up sometimes hear about rooms before they hit the chats.",
        minAffinity: 18,
        requiresJoinedClubIds: ["berawa_surf_circle"],
        payoff: {
          kind: "housing_lead_tease",
          text: "Future Nomad Nest hook: Ari may introduce a quiet housing lead later."
        }
      }
    ]
  },
  {
    id: "made_home_base",
    npcId: "made",
    title: "Made: Home Base",
    beats: [
      {
        id: "made_taste_check",
        title: "Taste check",
        description: "Made notices what kind of home base you are trying to build, even if your room is still mostly a suitcase.",
        minAffinity: 4,
        payoff: {
          kind: "recurring_hangout",
          text: "Made's homeware chats now feel warmer in the Contacts tab."
        }
      },
      {
        id: "made_regular_discount_hook",
        title: "Regular shelf",
        description: "Made quietly points you toward the practical shelf instead of the tourist shelf.",
        minAffinity: 10,
        requiresEventIds: ["bungalow_home_base_intro"],
        payoff: {
          kind: "discount_hook",
          text: "Future discount hook noted for Bungalow Living; no commerce integration yet."
        }
      },
      {
        id: "made_housemate_tease",
        title: "Housemate taste",
        description: "Made says matching housemates is partly about taste, partly about morning noise, and partly about trust.",
        minAffinity: 18,
        payoff: {
          kind: "housing_lead_tease",
          text: "Future Nomad Nest hook: Made can later bridge lifestyle tags into housing matches."
        }
      }
    ]
  },
  {
    id: "ibu_sari_neighborhood_net",
    npcId: "ibu_sari",
    title: "Ibu Sari: Neighborhood Net",
    beats: [
      {
        id: "sari_knows_you_help",
        title: "Helpful regular",
        description: "Ibu Sari remembers that you helped restock when the shelves were thin.",
        minAffinity: 4,
        requiresCompletedQuestIds: ["canggu_station_restock"],
        payoff: {
          kind: "recurring_hangout",
          text: "Ibu Sari starts treating grocery runs as neighborhood check-ins."
        }
      },
      {
        id: "sari_market_hour_nod",
        title: "Market hour nod",
        description: "After a market walk, Ibu Sari gives you a nod that says you are learning the local rhythm.",
        minAffinity: 10,
        requiresEventIds: ["canggu_station_market_hour"],
        payoff: {
          kind: "discount_hook",
          text: "Future grocery regular perk noted; no live pricing changes yet."
        }
      }
    ]
  }
];
