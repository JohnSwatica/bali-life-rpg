import type { ShopDefinition } from "../types";
import { getVenueInteractionRadius, getVenuePoint } from "./layoutLookup";
import { scaleDistance } from "../systems/map/WorldScale";

const cangguStation = getVenuePoint("canggu_station", { x: 610, y: 742 });
const milkMadu = getVenuePoint("milk_madu_berawa", { x: 1190, y: 610 });
const baked = getVenuePoint("baked_berawa", { x: 675, y: 465 });
const bungalowLiving = getVenuePoint("bungalow_living", { x: 1510, y: 820 });
const satuSatu = getVenuePoint("satu_satu_coffee", { x: 1768, y: 365 });
const scooterRental = getVenuePoint("bali_family_rental_scooter", { x: 820, y: 735 });

export const shopDefinitions: Record<string, ShopDefinition> = {
  canggu_station: {
    id: "canggu_station",
    name: "Canggu Station",
    keeperNpcId: "ibu_sari",
    x: cangguStation.x,
    y: cangguStation.y,
    radius: getVenueInteractionRadius("canggu_station", scaleDistance(100)),
    sells: ["pantry_bag", "coconut", "nasi_bungkus", "kopi_bali", "padel_wristband"],
    buys: ["coconut", "frangipani"],
    greeting: "A grocery stop on the FINNS-side Berawa run."
  },
  milk_madu_berawa: {
    id: "milk_madu_berawa",
    name: "Milk & Madu Berawa",
    keeperNpcId: "made",
    x: milkMadu.x,
    y: milkMadu.y,
    radius: getVenueInteractionRadius("milk_madu_berawa", scaleDistance(95)),
    sells: ["brunch_slice", "kopi_bali", "coconut"],
    buys: ["frangipani", "coconut"],
    greeting: "A busy Berawa cafe stop for brunch, coffee, and quick meetups."
  },
  baked_berawa: {
    id: "baked_berawa",
    name: "BAKED. Berawa",
    x: baked.x,
    y: baked.y,
    radius: getVenueInteractionRadius("baked_berawa", scaleDistance(96)),
    sells: ["butter_croissant", "coffee_beans", "kopi_bali"],
    buys: ["frangipani"],
    greeting: "A Semat-side bakery stop with pastries and coffee."
  },
  bungalow_living: {
    id: "bungalow_living",
    name: "Bungalow Living Bali",
    x: bungalowLiving.x,
    y: bungalowLiving.y,
    radius: getVenueInteractionRadius("bungalow_living", scaleDistance(105)),
    sells: ["home_cushion", "woven_sarong", "beach_tote"],
    buys: ["frangipani", "coconut"],
    greeting: "A Berawa homewares and lifestyle shop with warm cafe energy."
  },
  satu_satu_coffee: {
    id: "satu_satu_coffee",
    name: "Satu-Satu Coffee Company",
    x: satuSatu.x,
    y: satuSatu.y,
    radius: getVenueInteractionRadius("satu_satu_coffee", scaleDistance(120)),
    sells: ["coffee_beans", "kopi_bali", "butter_croissant"],
    buys: ["frangipani", "pantry_bag"],
    greeting: "A Jl. Pantai Berawa coffee stop for serious morning fuel."
  },
  bali_family_rental_scooter: {
    id: "bali_family_rental_scooter",
    name: "Bali Family Rental Scooter",
    x: scooterRental.x,
    y: scooterRental.y,
    radius: getVenueInteractionRadius("bali_family_rental_scooter", scaleDistance(92)),
    sells: ["scooter_rental"],
    buys: [],
    greeting: "A compact Jl. Pantai Berawa scooter counter. Save up, rent once, and Berawa opens up."
  }
};
