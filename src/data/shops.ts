import type { ShopDefinition } from "../types";

export const shopDefinitions: Record<string, ShopDefinition> = {
  canggu_station: {
    id: "canggu_station",
    name: "Canggu Station",
    keeperNpcId: "ibu_sari",
    x: 610,
    y: 742,
    radius: 100,
    sells: ["pantry_bag", "coconut", "nasi_bungkus", "kopi_bali", "padel_wristband"],
    buys: ["coconut", "frangipani"],
    greeting: "A grocery stop on the FINNS-side Berawa run."
  },
  milk_madu_berawa: {
    id: "milk_madu_berawa",
    name: "Milk & Madu Berawa",
    keeperNpcId: "made",
    x: 1190,
    y: 610,
    radius: 95,
    sells: ["brunch_slice", "kopi_bali", "coconut"],
    buys: ["frangipani", "coconut"],
    greeting: "A busy Berawa cafe stop for brunch, coffee, and quick meetups."
  },
  baked_berawa: {
    id: "baked_berawa",
    name: "BAKED. Berawa",
    x: 675,
    y: 465,
    radius: 96,
    sells: ["butter_croissant", "coffee_beans", "kopi_bali"],
    buys: ["frangipani"],
    greeting: "A Semat-side bakery stop with pastries and coffee."
  },
  bungalow_living: {
    id: "bungalow_living",
    name: "Bungalow Living Bali",
    x: 1510,
    y: 820,
    radius: 105,
    sells: ["home_cushion", "woven_sarong", "beach_tote"],
    buys: ["frangipani", "coconut"],
    greeting: "A Berawa homewares and lifestyle shop with warm cafe energy."
  },
  satu_satu_coffee: {
    id: "satu_satu_coffee",
    name: "Satu-Satu Coffee Company",
    x: 1768,
    y: 365,
    radius: 120,
    sells: ["coffee_beans", "kopi_bali", "butter_croissant"],
    buys: ["frangipani", "pantry_bag"],
    greeting: "A Jl. Pantai Berawa coffee stop for serious morning fuel."
  },
  bali_family_rental_scooter: {
    id: "bali_family_rental_scooter",
    name: "Bali Family Rental Scooter",
    x: 820,
    y: 735,
    radius: 92,
    sells: ["scooter_rental"],
    buys: [],
    greeting: "A compact Jl. Pantai Berawa scooter counter. Save up, rent once, and Berawa opens up."
  }
};
