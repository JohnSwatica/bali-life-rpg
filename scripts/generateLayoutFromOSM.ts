import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { curatedVenues, shouldRender, type CuratedVenue } from "../src/data/curatedVenues";
import { venueDefinitions } from "../src/data/venues";

const M_PER_LAT = 110540;
const USER_AGENT = "BaliLifeRPGLayoutGenerator/0.1 (local offline map generation; https://localhost.invalid)";

interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

interface WorldSize {
  w: number;
  h: number;
}

interface AnchorConfig {
  id: string;
  query: string;
  venueId?: string;
  areaIds?: string[];
}

interface AreaSpec {
  id: string;
  name: string;
  anchorIds: string[];
  roadNames?: string[];
  radius: number;
  fallback: Point;
}

interface NeighborhoodConfig {
  id: string;
  world: WorldSize;
  pad: number;
  fallbackBbox: BBox;
  anchors: AnchorConfig[];
  areas: AreaSpec[];
  outputPath: string;
  cacheDir: string;
  geocodeCachePath: string;
  curatedGeocodeCachePath: string;
  curatedCoordsPath: string;
  overpassCachePath: string;
  reportPath: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  importance?: number;
}

interface AnchorCacheEntry {
  id: string;
  query: string;
  results: NominatimResult[];
}

interface CuratedGeocodeCacheEntry {
  id: string;
  query: string;
  results: NominatimResult[];
}

interface AnchorPoint {
  id: string;
  query: string;
  venueId?: string;
  areaIds?: string[];
  lat: number;
  lon: number;
  displayName: string;
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  nodes?: number[];
  geometry?: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  version?: number;
  generator?: string;
  elements: OverpassElement[];
}

interface Point {
  x: number;
  y: number;
}

interface RoadPoint extends Point {
  nodeId: number;
}

interface RoadNode extends Point {
  id: number;
  lat: number;
  lon: number;
}

interface RoadSegment {
  fromNodeId: number;
  toNodeId: number;
  wayId: number;
  name: string;
  kind: RoadKind;
}

type RoadKind = "main" | "lane" | "beach_path";
type RoadImportance = "primary" | "secondary" | "lane";

interface GeneratedRoad {
  id: string;
  name: string;
  width: number;
  importance: RoadImportance;
  points: Point[];
}

interface GeneratedArea {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
}

interface GeneratedVenueNode {
  venueId: string;
  x: number;
  y: number;
  radius: number;
  areaId: string;
}

interface GeneratedCuratedVenueNode extends GeneratedVenueNode {
  curatedVenueId: string;
  name: string;
  category: CuratedVenue["category"];
  isLandmark: boolean;
  questCritical: boolean;
  coordinateSource: CuratedCoordinateSource;
}

interface MatchedVenue {
  venueId: string;
  curatedVenueId?: string;
  source: "anchor" | "osm_poi" | "fallback" | CuratedCoordinateSource;
  sourceName: string;
  point: Point;
  areaId: string;
}

type CuratedCoordinateSource = "osm" | "nominatim" | "estimate" | "fallback";

interface LatLng {
  lat: number;
  lng: number;
}

interface PoiMatch {
  poi: OverpassElement;
  sourceName: string;
  score: number;
}

