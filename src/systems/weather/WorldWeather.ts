export const WEATHER_KINDS = ["clear", "rain", "storm"] as const;
export type WeatherKind = (typeof WEATHER_KINDS)[number];
export type WeatherSource = "scene" | "delivery";

export interface WorldWeatherState {
  kind: WeatherKind;
  source: WeatherSource | null;
  revision: number;
}

export interface WeatherUpdateResult {
  thunder: boolean;
}

const MIN_THUNDER_GAP_MS = 5_500;
const THUNDER_VARIANCE_MS = 8_000;

export class WorldWeatherController {
  readonly state: WorldWeatherState = {
    kind: "clear",
    source: null,
    revision: 0
  };

  private thunderInMs = MIN_THUNDER_GAP_MS;

  start(kind: Exclude<WeatherKind, "clear">, source: WeatherSource = "scene"): boolean {
    if (this.state.kind === kind && this.state.source === source) {
      return false;
    }
    this.state.kind = kind;
    this.state.source = source;
    this.state.revision += 1;
    this.thunderInMs = MIN_THUNDER_GAP_MS;
    return true;
  }

  stop(source?: WeatherSource): boolean {
    if (this.state.kind === "clear" || (source && this.state.source !== source)) {
      return false;
    }
    this.state.kind = "clear";
    this.state.source = null;
    this.state.revision += 1;
    this.thunderInMs = MIN_THUNDER_GAP_MS;
    return true;
  }

  /** Delivery rain can seed weather, but never overrides an authored scene storm. */
  syncDeliveryCondition(conditionId?: string): boolean {
    const requestsRain = Boolean(conditionId?.includes("rain"));
    if (this.state.source === "scene") {
      return false;
    }
    if (requestsRain) {
      return this.start("rain", "delivery");
    }
    return this.stop("delivery");
  }

  update(deltaMs: number, random: () => number = Math.random): WeatherUpdateResult {
    if (this.state.kind !== "storm") {
      return { thunder: false };
    }
    this.thunderInMs -= Math.max(0, deltaMs);
    if (this.thunderInMs > 0) {
      return { thunder: false };
    }
    this.thunderInMs = MIN_THUNDER_GAP_MS + random() * THUNDER_VARIANCE_MS;
    return { thunder: true };
  }
}

export function isWeatherWet(weather: Pick<WorldWeatherState, "kind">): boolean {
  return weather.kind === "rain" || weather.kind === "storm";
}

export function isRideSurfaceSlick(weather: Pick<WorldWeatherState, "kind">): boolean {
  return isWeatherWet(weather);
}
