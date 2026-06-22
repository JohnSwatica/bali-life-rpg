export interface SettlingInGoalDefinition {
  id: string;
  title: string;
  description: string;
}

export const settlingInGoalDefinitions: SettlingInGoalDefinition[] = [
  {
    id: "find_your_spot",
    title: "Find your spot",
    description: "Become a regular somewhere by doing three activities at one venue."
  },
  {
    id: "first_friend",
    title: "First friend",
    description: "Reach friendly tier with any NPC."
  },
  {
    id: "earn_your_keep",
    title: "Earn your keep",
    description: "Earn Rp 300 from work sessions."
  },
  {
    id: "touch_grass",
    title: "Touch grass",
    description: "Do a beach or wellbeing activity."
  },
  {
    id: "plug_in",
    title: "Plug in",
    description: "Attend an event or complete a focused work session."
  }
];