interface ResolvedCuratedVenue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  source: CuratedCoordinateSource;
  sourceName: string;
  matchedName?: string;
  gameVenueId: string;
  areaId: string;
  shouldRender: boolean;
  questCritical: boolean;
  isLandmark: boolean;
  category: CuratedVenue["category"];
  needsManualCheck: boolean;
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const CONFIG: NeighborhoodConfig = {
  id: "berawa",
  world: { w: 2400, h: 1700 },
  pad: 80,
  fallbackBbox: {
    south: -8.685,
    west: 115.125,
    north: -8.655,
    east: 115.145
  },
  anchors: [
    { id: "finns_beach_club", query: "FINNS Beach Club Berawa, Bali", areaIds: ["beach", "finns_area"] },
    { id: "finns_recreation_club", query: "FINNS Recreation Club Canggu, Bali", venueId: "finns_recreation_club", areaIds: ["finns_area"] },
    { id: "canggu_station", query: "Canggu Station Berawa, Bali", venueId: "canggu_station", areaIds: ["pantai_berawa", "cafe_cluster"] },
    { id: "milk_madu_berawa", query: "Milk & Madu Berawa, Bali", venueId: "milk_madu_berawa", areaIds: ["cafe_cluster"] },
    { id: "baked_berawa", query: "BAKED. Berawa, Bali", venueId: "baked_berawa", areaIds: ["nelayan", "cafe_cluster"] },
    { id: "bungalow_living", query: "Bungalow Living Bali Berawa", venueId: "bungalow_living", areaIds: ["tegal_sari", "cafe_cluster"] },
    { id: "berawa_beach", query: "Berawa Beach, Canggu, Bali", venueId: "berawa_beach", areaIds: ["beach"] },
    { id: "jl_pantai_berawa", query: "Jalan Pantai Berawa, Canggu, Bali", areaIds: ["pantai_berawa"] },
    { id: "jl_nelayan", query: "Jalan Nelayan, Canggu, Bali", areaIds: ["nelayan"] },
    { id: "jl_tegal_sari", query: "Jalan Tegal Sari, Canggu, Bali", areaIds: ["tegal_sari"] },
    { id: "satu_satu_coffee", query: "Satu-Satu Coffee Company Berawa, Bali", venueId: "satu_satu_coffee", areaIds: ["finns_area"] },
    { id: "nude_cafe_berawa", query: "Nude Cafe Berawa, Bali", venueId: "nude_cafe_berawa", areaIds: ["cafe_cluster"] },
    { id: "ulekan_berawa", query: "Ulekan Berawa, Bali", venueId: "ulekan_berawa", areaIds: ["cafe_cluster"] },
    { id: "mowies_berawa", query: "Mowies Berawa, Bali", venueId: "mowies_berawa", areaIds: ["beach"] },
    { id: "bali_family_rental_scooter", query: "Bali Family Rental Scooter Jalan Pantai Berawa Bali", venueId: "bali_family_rental_scooter", areaIds: ["pantai_berawa"] }
  ],
  areas: [
    { id: "nelayan", name: "Jl. Nelayan", anchorIds: ["jl_nelayan", "baked_berawa"], roadNames: ["Jalan Nelayan"], radius: 260, fallback: { x: 760, y: 390 } },
    { id: "pantai_berawa", name: "Jl. Pantai Berawa", anchorIds: ["jl_pantai_berawa", "canggu_station"], roadNames: ["Jalan Pantai Berawa"], radius: 300, fallback: { x: 920, y: 790 } },
    { id: "tegal_sari", name: "Jl. Tegal Sari", anchorIds: ["jl_tegal_sari", "bungalow_living"], roadNames: ["Jalan Tegal Sari"], radius: 280, fallback: { x: 1540, y: 790 } },
    { id: "finns_area", name: "FINNS / Canggu Club Area", anchorIds: ["finns_recreation_club", "finns_beach_club", "satu_satu_coffee"], radius: 280, fallback: { x: 1768, y: 300 } },
    { id: "beach", name: "Berawa Beach Direction", anchorIds: ["berawa_beach", "finns_beach_club", "mowies_berawa"], radius: 260, fallback: { x: 350, y: 1225 } },
    { id: "cafe_cluster", name: "Berawa Cafe Cluster", anchorIds: ["milk_madu_berawa", "canggu_station", "nude_cafe_berawa", "ulekan_berawa"], radius: 280, fallback: { x: 1190, y: 610 } }
  ],
  outputPath: path.join(repoRoot, "src/data/berawaLayout.ts"),
  cacheDir: path.join(repoRoot, "data/osm"),
  geocodeCachePath: path.join(repoRoot, "data/osm/berawa.anchors.json"),
  curatedGeocodeCachePath: path.join(repoRoot, "data/osm/berawa.curated-geocode.json"),
  curatedCoordsPath: path.join(repoRoot, "data/osm/berawa.curated-coords.json"),
  overpassCachePath: path.join(repoRoot, "data/osm/berawa.overpass.json"),
  reportPath: path.join(repoRoot, "data/osm/berawa.layout-report.json")
};

const CURATED_TO_GAME_VENUE_ID: Record<string, string> = {
  milk_and_madu_berawa: "milk_madu_berawa",
  nude: "nude_cafe_berawa",
  ulekan: "ulekan_berawa",
  satu_satu_coffee_company: "satu_satu_coffee",
  bungalow_living_bali: "bungalow_living"
};

async function main() {
  const refreshGeocode = process.argv.includes("--refresh-geocode") || process.argv.includes("--refresh");
  const refreshOsm = process.argv.includes("--refresh-osm") || process.argv.includes("--refresh");

  await mkdir(CONFIG.cacheDir, { recursive: true });
  const anchorCache = await loadOrFetchGeocode(CONFIG, refreshGeocode);
  const anchors = resolveAnchors(CONFIG, anchorCache);
  const bbox = chooseBBox(CONFIG.fallbackBbox, anchors);
  const overpass = await loadOrFetchOverpass(CONFIG, bbox, refreshOsm);
  const curatedGeocodeCache = await loadOrFetchCuratedGeocode(CONFIG, curatedVenues, overpass, refreshGeocode);
  const resolvedCuratedVenues = resolveCuratedVenueCoordinates(CONFIG, curatedVenues, overpass, curatedGeocodeCache);
  const projector = makeProjector(bbox, CONFIG.world, CONFIG.pad);
  const generated = generateLayout(CONFIG, bbox, projector, overpass, anchors, resolvedCuratedVenues);

  await writeFile(CONFIG.curatedCoordsPath, `${JSON.stringify(renderCuratedCoordinateFile(resolvedCuratedVenues), null, 2)}\n`, "utf8");
  await writeFile(CONFIG.outputPath, renderBerawaLayout(generated), "utf8");
  await writeFile(CONFIG.reportPath, `${JSON.stringify(generated.report, null, 2)}\n`, "utf8");

  console.log(`Generated ${path.relative(repoRoot, CONFIG.outputPath)}`);
  console.log(
    `Roads ${generated.roads.length}; nodes ${generated.report.roadNodeCount}; segments ${generated.report.roadSegmentCount}; POIs ${generated.report.osmPoiCount}`
  );
  console.log(
    `Venues matched ${generated.report.venues.matched}; fallback ${generated.report.venues.fallback}; bbox ${formatBBox(bbox)}`
  );
  const coordSummary = summarizeCuratedCoordinates(resolvedCuratedVenues);
  console.log(
    `Curated coords osm ${coordSummary.osm}; nominatim ${coordSummary.nominatim}; estimate ${coordSummary.estimate}; fallback ${coordSummary.fallback}`
  );
  if (generated.report.venues.unmatched.length > 0) {
    console.log(`Manual/fallback venue placement: ${generated.report.venues.unmatched.join(", ")}`);
  }
}

