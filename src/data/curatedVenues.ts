/**
 * Curated Berawa venues for the in-game map.  (34 curated + 7 game anchors = 41)
 *
 * COORDINATE TRUST — read before placing anything:
 * - `source: 'gemini_maps_estimate'` coordinates (`estimatedCoord`) came from Gemini and are NOT
 *   verified pins. Evidence: its map links were constructed from the numbers, and many matched a
 *   prior batch that shipped with fabricated place IDs. Treat them as estimates only.
 * - `source: 'game_anchor'` venues are existing gameplay anchors (quests / NPCs / shops). Gemini's
 *   list omitted them; they have no rating yet and render via `questCritical`. Do NOT drop them —
 *   Canggu Station and BAKED. Berawa back the starter quests.
 *
 * COORDINATE RESOLUTION (generator, on the dev machine) — resolve REAL positions, do not trust estimatedCoord:
 *   1. Match `name` against the cached OSM POI extract (data/osm/berawa.overpass.json) → real OSM coordinate.
 *   2. Else geocode `geocodeQuery` (name + full address) via the existing Nominatim path.
 *   3. Else use `estimatedCoord` (Gemini estimate) and FLAG it in the layout report.
 *   4. Else place in the venue's area and list it for manual correction.
 *
 * RENDER RULE: render a venue iff `shouldRender(v)` — clears the quality bar OR is questCritical.
 * Quality bar: rating >= 4.5 AND reviewCount >= 500.  (All curated entries here clear it.)
 *
 * Curated content in src/data/venues.ts stays authoritative for NPCs/quests/descriptions; this file
 * supplies positions, quality data, and the render filter. `verifiedAt` is a pull date, not a
 * liveness claim. Map data note: not a live Google feed.
 */

export type CuratedCategory =
  | 'cafe' | 'coffee' | 'restaurant' | 'bar' | 'beach_club'
  | 'bakery' | 'grocery' | 'coworking' | 'shop' | 'beach';

export interface CuratedVenue {
  id: string;
  name: string;
  category: CuratedCategory;
  geocodeQuery: string;                               // preferred coordinate source (name + address)
  estimatedCoord: { lat: number; lng: number } | null; // UNVERIFIED Gemini estimate; last resort only
  mapsSearchLink: string;                             // opens a real Maps search (not a pinned coordinate)
  rating: number | null;
  reviewCount: number | null;
  priceLevel: string | null;
  address: string | null;
  street: string | null;
  typicalHours: string | null;
  knownFor: string | null;
  tags: string[];
  isLandmark: boolean;
  inBerawaCore: boolean;
  questCritical: boolean;
  source: 'gemini_maps_estimate' | 'game_anchor';
  verificationStatus: 'verified' | 'needs_verification';
  verifiedAt: string | null;
}

export const meetsQualityBar = (v: CuratedVenue): boolean =>
  v.rating != null && v.reviewCount != null && v.rating >= 4.5 && v.reviewCount >= 500;

export const shouldRender = (v: CuratedVenue): boolean => v.questCritical || meetsQualityBar(v);

