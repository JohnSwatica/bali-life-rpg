import type { WarungDishId, WarungRushOrder, WarungRushState } from "../../types";
import { WARUNG_RUSH_FEEL_TUNING } from "../../tuning/FeelTuning";

const TABLE_IDS = ["left", "right", "counter"] as const;
const DISHES: WarungDishId[] = ["nasi_campur", "mie_goreng", "es_teh"];

export const WARUNG_DISH_LABELS: Record<WarungDishId, string> = {
  nasi_campur: "Nasi campur",
  mie_goreng: "Mie goreng",
  es_teh: "Es teh"
};

export function getWarungRushDifficulty(totalPlays: number): number {
  return Math.min(WARUNG_RUSH_FEEL_TUNING.maxSimultaneousOrders, 2 + Math.floor(Math.max(0, totalPlays) / WARUNG_RUSH_FEEL_TUNING.playsPerDifficultyStep));
}

export function createWarungRushState(totalPlays: number): WarungRushState {
  const maxSimultaneousOrders = getWarungRushDifficulty(totalPlays);
  return {
    elapsedMs: 0,
    nextOrderAtMs: 0,
    maxSimultaneousOrders,
    servedCount: 0,
    expiredCount: 0,
    orders: [createOrder(0, 0)]
  };
}

export function updateWarungRush(state: WarungRushState, deltaMs: number): WarungRushState {
  const elapsedMs = state.elapsedMs + Math.max(0, deltaMs);
  const orders = state.orders.map((order) => order.status === "waiting"
    ? { ...order, patienceMs: Math.max(0, order.patienceMs - Math.max(0, deltaMs)), status: order.patienceMs <= deltaMs ? "expired" as const : "waiting" as const }
    : order);
  const expiredCount = orders.filter((order) => order.status === "expired").length;
  const activeCount = orders.filter((order) => order.status === "waiting").length;
  if (elapsedMs >= state.nextOrderAtMs && activeCount < state.maxSimultaneousOrders) {
    orders.push(createOrder(orders.length, elapsedMs));
    return { ...state, elapsedMs, nextOrderAtMs: elapsedMs + WARUNG_RUSH_FEEL_TUNING.orderIntervalMs, expiredCount, orders };
  }
  return { ...state, elapsedMs, expiredCount, orders };
}

export function pickUpWarungDish(state: WarungRushState): WarungRushState {
  if (state.heldDishId) return state;
  const order = state.orders.filter((candidate) => candidate.status === "waiting").sort((a, b) => a.patienceMs - b.patienceMs)[0];
  return order ? { ...state, heldDishId: order.dishId } : state;
}

export function serveWarungOrder(state: WarungRushState, tableId: string): { state: WarungRushState; served: boolean; message: string } {
  if (!state.heldDishId) return { state, served: false, message: "Pick up a dish at Ibu's counter first." };
  const order = state.orders.find((candidate) => candidate.tableId === tableId && candidate.status === "waiting");
  if (!order) return { state, served: false, message: "That table is clear." };
  if (order.dishId !== state.heldDishId) return { state: { ...state, heldDishId: undefined }, served: false, message: "Wrong dish — that plate goes back." };
  const orders = state.orders.map((candidate) => candidate.id === order.id ? { ...candidate, status: "served" as const } : candidate);
  return { state: { ...state, heldDishId: undefined, servedCount: state.servedCount + 1, orders }, served: true, message: "Served cleanly." };
}

export function calculateWarungRushPerformance(state: WarungRushState): number {
  const served = state.orders.filter((order) => order.status === "served");
  if (!served.length) return 0.35;
  const patience = served.reduce((sum, order) => sum + order.patienceMs / order.maxPatienceMs, 0) / served.length;
  return Math.max(0, Math.min(1, 0.42 + Math.min(0.42, served.length * 0.12) + patience * 0.16 - state.expiredCount * 0.08));
}

function createOrder(index: number, elapsedMs: number): WarungRushOrder {
  return {
    id: `order-${index + 1}`,
    tableId: TABLE_IDS[index % TABLE_IDS.length],
    dishId: DISHES[index % DISHES.length],
    patienceMs: WARUNG_RUSH_FEEL_TUNING.patienceMs,
    maxPatienceMs: WARUNG_RUSH_FEEL_TUNING.patienceMs,
    status: "waiting"
  };
}