async function loadOrFetchGeocode(config: NeighborhoodConfig, refresh: boolean): Promise<AnchorCacheEntry[]> {
  if (!refresh && (await exists(config.geocodeCachePath))) {
    return readJson<AnchorCacheEntry[]>(config.geocodeCachePath);
  }

  const entries: AnchorCacheEntry[] = [];
  for (const anchor of config.anchors) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");
    url.searchParams.set("q", anchor.query);
    const results = await fetchJson<NominatimResult[]>(url.toString(), {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" }
    });
    entries.push({ id: anchor.id, query: anchor.query, results });
    await sleep(1100);
  }
  await writeFile(config.geocodeCachePath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
  return entries;
}

async function loadOrFetchCuratedGeocode(
  config: NeighborhoodConfig,
  venues: CuratedVenue[],
  overpass: OverpassResponse,
  refresh: boolean
): Promise<CuratedGeocodeCacheEntry[]> {
  const cached = !refresh && (await exists(config.curatedGeocodeCachePath)) ? await readJson<CuratedGeocodeCacheEntry[]>(config.curatedGeocodeCachePath) : [];
  const entriesById = new Map(cached.map((entry) => [entry.id, entry]));
  const poiIndex = buildPoiNameIndex(overpass.elements.filter(isPoiNode));
  let changed = false;

  for (const venue of venues) {
    const osmMatch = findPoiMatch(poiIndex, [venue.name, venue.geocodeQuery.split(",")[0]]);
    if (osmMatch || (!refresh && entriesById.has(venue.id))) {
      continue;
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");
    url.searchParams.set("q", venue.geocodeQuery);
    const results = await fetchJson<NominatimResult[]>(url.toString(), {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" }
    });
    entriesById.set(venue.id, { id: venue.id, query: venue.geocodeQuery, results });
    changed = true;
    await sleep(1100);
  }

  const entries = [...entriesById.values()].sort((a, b) => a.id.localeCompare(b.id));
  if (changed || refresh || !(await exists(config.curatedGeocodeCachePath))) {
    await writeFile(config.curatedGeocodeCachePath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
  }
  return entries;
}

async function loadOrFetchOverpass(config: NeighborhoodConfig, bbox: BBox, refresh: boolean): Promise<OverpassResponse> {
  if (!refresh && (await exists(config.overpassCachePath))) {
    return readJson<OverpassResponse>(config.overpassCachePath);
  }

  const query = overpassQuery(bbox);
  const body = new URLSearchParams({ data: query });
  const response = await fetchJson<OverpassResponse>("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Accept: "application/json"
    },
    body
  });
  await writeFile(config.overpassCachePath, `${JSON.stringify(response, null, 2)}\n`, "utf8");
  return response;
}

function overpassQuery(bbox: BBox): string {
  const b = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  return `[out:json][timeout:90];
(
  way["highway"](${b});
  node["amenity"~"^(cafe|restaurant|bar|pub|nightclub|fast_food|food_court)$"](${b});
  node["shop"](${b});
  node["leisure"](${b});
  node["tourism"](${b});
);
out geom;`;
}

function resolveAnchors(config: NeighborhoodConfig, cache: AnchorCacheEntry[]): AnchorPoint[] {
  const configById = new Map(config.anchors.map((anchor) => [anchor.id, anchor]));
  return cache.flatMap((entry): AnchorPoint[] => {
    const anchor = configById.get(entry.id);
    const result = entry.results[0];
    if (!anchor || !result) {
      return [];
    }
    return [
      {
        id: entry.id,
        query: entry.query,
        venueId: anchor.venueId,
        areaIds: anchor.areaIds,
        lat: Number(result.lat),
        lon: Number(result.lon),
        displayName: result.display_name
      }
    ];
  });
}

function chooseBBox(fallback: BBox, anchors: AnchorPoint[]): BBox {
  if (anchors.length < 7) {
    return fallback;
  }

  const raw = anchors.reduce(
    (bbox, anchor) => ({
      south: Math.min(bbox.south, anchor.lat),
      west: Math.min(bbox.west, anchor.lon),
      north: Math.max(bbox.north, anchor.lat),
      east: Math.max(bbox.east, anchor.lon)
    }),
    { south: Number.POSITIVE_INFINITY, west: Number.POSITIVE_INFINITY, north: Number.NEGATIVE_INFINITY, east: Number.NEGATIVE_INFINITY }
  );
  const padded = padBBox(raw, 0.14);
  const centerLat = (padded.south + padded.north) / 2;
  const centerLon = (padded.west + padded.east) / 2;
  const fallbackCenterLat = (fallback.south + fallback.north) / 2;
  const fallbackCenterLon = (fallback.west + fallback.east) / 2;
  const plausible =
    Math.abs(centerLat - fallbackCenterLat) < 0.05 &&
    Math.abs(centerLon - fallbackCenterLon) < 0.05 &&
    padded.north > padded.south &&
    padded.east > padded.west;
  return plausible ? padded : fallback;
}