export const curatedVenues: CuratedVenue[] = [
  {
    "id": "milk_and_madu_berawa",
    "name": "Milk & Madu Berawa",
    "category": "cafe",
    "geocodeQuery": "Milk & Madu Berawa, Jl. Pantai Berawa No.52, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.661314,
      "lng": 115.140344
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Milk%20%26%20Madu%20Berawa%20Jl.%20Pantai%20Berawa%20No.52%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 6850,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.52, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "07:00–22:00 daily",
    "knownFor": "Gourmet open-air brunch and family-friendly stone-fired pizzas",
    "tags": [
      "brunch",
      "pizza",
      "coffee",
      "family-friendly"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": true,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "milu_by_nook",
    "name": "Milu by Nook",
    "category": "cafe",
    "geocodeQuery": "Milu by Nook, Jl. Pantai Berawa No.90X, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.660822,
      "lng": 115.140114
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Milu%20by%20Nook%20Jl.%20Pantai%20Berawa%20No.90X%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 5920,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.90X, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "08:00–23:00 daily",
    "knownFor": "Beautiful rice field views and Western-Asian fusion dishes",
    "tags": [
      "rice-view",
      "fusion",
      "dinner",
      "aesthetic"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "nude",
    "name": "Nude",
    "category": "cafe",
    "geocodeQuery": "Nude, Jl. Pantai Berawa No.33, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.662703,
      "lng": 115.138401
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Nude%20Jl.%20Pantai%20Berawa%20No.33%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 2610,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.33, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "07:00–22:00 daily",
    "knownFor": "Digital nomad workspace with healthy breakfast and lunch",
    "tags": [
      "digital-nomad",
      "brunch",
      "healthy",
      "air-conditioned"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "hungry_bird_coffee_roaster",
    "name": "Hungry Bird Coffee Roaster",
    "category": "coffee",
    "geocodeQuery": "Hungry Bird Coffee Roaster, Jl. Raya Semat No.86, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.660168,
      "lng": 115.142422
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Hungry%20Bird%20Coffee%20Roaster%20Jl.%20Raya%20Semat%20No.86%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 1980,
    "priceLevel": "$",
    "address": "Jl. Raya Semat No.86, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Raya Semat",
    "typicalHours": "08:00–17:00 daily",
    "knownFor": "Specialty house-roasted coffee and affordable breakfast",
    "tags": [
      "specialty-coffee",
      "roastery",
      "breakfast",
      "affordable"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "cinta_cafe",
    "name": "Cinta Cafe",
    "category": "cafe",
    "geocodeQuery": "Cinta Cafe, Jl. Pantai Berawa No.69, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.661152,
      "lng": 115.140924
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Cinta%20Cafe%20Jl.%20Pantai%20Berawa%20No.69%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.5,
    "reviewCount": 1650,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.69, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "08:00–22:00 daily",
    "knownFor": "Relaxed open-air dining with scenic rice field views",
    "tags": [
      "rice-view",
      "brunch",
      "coffee",
      "casual"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "macan_cafe",
    "name": "Macan Cafe",
    "category": "cafe",
    "geocodeQuery": "Macan Cafe, Jl. Pantai Berawa No.14, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.661556,
      "lng": 115.139912
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Macan%20Cafe%20Jl.%20Pantai%20Berawa%20No.14%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 1280,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.14, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "07:30–22:00 daily",
    "knownFor": "French-bistro inspired cafe with excellent Western food",
    "tags": [
      "bistro",
      "western",
      "coffee",
      "brunch"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "secret_spot_canggu",
    "name": "Secret Spot Canggu",
    "category": "cafe",
    "geocodeQuery": "Secret Spot Canggu, Jl. Pantai Berawa No.44, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.662121,
      "lng": 115.139201
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Secret%20Spot%20Canggu%20Jl.%20Pantai%20Berawa%20No.44%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 1120,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.44, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "08:00–22:00 daily",
    "knownFor": "Vegan desserts and plant-based comfort food",
    "tags": [
      "vegan",
      "plant-based",
      "desserts",
      "healthy"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "lusa_by_suka",
    "name": "Lusa By Suka",
    "category": "cafe",
    "geocodeQuery": "Lusa By Suka, Jl. Pantai Berawa No.99, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.664401,
      "lng": 115.135112
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Lusa%20By%20Suka%20Jl.%20Pantai%20Berawa%20No.99%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.7,
    "reviewCount": 1050,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.99, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "07:30–22:00 daily",
    "knownFor": "Aesthetic cafe with specialty coffee and Australian-style brunch",
    "tags": [
      "brunch",
      "specialty-coffee",
      "aesthetic",
      "australian"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "matcha_cafe_bali",
    "name": "Matcha Cafe Bali",
    "category": "cafe",
    "geocodeQuery": "Matcha Cafe Bali, Jl. Pantai Berawa No.99, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.662923,
      "lng": 115.137544
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Matcha%20Cafe%20Bali%20Jl.%20Pantai%20Berawa%20No.99%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.5,
    "reviewCount": 1010,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.99, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "07:30–22:00 daily",
    "knownFor": "Organic ceremonial matcha drinks and healthy bowls",
    "tags": [
      "matcha",
      "healthy",
      "smoothie-bowl",
      "vegan-friendly"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "two_trees_eatery",
    "name": "Two Trees Eatery",
    "category": "cafe",
    "geocodeQuery": "Two Trees Eatery, Jl. Pantai Berawa No.99B, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66415,
      "lng": 115.13608
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Two%20Trees%20Eatery%20Jl.%20Pantai%20Berawa%20No.99B%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 890,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.99B, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "07:00–16:00 daily",
    "knownFor": "Bright wholefoods eatery offering guilt-free nourishment",
    "tags": [
      "healthy",
      "brunch",
      "wholefoods",
      "smoothies"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "ruko_cafe",
    "name": "Ruko Cafe",
    "category": "cafe",
    "geocodeQuery": "Ruko Cafe, Jl. Pantai Berawa No.99, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.663145,
      "lng": 115.137399
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Ruko%20Cafe%20Jl.%20Pantai%20Berawa%20No.99%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 810,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.99, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "07:30–16:00 daily",
    "knownFor": "Specialty coffee and industrial-chic coastal surf vibes",
    "tags": [
      "specialty-coffee",
      "surf-vibe",
      "breakfast",
      "acai"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "sari_kitchen_and_community",
    "name": "Sari Kitchen & Community",
    "category": "cafe",
    "geocodeQuery": "Sari Kitchen & Community, Jl. Pantai Berawa No.101X, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.660991,
      "lng": 115.139144
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Sari%20Kitchen%20%26%20Community%20Jl.%20Pantai%20Berawa%20No.101X%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 540,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.101X, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "07:00–22:00 daily",
    "knownFor": "Community cafe serving local and international comfort dishes",
    "tags": [
      "community",
      "brunch",
      "local-ingredients",
      "coffee"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "losteria_funiculi_funicula_canggu",
    "name": "L'Osteria Funiculì Funiculà Canggu",
    "category": "restaurant",
    "geocodeQuery": "L'Osteria Funiculì Funiculà Canggu, Jl. Pantai Berawa No.40, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66282,
      "lng": 115.13812
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=L'Osteria%20Funicul%C3%AC%20Funicul%C3%A0%20Canggu%20Jl.%20Pantai%20Berawa%20No.40%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 1750,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.40, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "12:00–23:00 daily",
    "knownFor": "Neapolitan sourdough pizzas and fresh homemade pastas",
    "tags": [
      "italian",
      "pizza",
      "pasta",
      "wine"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "ulekan",
    "name": "Ulekan",
    "category": "restaurant",
    "geocodeQuery": "Ulekan, Jl. Tegal Sari No.34, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66012,
      "lng": 115.14318
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Ulekan%20Jl.%20Tegal%20Sari%20No.34%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 980,
    "priceLevel": "$$",
    "address": "Jl. Tegal Sari No.34, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Tegal Sari",
    "typicalHours": "11:00–22:00 daily",
    "knownFor": "MSG-free traditional Indonesian flavors in styled interiors",
    "tags": [
      "indonesian",
      "traditional",
      "curry",
      "boutique"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "tygr_sushi_berawa",
    "name": "Tygr Sushi Berawa",
    "category": "restaurant",
    "geocodeQuery": "Tygr Sushi Berawa, Jl. Pantai Berawa No.99X, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66348,
      "lng": 115.13698
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Tygr%20Sushi%20Berawa%20Jl.%20Pantai%20Berawa%20No.99X%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.5,
    "reviewCount": 840,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.99X, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "12:00–23:00 daily",
    "knownFor": "Casual hand-rolled sushi bar and crispy rice bowls",
    "tags": [
      "japanese",
      "sushi",
      "hand-rolls",
      "casual"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "wild_habit_pizza",
    "name": "Wild Habit Pizza",
    "category": "restaurant",
    "geocodeQuery": "Wild Habit Pizza, Jl. Pantai Berawa No.34, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66255,
      "lng": 115.13861
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Wild%20Habit%20Pizza%20Jl.%20Pantai%20Berawa%20No.34%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.7,
    "reviewCount": 760,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.34, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "12:00–23:00 daily",
    "knownFor": "Wood-fired Neapolitan pizzas paired with craft cocktails",
    "tags": [
      "pizza",
      "italian",
      "cocktails",
      "woodfired"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "bottega_italiana_berawa",
    "name": "Bottega Italiana Berawa",
    "category": "restaurant",
    "geocodeQuery": "Bottega Italiana Berawa, Jl. Pantai Berawa No.51, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66181,
      "lng": 115.13972
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Bottega%20Italiana%20Berawa%20Jl.%20Pantai%20Berawa%20No.51%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.5,
    "reviewCount": 740,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.51, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "08:00–23:00 daily",
    "knownFor": "Fresh homemade pasta boutique and Italian deli bites",
    "tags": [
      "pasta",
      "italian",
      "deli",
      "homemade"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "da_romeo_restaurant",
    "name": "Da Romeo Restaurant",
    "category": "restaurant",
    "geocodeQuery": "Da Romeo Restaurant, Jl. Pantai Berawa No.29, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66221,
      "lng": 115.13912
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Da%20Romeo%20Restaurant%20Jl.%20Pantai%20Berawa%20No.29%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 730,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.29, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "12:00–23:00 daily",
    "knownFor": "Intimate vintage dining with hearty premium steaks",
    "tags": [
      "steak",
      "italian",
      "romantic",
      "dinner"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "manggis_in_canggu",
    "name": "Manggis in Canggu",
    "category": "restaurant",
    "geocodeQuery": "Manggis in Canggu, Jl. Pemelisan Agung No.7, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66421,
      "lng": 115.13284
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Manggis%20in%20Canggu%20Jl.%20Pemelisan%20Agung%20No.7%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 710,
    "priceLevel": "$$",
    "address": "Jl. Pemelisan Agung No.7, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pemelisan Agung",
    "typicalHours": "08:30–22:30 daily",
    "knownFor": "Creative plant-based Eastern-Western fusion comfort food",
    "tags": [
      "vegan",
      "vegetarian",
      "fusion",
      "healthy"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "one_eyed_jack",
    "name": "One Eyed Jack",
    "category": "restaurant",
    "geocodeQuery": "One Eyed Jack, Jl. Pantai Berawa No.89c, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66448,
      "lng": 115.13555
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=One%20Eyed%20Jack%20Jl.%20Pantai%20Berawa%20No.89c%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 640,
    "priceLevel": "$$$",
    "address": "Jl. Pantai Berawa No.89c, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "17:00–23:00 daily",
    "knownFor": "Izakaya with modern Japanese-Peruvian shared plates",
    "tags": [
      "japanese",
      "izakaya",
      "fusion",
      "sake"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "golden_monkey_chinese_restaurant",
    "name": "Golden Monkey Chinese Restaurant",
    "category": "restaurant",
    "geocodeQuery": "Golden Monkey Chinese Restaurant, Tamora Gallery, Jl. Pantai Berawa, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66242,
      "lng": 115.13885
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Golden%20Monkey%20Chinese%20Restaurant%20Tamora%20Gallery%2C%20Jl.%20Pantai%20Berawa%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 610,
    "priceLevel": "$$$",
    "address": "Tamora Gallery, Jl. Pantai Berawa, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "11:30–22:30 daily",
    "knownFor": "Cantonese dim sum and savory roasted meats",
    "tags": [
      "chinese",
      "dim-sum",
      "cantonese",
      "family-sharing"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "trattoria_canggu",
    "name": "Trattoria Canggu",
    "category": "restaurant",
    "geocodeQuery": "Trattoria Canggu, Jl. Pantai Berawa No.100X, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66551,
      "lng": 115.13372
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Trattoria%20Canggu%20Jl.%20Pantai%20Berawa%20No.100X%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.5,
    "reviewCount": 520,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.100X, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "11:00–23:00 daily",
    "knownFor": "Casual Italian spot with home-style pizzas and pastas",
    "tags": [
      "italian",
      "pizza",
      "pasta",
      "casual"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "behind_the_green_door",
    "name": "Behind The Green Door",
    "category": "bar",
    "geocodeQuery": "Behind The Green Door, Jl. Pantai Berawa No.44, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66121,
      "lng": 115.14115
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Behind%20The%20Green%20Door%20Jl.%20Pantai%20Berawa%20No.44%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 680,
    "priceLevel": "$$$",
    "address": "Jl. Pantai Berawa No.44, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "21:00–04:00 daily",
    "knownFor": "Intimate speakeasy cocktail lounge with late-night DJs",
    "tags": [
      "speakeasy",
      "cocktails",
      "nightlife",
      "music"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "synkonah",
    "name": "Synkonah",
    "category": "bar",
    "geocodeQuery": "Synkonah, Jl. Pantai Berawa No.99, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66295,
      "lng": 115.13788
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Synkonah%20Jl.%20Pantai%20Berawa%20No.99%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.5,
    "reviewCount": 540,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.99, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "12:00–00:00 daily",
    "knownFor": "Mediterranean bistro with upscale tapas and gin",
    "tags": [
      "bar",
      "tapas",
      "mediterranean",
      "gin-bar"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "the_shady_pig",
    "name": "The Shady Pig",
    "category": "bar",
    "geocodeQuery": "The Shady Pig, Taman Tamora, Jl. Pantai Berawa, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66191,
      "lng": 115.13892
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=The%20Shady%20Pig%20Taman%20Tamora%2C%20Jl.%20Pantai%20Berawa%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 510,
    "priceLevel": "$$$",
    "address": "Taman Tamora, Jl. Pantai Berawa, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Taman Tamora",
    "typicalHours": "18:00–02:00 daily",
    "knownFor": "1920s-themed experimental cocktail lounge",
    "tags": [
      "speakeasy",
      "experimental-cocktails",
      "lounge",
      "vintage"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "finns_beach_club",
    "name": "FINNS Beach Club",
    "category": "beach_club",
    "geocodeQuery": "FINNS Beach Club, Jl. Pantai Berawa No.5, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66695,
      "lng": 115.13012
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=FINNS%20Beach%20Club%20Jl.%20Pantai%20Berawa%20No.5%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.5,
    "reviewCount": 36240,
    "priceLevel": "$$$",
    "address": "Jl. Pantai Berawa No.5, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "10:00–00:00 daily",
    "knownFor": "Iconic oceanfront lifestyle venue with infinity pools",
    "tags": [
      "beach-club",
      "nightlife",
      "sunset",
      "pools"
    ],
    "isLandmark": true,
    "inBerawaCore": false,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "atlas_beach_fest",
    "name": "Atlas Beach Fest",
    "category": "beach_club",
    "geocodeQuery": "Atlas Beach Fest, Jl. Pantai Berawa No.88, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66632,
      "lng": 115.13215
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Atlas%20Beach%20Fest%20Jl.%20Pantai%20Berawa%20No.88%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.7,
    "reviewCount": 18410,
    "priceLevel": "$$$",
    "address": "Jl. Pantai Berawa No.88, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "10:00–00:00 daily",
    "knownFor": "Luxury entertainment compound with a vast beach bar",
    "tags": [
      "beach-club",
      "luxury",
      "party",
      "festivals"
    ],
    "isLandmark": true,
    "inBerawaCore": false,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "monsieur_spoon_berawa",
    "name": "Monsieur Spoon Berawa",
    "category": "bakery",
    "geocodeQuery": "Monsieur Spoon Berawa, Jl. Pantai Berawa No.51, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66201,
      "lng": 115.13948
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Monsieur%20Spoon%20Berawa%20Jl.%20Pantai%20Berawa%20No.51%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.5,
    "reviewCount": 2340,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.51, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "07:00–21:00 daily",
    "knownFor": "French bakery serving exceptional flaky croissants",
    "tags": [
      "pastries",
      "croissant",
      "breakfast",
      "french"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "braud_cafe",
    "name": "Braud Cafe",
    "category": "bakery",
    "geocodeQuery": "Braud Cafe, Jl. Subak Sari No.12, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66718,
      "lng": 115.14441
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Braud%20Cafe%20Jl.%20Subak%20Sari%20No.12%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 1890,
    "priceLevel": "$$",
    "address": "Jl. Subak Sari No.12, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Subak Sari",
    "typicalHours": "08:00–17:00 daily",
    "knownFor": "Artisanal sourdough micro-bakery and specialty breakfast",
    "tags": [
      "sourdough",
      "bakery",
      "specialty-coffee",
      "brunch"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "bakersfield_berawa",
    "name": "Bakersfield Berawa",
    "category": "bakery",
    "geocodeQuery": "Bakersfield Berawa, Jl. Raya Semat No.2, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66072,
      "lng": 115.14185
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Bakersfield%20Berawa%20Jl.%20Raya%20Semat%20No.2%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.6,
    "reviewCount": 580,
    "priceLevel": "$$",
    "address": "Jl. Raya Semat No.2, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Raya Semat",
    "typicalHours": "07:00–22:00 daily",
    "knownFor": "Local bakery with fresh bread, donuts, and coffee",
    "tags": [
      "bakery",
      "donuts",
      "pastries",
      "coffee"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "frestive_berawa",
    "name": "Frestive Berawa",
    "category": "grocery",
    "geocodeQuery": "Frestive Berawa, Jl. Pantai Berawa No.12, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66048,
      "lng": 115.14145
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Frestive%20Berawa%20Jl.%20Pantai%20Berawa%20No.12%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.5,
    "reviewCount": 1510,
    "priceLevel": "$$",
    "address": "Jl. Pantai Berawa No.12, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa",
    "typicalHours": "07:00–23:00 daily",
    "knownFor": "Supermarket focused on imported ingredients and produce",
    "tags": [
      "supermarket",
      "groceries",
      "imported-goods",
      "fresh"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "popular_deli_berawa",
    "name": "Popular Deli Berawa",
    "category": "grocery",
    "geocodeQuery": "Popular Deli Berawa, Jl. Raya Semat, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.65882,
      "lng": 115.14285
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Popular%20Deli%20Berawa%20Jl.%20Raya%20Semat%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.5,
    "reviewCount": 1140,
    "priceLevel": "$$",
    "address": "Jl. Raya Semat, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Raya Semat",
    "typicalHours": "07:00–23:00 daily",
    "knownFor": "Upscale grocery with prime meat cuts and fine selections",
    "tags": [
      "deli",
      "grocery",
      "imported-goods",
      "wine"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "tropical_nomad_coworking_space",
    "name": "Tropical Nomad Coworking Space",
    "category": "coworking",
    "geocodeQuery": "Tropical Nomad Coworking Space, Jl. Subak Canggu No.2, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.65988,
      "lng": 115.13388
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Tropical%20Nomad%20Coworking%20Space%20Jl.%20Subak%20Canggu%20No.2%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.7,
    "reviewCount": 1120,
    "priceLevel": "$$",
    "address": "Jl. Subak Canggu No.2, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Subak Canggu",
    "typicalHours": "24/7 for members",
    "knownFor": "Open-plan workspace tailored for digital nomads",
    "tags": [
      "coworking",
      "digital-nomad",
      "office-space",
      "wifi"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "id": "outpost_canggu_coworking",
    "name": "Outpost Canggu Coworking",
    "category": "coworking",
    "geocodeQuery": "Outpost Canggu Coworking, Jl. Raya Semat No.1, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "estimatedCoord": {
      "lat": -8.66211,
      "lng": 115.14212
    },
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Outpost%20Canggu%20Coworking%20Jl.%20Raya%20Semat%20No.1%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": 4.5,
    "reviewCount": 590,
    "priceLevel": "$$",
    "address": "Jl. Raya Semat No.1, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Raya Semat",
    "typicalHours": "08:00–00:00 daily",
    "knownFor": "Dynamic workspace with quiet indoor and terrace desks",
    "tags": [
      "coworking",
      "digital-nomad",
      "air-conditioned",
      "community"
    ],
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": false,
    "source": "gemini_maps_estimate",
    "verificationStatus": "needs_verification",
    "verifiedAt": "2026-06-21"
  },
  {
    "estimatedCoord": null,
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=FINNS%20Recreation%20Club%20Jl.%20Pantai%20Berawa%20No.15%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali%2080361",
    "rating": null,
    "reviewCount": null,
    "isLandmark": true,
    "inBerawaCore": true,
    "questCritical": true,
    "source": "game_anchor",
    "verificationStatus": "needs_verification",
    "verifiedAt": null,
    "tags": [
      "sports",
      "fitness",
      "waterpark",
      "family"
    ],
    "priceLevel": "$$$",
    "typicalHours": "06:00–22:00 daily",
    "knownFor": "Sports and recreation hub with waterpark and dining",
    "id": "finns_recreation_club",
    "name": "FINNS Recreation Club",
    "category": "restaurant",
    "geocodeQuery": "FINNS Recreation Club, Jl. Pantai Berawa No.15, Tibubeneng, Kuta Utara, Badung, Bali 80361",
    "address": "Jl. Pantai Berawa No.15, Tibubeneng, Kuta Utara, Badung Regency, Bali 80361",
    "street": "Jl. Pantai Berawa"
  },
  {
    "estimatedCoord": null,
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Canggu%20Station%20Jl.%20Raya%20Semat%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali",
    "rating": null,
    "reviewCount": null,
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": true,
    "source": "game_anchor",
    "verificationStatus": "needs_verification",
    "verifiedAt": null,
    "tags": [
      "grocery",
      "food-court",
      "errands"
    ],
    "priceLevel": "$$",
    "typicalHours": "07:00–23:00 daily",
    "knownFor": "Grocery and food hub (Ibu Sari restock quest)",
    "id": "canggu_station",
    "name": "Canggu Station",
    "category": "grocery",
    "geocodeQuery": "Canggu Station, Jl. Raya Semat, Tibubeneng, Kuta Utara, Badung, Bali",
    "address": "Jl. Raya Semat, Tibubeneng, Kuta Utara, Badung Regency, Bali",
    "street": "Jl. Raya Semat"
  },
  {
    "estimatedCoord": null,
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=BAKED.%20Berawa%20Jl.%20Pantai%20Berawa%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali",
    "rating": null,
    "reviewCount": null,
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": true,
    "source": "game_anchor",
    "verificationStatus": "needs_verification",
    "verifiedAt": null,
    "tags": [
      "bakery",
      "croissant",
      "coffee"
    ],
    "priceLevel": "$$",
    "typicalHours": "07:00–21:00 daily",
    "knownFor": "Bakery for Kadek's croissant run quest",
    "id": "baked_berawa",
    "name": "BAKED. Berawa",
    "category": "bakery",
    "geocodeQuery": "BAKED. Berawa, Jl. Pantai Berawa, Tibubeneng, Kuta Utara, Badung, Bali",
    "address": "Jl. Pantai Berawa, Tibubeneng, Kuta Utara, Badung Regency, Bali",
    "street": "Jl. Pantai Berawa"
  },
  {
    "estimatedCoord": null,
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Satu-Satu%20Coffee%20Company%20Berawa%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali",
    "rating": null,
    "reviewCount": null,
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": true,
    "source": "game_anchor",
    "verificationStatus": "needs_verification",
    "verifiedAt": null,
    "tags": [
      "coffee",
      "beans",
      "pastries"
    ],
    "priceLevel": "$$",
    "typicalHours": "07:00–18:00 daily",
    "knownFor": "Coffee stop with beans and pastries",
    "id": "satu_satu_coffee_company",
    "name": "Satu-Satu Coffee Company",
    "category": "coffee",
    "geocodeQuery": "Satu-Satu Coffee Company, Berawa, Tibubeneng, Kuta Utara, Badung, Bali",
    "address": "Berawa, Tibubeneng, Kuta Utara, Badung Regency, Bali",
    "street": "Jl. Pantai Berawa"
  },
  {
    "estimatedCoord": null,
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Bungalow%20Living%20Bali%20Jl.%20Pantai%20Berawa%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali",
    "rating": null,
    "reviewCount": null,
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": true,
    "source": "game_anchor",
    "verificationStatus": "needs_verification",
    "verifiedAt": null,
    "tags": [
      "homeware",
      "lifestyle",
      "cafe"
    ],
    "priceLevel": "$$",
    "typicalHours": "08:00–20:00 daily",
    "knownFor": "Homewares and sarongs (Made the stylist)",
    "id": "bungalow_living_bali",
    "name": "Bungalow Living Bali",
    "category": "shop",
    "geocodeQuery": "Bungalow Living Bali, Jl. Pantai Berawa, Tibubeneng, Kuta Utara, Badung, Bali",
    "address": "Jl. Pantai Berawa, Tibubeneng, Kuta Utara, Badung Regency, Bali",
    "street": "Jl. Pantai Berawa"
  },
  {
    "estimatedCoord": null,
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Bali%20Family%20Rental%20Scooter%20Berawa%2C%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali",
    "rating": null,
    "reviewCount": null,
    "isLandmark": false,
    "inBerawaCore": true,
    "questCritical": true,
    "source": "game_anchor",
    "verificationStatus": "needs_verification",
    "verifiedAt": null,
    "tags": [
      "scooter",
      "rental",
      "mobility"
    ],
    "priceLevel": "$",
    "typicalHours": "08:00–20:00 daily",
    "knownFor": "Scooter rental that opens the map up",
    "id": "bali_family_rental_scooter",
    "name": "Bali Family Rental Scooter",
    "category": "shop",
    "geocodeQuery": "Bali Family Rental Scooter, Berawa, Tibubeneng, Kuta Utara, Badung, Bali",
    "address": "Berawa, Tibubeneng, Kuta Utara, Badung Regency, Bali",
    "street": "Jl. Pantai Berawa"
  },
  {
    "estimatedCoord": null,
    "mapsSearchLink": "https://www.google.com/maps/search/?api=1&query=Berawa%20Beach%20Tibubeneng%2C%20Kuta%20Utara%2C%20Badung%20Regency%2C%20Bali",
    "rating": null,
    "reviewCount": null,
    "isLandmark": true,
    "inBerawaCore": true,
    "questCritical": true,
    "source": "game_anchor",
    "verificationStatus": "needs_verification",
    "verifiedAt": null,
    "tags": [
      "beach",
      "surf",
      "sunset"
    ],
    "priceLevel": null,
    "typicalHours": "Open 24 hours",
    "knownFor": "Beach pickups, surf, and sunset activities",
    "id": "berawa_beach",
    "name": "Berawa Beach",
    "category": "beach",
    "geocodeQuery": "Berawa Beach, Tibubeneng, Kuta Utara, Badung, Bali",
    "address": "Tibubeneng, Kuta Utara, Badung Regency, Bali",
    "street": "Jl. Pantai Berawa"
  }
];