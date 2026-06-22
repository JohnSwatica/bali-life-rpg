import type { CuratedCategory } from "./curatedVenues";

export interface StreetVenueFlavor {
  body: string;
  focusDelta: number;
  socialEnergyDelta: number;
  connectionDelta: number;
  firstVisitToast: string;
  repeatToast: string;
}

interface StreetVenueFlavorContext {
  venueId: string;
  name: string;
  category: CuratedCategory | string;
  isLandmark: boolean;
  minuteOfDay: number;
}

const specificFlavors: Record<string, Omit<StreetVenueFlavor, "repeatToast">> = {
  milk_madu_berawa: {
    body: "The tables are full of brunch plates, family chatter, and two laptops negotiating for one outlet. You catch a little neighborhood signal from the notice board.",
    focusDelta: 2,
    socialEnergyDelta: 2,
    connectionDelta: 1,
    firstVisitToast: "You learned where brunch crews tend to gather."
  },
  baked_berawa: {
    body: "Warm pastry air spills onto the sidewalk. A runner is comparing croissant boxes against a phone note before the morning traffic wave.",
    focusDelta: 3,
    socialEnergyDelta: 1,
    connectionDelta: 0,
    firstVisitToast: "BAKED. is now part of your morning route."
  },
  canggu_station: {
    body: "The shelves are practical and busy: pantry bags, water, last-minute snacks, and locals moving faster than the expat queue.",
    focusDelta: 1,
    socialEnergyDelta: 0,
    connectionDelta: 0,
    firstVisitToast: "You clocked the grocery stop for real errands."
  },
  bali_family_rental_scooter: {
    body: "A row of helmets hangs behind the counter. The owner points at a safety card before talking price, traffic, and where not to park.",
    focusDelta: 2,
    socialEnergyDelta: 0,
    connectionDelta: 0,
    firstVisitToast: "Scooter rental noted: mobility changes everything."
  },
  finns_recreation_club: {
    body: "Courts, gym bags, and post-workout smoothies orbit the entrance. This is where fitness plans turn into actual calendar invites.",
    focusDelta: 1,
    socialEnergyDelta: 2,
    connectionDelta: 1,
    firstVisitToast: "You found a fitness-social anchor."
  },
  finns_beach_club: {
    body: "Bass rolls over the beach edge while staff move like choreography. It feels less like a shop and more like a whole evening ecosystem.",
    focusDelta: 0,
    socialEnergyDelta: 3,
    connectionDelta: 1,
    firstVisitToast: "You found the beach-club crowd."
  },
  atlas_beach_fest: {
    body: "The entrance is all scale: big signage, group photos, and people deciding whether sunset should become a full night out.",
    focusDelta: 0,
    socialEnergyDelta: 3,
    connectionDelta: 1,
    firstVisitToast: "Atlas is on your social radar."
  },
  berawa_beach: {
    body: "The road relaxes into sand, boards, coconuts, and sunset watchers. You can feel the whole street emptying toward the water.",
    focusDelta: 2,
    socialEnergyDelta: 1,
    connectionDelta: 0,
    firstVisitToast: "Berawa Beach added to your daily rhythm."
  },
  satu_satu_coffee: {
    body: "The coffee counter smells serious. A small crowd is quietly optimizing their morning: beans, inbox, surf report, repeat.",
    focusDelta: 4,
    socialEnergyDelta: -1,
    connectionDelta: 0,
    firstVisitToast: "You found a focus-friendly coffee stop."
  },
  bungalow_living: {
    body: "Woven textures, cushions, and quiet cafe energy make this feel like settling in, not just passing through.",
    focusDelta: 1,
    socialEnergyDelta: 1,
    connectionDelta: 0,
    firstVisitToast: "You found the soft landing side of Berawa."
  }
};

export function getStreetVenueFlavor(ctx: StreetVenueFlavorContext): StreetVenueFlavor {
  const specific = specificFlavors[ctx.venueId];
  if (specific) {
    return {
      ...specific,
      repeatToast: repeatToast(ctx.name)
    };
  }

  const timeNote = timeOfDayNote(ctx.minuteOfDay);
  const fallback = fallbackByCategory(ctx.category, ctx.isLandmark);
  return {
    ...fallback,
    body: `${fallback.body} ${timeNote}`,
    repeatToast: repeatToast(ctx.name)
  };
}

function fallbackByCategory(category: CuratedCategory | string, isLandmark: boolean): Omit<StreetVenueFlavor, "repeatToast"> {
  if (isLandmark || category === "beach_club") {
    return {
      body: "The frontage pulls groups together: wristbands, beach plans, and half-made decisions about where the evening goes next.",
      focusDelta: 0,
      socialEnergyDelta: 2,
      connectionDelta: 1,
      firstVisitToast: "You marked a major social anchor."
    };
  }
  if (category === "cafe" || category === "coffee" || category === "bakery") {
    return {
      body: "Small tables spill toward the sidewalk. Someone is always half-working, half-planning the next surf, gym, or dinner thing.",
      focusDelta: 2,
      socialEnergyDelta: 1,
      connectionDelta: 0,
      firstVisitToast: "You found another day-route stop."
    };
  }
  if (category === "restaurant" || category === "bar") {
    return {
      body: "Menus, music, and early dinner plans sit right on the street edge. This is where casual invites become group chats.",
      focusDelta: 0,
      socialEnergyDelta: 2,
      connectionDelta: 1,
      firstVisitToast: "You spotted a social dinner node."
    };
  }
  if (category === "grocery" || category === "shop") {
    return {
      body: "The useful stuff lives here: quick errands, small talk, and the tiny purchases that make the day run smoother.",
      focusDelta: 1,
      socialEnergyDelta: 0,
      connectionDelta: 0,
      firstVisitToast: "You mapped a practical errand stop."
    };
  }
  if (category === "beach") {
    return {
      body: "Sand takes over the sidewalk mood. People slow down, scan the waves, and pretend they came here with no plan.",
      focusDelta: 2,
      socialEnergyDelta: 1,
      connectionDelta: 0,
      firstVisitToast: "You found the beach end of the loop."
    };
  }
  return {
    body: "The storefront has a local rhythm: staff setting things out, regulars nodding hello, and someone checking what is happening later.",
    focusDelta: 1,
    socialEnergyDelta: 1,
    connectionDelta: 0,
    firstVisitToast: "You learned a little more of the street."
  };
}

function timeOfDayNote(minuteOfDay: number): string {
  if (minuteOfDay < 660) {
    return "Morning light makes it feel like a route decision, not a destination yet.";
  }
  if (minuteOfDay < 1020) {
    return "By afternoon, the sidewalk is half errands and half people drifting between plans.";
  }
  return "The evening version feels more social, with people scanning for familiar faces.";
}

function repeatToast(name: string): string {
  return `${name} feels a little more familiar.`;
}