function resolveCuratedVenueCoordinates(
  config: NeighborhoodConfig,
  venues: CuratedVenue[],
  overpass: OverpassResponse,
  geocodeCache: CuratedGeocodeCacheEntry[]
): ResolvedCuratedVenue[] {
  const poiIndex = buildPoiNameIndex(overpass.elements.filter(isPoiNode));
  const geocodeById = new Map(geocodeCache.map((entry) => [entry.id, entry]));
  const roadCentroids = buildRoadLatLngCentroids(overpass.elements.filter(isRoadWay));

  return venues.map((venue) => {
    const areaId = areaIdForCuratedVenue(venue);
    const gameVenueId = CURATED_TO_GAME_VENUE_ID[venue.id] ?? venue.id;
    const osmMatch = findPoiMatch(poiIndex, [venue.name, venue.geocodeQuery.split(",")[0]]);
    const base = {
      id: venue.id,
      name: venue.name,
      gameVenueId,
      areaId,
      shouldRender: shouldRender(venue),
      questCritical: venue.questCritical,
      isLandmark: venue.isLandmark,
      category: venue.category
    };

    if (osmMatch?.poi.lat != null && osmMatch.poi.lon != null) {
      return {
        ...base,
        lat: roundCoord(osmMatch.poi.lat),
        lng: roundCoord(osmMatch.poi.lon),
        source: "osm" as const,
        sourceName: `OSM node ${osmMatch.poi.id}`,
        matchedName: osmMatch.sourceName,
        needsManualCheck: false
      };
    }

    const geocode = selectNominatimResult(geocodeById.get(venue.id)?.results ?? [], config.fallbackBbox);
    if (geocode) {
      return {
        ...base,
        lat: roundCoord(Number(geocode.lat)),
        lng: roundCoord(Number(geocode.lon)),
        source: "nominatim" as const,
        sourceName: geocode.display_name,
        needsManualCheck: false
      };
    }

    if (venue.estimatedCoord) {
      return {
        ...base,
        lat: roundCoord(venue.estimatedCoord.lat),
        lng: roundCoord(venue.estimatedCoord.lng),
        source: "estimate" as const,
        sourceName: "unverified Gemini estimate",
        needsManualCheck: true
      };
    }

    const fallback = fallbackLatLngForVenue(config, venue, roadCentroids);
    return {
      ...base,
      lat: roundCoord(fallback.lat),
      lng: roundCoord(fallback.lng),
      source: "fallback" as const,
      sourceName: "deterministic street/area fallback",
      needsManualCheck: true
    };
  });
}

function renderCuratedCoordinateFile(resolved: ResolvedCuratedVenue[]) {
  return {
    generatedAt: "deterministic-from-cache",
    source: "OSM cached POIs first, then cached Nominatim, then flagged estimates/fallbacks",
    summary: summarizeCuratedCoordinates(resolved),
    manualCheckVenueIds: resolved.filter((venue) => venue.needsManualCheck).map((venue) => venue.id),
    venues: Object.fromEntries(
      resolved.map((venue) => [
        venue.id,
        {
          lat: venue.lat,
          lng: venue.lng,
          source: venue.source,
          name: venue.name,
          gameVenueId: venue.gameVenueId,
          areaId: venue.areaId,
          shouldRender: venue.shouldRender,
          questCritical: venue.questCritical,
          sourceName: venue.sourceName,
          matchedName: venue.matchedName,
          needsManualCheck: venue.needsManualCheck
        }
      ])
    )
  };
}

function summarizeCuratedCoordinates(resolved: ResolvedCuratedVenue[]) {
  return resolved.reduce(
    (summary, venue) => {
      summary.total += 1;
      summary.rendered += venue.shouldRender ? 1 : 0;
      summary.questCritical += venue.questCritical ? 1 : 0;
      summary[venue.source] += 1;
      return summary;
    },
    { total: 0, rendered: 0, questCritical: 0, osm: 0, nominatim: 0, estimate: 0, fallback: 0 }
  );
}

function padBBox(bbox: BBox, ratio: number): BBox {
  const latPad = (bbox.north - bbox.south) * ratio;
  const lonPad = (bbox.east - bbox.west) * ratio;
  return {
    south: bbox.south - latPad,
    west: bbox.west - lonPad,
    north: bbox.north + latPad,
    east: bbox.east + lonPad
  };
}

function makeProjector(bbox: BBox, world: WorldSize, pad = 80) {
  const lat0 = (bbox.south + bbox.north) / 2;
  const mPerLon = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const wM = (bbox.east - bbox.west) * mPerLon;
  const hM = (bbox.north - bbox.south) * M_PER_LAT;
  const usableW = world.w - 2 * pad;
  const usableH = world.h - 2 * pad;
  const scale = Math.min(usableW / wM, usableH / hM);
  const drawW = wM * scale;
  const drawH = hM * scale;
  const offX = pad + (usableW - drawW) / 2;
  const offY = pad + (usableH - drawH) / 2;
  return (lat: number, lon: number): Point => {
    const xm = (lon - bbox.west) * mPerLon;
    const ym = (lat - bbox.south) * M_PER_LAT;
    return {
      x: round(offX + xm * scale),
      y: round(offY + (drawH - ym * scale))
    };
  };
}

function generateLayout(
  config: NeighborhoodConfig,
  bbox: BBox,
  project: (lat: number, lon: number) => Point,
  overpass: OverpassResponse,
  anchors: AnchorPoint[],
  resolvedCuratedVenues: ResolvedCuratedVenue[]
) {
  const highways = overpass.elements.filter(isRoadWay);
  const nodeRefCounts = countWayNodeRefs(highways);
  const roadNodes = new Map<number, RoadNode>();
  const roadSegments: RoadSegment[] = [];
  const roads: GeneratedRoad[] = [];

  for (const way of highways) {
    const kind = highwayToKind(way.tags?.highway);
    if (!kind || !way.nodes || !way.geometry || way.geometry.length < 2) {
      continue;
    }
    const roadPoints: RoadPoint[] = way.geometry.map((coord, index) => {
      const nodeId = way.nodes?.[index] ?? Number(`${way.id}${index}`);
      const point = project(coord.lat, coord.lon);
      roadNodes.set(nodeId, { id: nodeId, lat: coord.lat, lon: coord.lon, ...point });
      return { nodeId, ...point };
    });

    for (let i = 0; i < roadPoints.length - 1; i += 1) {
      roadSegments.push({
        fromNodeId: roadPoints[i].nodeId,
        toNodeId: roadPoints[i + 1].nodeId,
        wayId: way.id,
        name: way.tags?.name ?? formatHighwayName(way.tags?.highway ?? "road"),
        kind
      });
    }

    const simplified = simplifyRoadPoints(roadPoints, nodeRefCounts, 5.5);
    if (simplified.length < 2) {
      continue;
    }
    roads.push({
      id: `osm_way_${way.id}`,
      name: way.tags?.name ?? formatHighwayName(way.tags?.highway ?? "Road"),
      width: widthForKind(kind, way.tags?.highway),
      importance: importanceForKind(kind),
      points: simplified.map(({ x, y }) => ({ x, y }))
    });
  }

  roads.sort(compareRoads);
  const pois = overpass.elements.filter(isPoiNode);
  const anchorById = new Map(anchors.map((anchor) => [anchor.id, anchor]));
  const roadCentroids = buildRoadCentroids(highways, project);
  const areas = buildAreas(config, anchorById, roadCentroids, project);
  const areaById = new Map(areas.map((area) => [area.id, area]));
  const venues = buildVenueNodes(config, anchorById, pois, project, areaById, resolvedCuratedVenues);
  const report = {
    generatedAt: "deterministic-from-cache",
    source: "OpenStreetMap via Nominatim and Overpass caches",
    bbox,
    world: config.world,
    pad: config.pad,
    roadWayCount: highways.length,
    roadNodeCount: roadNodes.size,
    roadSegmentCount: roadSegments.length,
    roadPathCount: roads.length,
    osmPoiCount: pois.length,
    orientation: orientationReport(anchorById, roadCentroids, project),
    curatedCoordinates: renderCuratedCoordinateFile(resolvedCuratedVenues).summary,
    venues: {
      matched: venues.matches.filter((match) => match.source !== "fallback").length,
      fallback: venues.matches.filter((match) => match.source === "fallback").length,
      unmatched: venues.matches.filter((match) => match.source === "fallback").map((match) => match.venueId),
      matches: venues.matches.map((match) => ({
        venueId: match.venueId,
        curatedVenueId: match.curatedVenueId,
        source: match.source,
        sourceName: match.sourceName,
        areaId: match.areaId,
        x: round(match.point.x),
        y: round(match.point.y)
      }))
    }
  };

  return { roads, areas, venueNodes: venues.nodes, curatedVenueNodes: venues.curatedNodes, report };
}

function buildAreas(
  config: NeighborhoodConfig,
  anchorById: Map<string, AnchorPoint>,
  roadCentroids: Map<string, Point>,
  project: (lat: number, lon: number) => Point
): GeneratedArea[] {
  return config.areas.map((area) => {
    const anchorPoints = area.anchorIds
      .map((id) => anchorById.get(id))
      .filter((anchor): anchor is AnchorPoint => Boolean(anchor))
      .map((anchor) => project(anchor.lat, anchor.lon));
    const roadPoints =
      area.roadNames?.map((name) => roadCentroids.get(normalizeName(name))).filter((point): point is Point => Boolean(point)) ?? [];
    const points = [...roadPoints, ...anchorPoints];
    const point = points.length > 0 ? averagePoint(points) : area.fallback;
    return {
      id: area.id,
      name: area.name,
      x: round(point.x),
      y: round(point.y),
      radius: area.radius
    };
  });
}

function buildVenueNodes(
  config: NeighborhoodConfig,
  anchorById: Map<string, AnchorPoint>,
  pois: OverpassElement[],
  project: (lat: number, lon: number) => Point,
  areaById: Map<string, GeneratedArea>,
  resolvedCuratedVenues: ResolvedCuratedVenue[]
): { nodes: GeneratedVenueNode[]; curatedNodes: GeneratedCuratedVenueNode[]; matches: MatchedVenue[] } {
  const poiIndex = buildPoiNameIndex(pois);

  const anchorByVenue = new Map<string, AnchorPoint>();
  for (const anchor of anchorById.values()) {
    if (anchor.venueId) {
      anchorByVenue.set(anchor.venueId, anchor);
    }
  }

  const matches: MatchedVenue[] = [];
  const nodes: GeneratedVenueNode[] = [];
  const curatedNodes: GeneratedCuratedVenueNode[] = [];
  const representedVenueIds = new Set<string>();

  for (const venue of resolvedCuratedVenues.filter((candidate) => candidate.shouldRender)) {
    const point = project(venue.lat, venue.lng);
    const radius = venue.id === "berawa_beach" ? 250 : venue.isLandmark ? 230 : venue.questCritical ? 190 : 145;
    const node = {
      venueId: venue.gameVenueId,
      x: round(point.x),
      y: round(point.y),
      radius,
      areaId: venue.areaId
    };
    nodes.push(node);
    curatedNodes.push({
      ...node,
      curatedVenueId: venue.id,
      name: venue.name,
      category: venue.category,
      isLandmark: venue.isLandmark,
      questCritical: venue.questCritical,
      coordinateSource: venue.source
    });
    representedVenueIds.add(venue.gameVenueId);
    matches.push({
      venueId: venue.gameVenueId,
      curatedVenueId: venue.id,
      source: venue.source,
      sourceName: venue.sourceName,
      point,
      areaId: venue.areaId
    });
  }

  const venueIds = Object.keys(venueDefinitions)
    .filter((venueId) => !representedVenueIds.has(venueId))
    .sort();
  for (const venueId of venueIds) {
    const venue = venueDefinitions[venueId];
    const anchor = anchorByVenue.get(venueId);
    const preferredArea = firstAreaForVenue(config, venueId);
    let match: MatchedVenue | undefined;

    if (anchor) {
      match = {
        venueId,
        source: "anchor",
        sourceName: anchor.displayName,
        point: project(anchor.lat, anchor.lon),
        areaId: preferredArea
      };
    }

    if (!match) {
      const poiMatch = findPoiMatch(poiIndex, [venue.name, venue.realWorldRef?.mapName ?? venue.name]);
      const poi = poiMatch?.poi;
      if (poi?.lat && poi.lon) {
        match = {
          venueId,
          source: "osm_poi",
          sourceName: poi.tags?.name ?? poiMatch.sourceName,
          point: project(poi.lat, poi.lon),
          areaId: preferredArea
        };
      }
    }

    if (!match) {
      const area = areaById.get(preferredArea);
      const point = area ? offsetPoint(area, venueId) : { x: 1200, y: 850 };
      match = {
        venueId,
        source: "fallback",
        sourceName: "manual fallback near generated area",
        point,
        areaId: preferredArea
      };
    }

    matches.push(match);
    nodes.push({
      venueId,
      x: round(match.point.x),
      y: round(match.point.y),
      radius: venueId === "berawa_beach" ? 240 : venueId === "finns_recreation_club" ? 220 : 170,
      areaId: match.areaId
    });
  }

  nodes.sort((a, b) => a.venueId.localeCompare(b.venueId));
  curatedNodes.sort((a, b) => a.curatedVenueId.localeCompare(b.curatedVenueId));
  return { nodes, curatedNodes, matches };
}

function firstAreaForVenue(config: NeighborhoodConfig, venueId: string): string {
  const anchor = config.anchors.find((candidate) => candidate.venueId === venueId);
  return anchor?.areaIds?.[0] ?? "pantai_berawa";
}

function buildPoiNameIndex(pois: OverpassElement[]): Array<{ normalized: string; poi: OverpassElement; sourceName: string }> {
  return pois
    .map((poi) => {
      const sourceName = poi.tags?.name ?? "";
      return { normalized: normalizeName(sourceName), poi, sourceName };
    })
    .filter((entry) => entry.normalized.length >= 4)
    .sort((a, b) => a.normalized.localeCompare(b.normalized) || a.poi.id - b.poi.id);
}

function findPoiMatch(index: Array<{ normalized: string; poi: OverpassElement; sourceName: string }>, names: string[]): PoiMatch | undefined {
  const normalized = names.map(normalizeName).filter((name) => name.length >= 4);
  let best: PoiMatch | undefined;

  for (const name of normalized) {
    for (const entry of index) {
      const score = poiNameScore(name, entry.normalized);
      if (score <= 0) {
        continue;
      }
      if (!best || score > best.score || (score === best.score && entry.sourceName.localeCompare(best.sourceName) < 0)) {
        best = { poi: entry.poi, sourceName: entry.sourceName, score };
      }
    }
  }

  return best && best.score >= 0.72 ? best : undefined;
}

function poiNameScore(target: string, candidate: string): number {
  const targetTokens = new Set(target.split(" ").filter((token) => token.length >= 3));
  const candidateTokens = new Set(candidate.split(" ").filter((token) => token.length >= 3));
  if (targetTokens.size === 0 || candidateTokens.size === 0) {
    return 0;
  }
  let shared = 0;
  for (const token of targetTokens) {
    if (candidateTokens.has(token)) {
      shared += 1;
    }
  }

  if (target === candidate) {
    return 1;
  }
  if (candidate.includes(target) || target.includes(candidate)) {
    if (targetTokens.size === 1 && shared === 1) {
      return 0.86;
    }
    if (targetTokens.size > 1 && shared >= 2) {
      return 0.9;
    }
    return 0;
  }
  return shared / Math.max(targetTokens.size, candidateTokens.size);
}

function isRoadWay(element: OverpassElement): boolean {
  return element.type === "way" && Boolean(element.tags?.highway) && Array.isArray(element.geometry);
}

function isPoiNode(element: OverpassElement): boolean {
  return element.type === "node" && typeof element.lat === "number" && typeof element.lon === "number" && Boolean(element.tags?.name);
}

function countWayNodeRefs(ways: OverpassElement[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const way of ways) {
    for (const nodeId of way.nodes ?? []) {
      counts.set(nodeId, (counts.get(nodeId) ?? 0) + 1);
    }
  }
  return counts;
}

function buildRoadCentroids(ways: OverpassElement[], project: (lat: number, lon: number) => Point): Map<string, Point> {
  const grouped = new Map<string, Point[]>();
  for (const way of ways) {
    const name = way.tags?.name;
    if (!name || !way.geometry) {
      continue;
    }
    const normalized = normalizeName(name);
    const points = grouped.get(normalized) ?? [];
    points.push(...way.geometry.map((coord) => project(coord.lat, coord.lon)));
    grouped.set(normalized, points);
  }
  return new Map([...grouped].map(([name, points]) => [name, averagePoint(points)]));
}

function buildRoadLatLngCentroids(ways: OverpassElement[]): Map<string, LatLng> {
  const grouped = new Map<string, LatLng[]>();
  for (const way of ways) {
    const name = way.tags?.name;
    if (!name || !way.geometry) {
      continue;
    }
    const normalized = normalizeName(name);
    const points = grouped.get(normalized) ?? [];
    points.push(...way.geometry.map((coord) => ({ lat: coord.lat, lng: coord.lon })));
    grouped.set(normalized, points);
  }
  return new Map(
    [...grouped].map(([name, points]) => [
      name,
      {
        lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
        lng: points.reduce((sum, point) => sum + point.lng, 0) / points.length
      }
    ])
  );
}

function selectNominatimResult(results: NominatimResult[], expectedBbox: BBox): NominatimResult | undefined {
  return (
    results.find((result) => {
      const lat = Number(result.lat);
      const lng = Number(result.lon);
      return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= expectedBbox.south - 0.04 &&
        lat <= expectedBbox.north + 0.04 &&
        lng >= expectedBbox.west - 0.04 &&
        lng <= expectedBbox.east + 0.04
      );
    }) ?? results[0]
  );
}

function areaIdForCuratedVenue(venue: CuratedVenue): string {
  const street = normalizeName(venue.street ?? venue.address ?? venue.geocodeQuery);
  const idAndName = normalizeName(`${venue.id} ${venue.name}`);
  if (venue.category === "beach" || idAndName.includes("beach")) {
    return "beach";
  }
  if (venue.category === "beach_club" || idAndName.includes("finns") || idAndName.includes("atlas")) {
    return "beach";
  }
  if (street.includes("tegal sari")) {
    return "tegal_sari";
  }
  if (street.includes("nelayan")) {
    return "nelayan";
  }
  if (street.includes("semat") || street.includes("subak")) {
    return "cafe_cluster";
  }
  return "pantai_berawa";
}

function fallbackLatLngForVenue(config: NeighborhoodConfig, venue: CuratedVenue, roadCentroids: Map<string, LatLng>): LatLng {
  const roadPoint = venue.street ? roadCentroids.get(normalizeName(venue.street)) : undefined;
  const areaPoint = areaLatLngFallback(config, areaIdForCuratedVenue(venue));
  const base = roadPoint ?? areaPoint;
  return offsetLatLng(base, venue.id);
}

function areaLatLngFallback(config: NeighborhoodConfig, areaId: string): LatLng {
  const bbox = config.fallbackBbox;
  const points: Record<string, LatLng> = {
    beach: { lat: bbox.south + (bbox.north - bbox.south) * 0.18, lng: bbox.west + (bbox.east - bbox.west) * 0.18 },
    finns_area: { lat: bbox.south + (bbox.north - bbox.south) * 0.32, lng: bbox.west + (bbox.east - bbox.west) * 0.4 },
    pantai_berawa: { lat: bbox.south + (bbox.north - bbox.south) * 0.58, lng: bbox.west + (bbox.east - bbox.west) * 0.55 },
    cafe_cluster: { lat: bbox.south + (bbox.north - bbox.south) * 0.68, lng: bbox.west + (bbox.east - bbox.west) * 0.72 },
    nelayan: { lat: bbox.south + (bbox.north - bbox.south) * 0.82, lng: bbox.west + (bbox.east - bbox.west) * 0.42 },
    tegal_sari: { lat: bbox.south + (bbox.north - bbox.south) * 0.52, lng: bbox.west + (bbox.east - bbox.west) * 0.82 }
  };
  return points[areaId] ?? {
    lat: (bbox.south + bbox.north) / 2,
    lng: (bbox.west + bbox.east) / 2
  };
}

function offsetLatLng(point: LatLng, seed: string): LatLng {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const lat0 = point.lat;
  const mPerLon = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const angle = ((hash % 360) * Math.PI) / 180;
  const distanceM = 28 + (hash % 44);
  return {
    lat: point.lat + (Math.sin(angle) * distanceM) / M_PER_LAT,
    lng: point.lng + (Math.cos(angle) * distanceM) / mPerLon
  };
}

function highwayToKind(highway: string | undefined): RoadKind | null {
  if (!highway) {
    return null;
  }
  if (/^(primary|secondary|tertiary)(_link)?$/.test(highway)) {
    return "main";
  }
  if (/^(residential|unclassified|living_street|service)$/.test(highway)) {
    return "lane";
  }
  if (/^(footway|path|track|cycleway|pedestrian|steps)$/.test(highway)) {
    return "beach_path";
  }
  return null;
}

function importanceForKind(kind: RoadKind): RoadImportance {
  if (kind === "main") return "primary";
  if (kind === "lane") return "secondary";
  return "lane";
}

function widthForKind(kind: RoadKind, highway: string | undefined): number {
  if (kind === "main") return highway?.includes("primary") ? 56 : 48;
  if (kind === "lane") return highway === "service" ? 24 : 32;
  return 18;
}

function simplifyRoadPoints(points: RoadPoint[], refCounts: Map<number, number>, tolerance: number): RoadPoint[] {
  if (points.length <= 2) {
    return points;
  }
  const fixed = new Set<number>([0, points.length - 1]);
  points.forEach((point, index) => {
    if ((refCounts.get(point.nodeId) ?? 0) > 1) {
      fixed.add(index);
    }
  });
  const fixedIndices = [...fixed].sort((a, b) => a - b);
  const output: RoadPoint[] = [];
  for (let i = 0; i < fixedIndices.length - 1; i += 1) {
    const start = fixedIndices[i];
    const end = fixedIndices[i + 1];
    const chunk = points.slice(start, end + 1);
    const simplified = douglasPeucker(chunk, tolerance);
    if (output.length > 0) {
      output.pop();
    }
    output.push(...simplified);
  }
  return output;
}

function douglasPeucker<T extends Point>(points: T[], tolerance: number): T[] {
  if (points.length <= 2) {
    return points;
  }
  let maxDistance = 0;
  let splitIndex = 0;
  const start = points[0];
  const end = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = perpendicularDistance(points[i], start, end);
    if (distance > maxDistance) {
      maxDistance = distance;
      splitIndex = i;
    }
  }
  if (maxDistance <= tolerance) {
    return [start, end];
  }
  return [...douglasPeucker(points.slice(0, splitIndex + 1), tolerance).slice(0, -1), ...douglasPeucker(points.slice(splitIndex), tolerance)];
}

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
  }
  return Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / Math.hypot(dx, dy);
}

function compareRoads(a: GeneratedRoad, b: GeneratedRoad): number {
  const order: Record<RoadImportance, number> = { lane: 0, secondary: 1, primary: 2 };
  return order[a.importance] - order[b.importance] || a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
}

function orientationReport(anchorById: Map<string, AnchorPoint>, roadCentroids: Map<string, Point>, project: (lat: number, lon: number) => Point) {
  const point = (id: string) => {
    const anchor = anchorById.get(id);
    return anchor ? project(anchor.lat, anchor.lon) : null;
  };
  const beach = point("berawa_beach") ?? point("finns_beach_club");
  const nelayan = roadCentroids.get(normalizeName("Jalan Nelayan")) ?? point("jl_nelayan");
  const tegalSari = roadCentroids.get(normalizeName("Jalan Tegal Sari")) ?? point("jl_tegal_sari");
  const finns = point("finns_beach_club") ?? point("finns_recreation_club");
  return {
    beach,
    nelayan,
    tegalSari,
    finns,
    sanity:
      beach && nelayan && tegalSari
        ? {
            beachLowerThanNelayan: beach.y > nelayan.y,
            beachLeftOfTegalSari: beach.x < tegalSari.x,
            tegalSariRightOfBeach: tegalSari.x > beach.x
          }
        : "missing anchor point"
  };
}

function renderBerawaLayout(generated: {
  roads: GeneratedRoad[];
  areas: GeneratedArea[];
  venueNodes: GeneratedVenueNode[];
  curatedVenueNodes: GeneratedCuratedVenueNode[];
  report: unknown;
}): string {
  return `/* AUTO-GENERATED by scripts/generateLayoutFromOSM.ts. Do not hand-edit coordinates.
 * Source: OpenStreetMap contributors via cached data/osm/berawa.overpass.json.
 */

export interface RoadPathDefinition {
  id: string;
  name: string;
  width: number;
  points: Array<{ x: number; y: number }>;
  importance: "primary" | "secondary" | "lane";
}

export interface MapAreaDefinition {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  debugOnly?: boolean;
}

export interface VenueMapNode {
  venueId: string;
  x: number;
  y: number;
  radius: number;
  areaId: string;
}

export interface CuratedVenueMapNode extends VenueMapNode {
  curatedVenueId: string;
  name: string;
  category: string;
  isLandmark: boolean;
  questCritical: boolean;
  coordinateSource: string;
}

export const osmLayoutMetadata = ${toTs(generated.report)} as const;

export const berawaRoads: RoadPathDefinition[] = ${toTs(generated.roads)};

export const berawaAreas: MapAreaDefinition[] = ${toTs(generated.areas)};

export const venueMapNodes: VenueMapNode[] = ${toTs(generated.venueNodes)};

export const curatedVenueNodes: CuratedVenueMapNode[] = ${toTs(generated.curatedVenueNodes)};
`;
}

function toTs(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/^(\s*)"([A-Za-z_][A-Za-z0-9_]*)":/gm, "$1$2:");
}

function averagePoint(points: Point[]): Point {
  return {
    x: round(points.reduce((sum, point) => sum + point.x, 0) / points.length),
    y: round(points.reduce((sum, point) => sum + point.y, 0) / points.length)
  };
}

function offsetPoint(point: Point, seed: string): Point {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const angle = ((hash % 360) * Math.PI) / 180;
  const distance = 72 + (hash % 50);
  return {
    x: round(point.x + Math.cos(angle) * distance),
    y: round(point.y + Math.sin(angle) * distance)
  };
}

function normalizeName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(bali|berawa|canggu|company|co|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatHighwayName(highway: string): string {
  return highway.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatBBox(bbox: BBox): string {
  return `${bbox.south.toFixed(6)},${bbox.west.toFixed(6)},${bbox.north.toFixed(6)},${bbox.east.toFixed(6)}`;
}

function round(value: number): number {
  return Math.round(value);
}

function roundCoord(value: number): number {
  return Number(value.toFixed(7));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} ${response.statusText}: ${url}`);
  }
  return (await response.json()) as T;
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
